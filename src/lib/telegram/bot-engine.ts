import { buildSmartReply } from "./ai-brain";
import {
  computeAiUnlock,
  isMemberOfFreeGroup,
  premiumLockedMessage,
  refreshAiUnlock,
  sendBoostInvite,
} from "./booster";
import { matchKeyword } from "./keywords";
import {
  applyPunish,
  escalateWarn,
  isBotAdmin,
  memberActiveMute,
  restrictChatMember,
  sendLog,
  tgApi,
  unrestrictChatMember,
} from "./moderation";
import { createPlisioInvoice, createZiniPayInvoice } from "./payments";
import {
  checkAntiRaid,
  checkFlood,
  detectLockedContent,
  fillTemplate,
  hitBlacklist,
  parseDurationToSeconds,
} from "./security";
import { getTelegramData, pushTgLog, updateTelegramData } from "./store";
import type { BotProductType, TelegramBotData } from "./types";

type TgUser = { id: number; username?: string; first_name?: string; is_bot?: boolean };

type TgMessage = {
  message_id: number;
  text?: string;
  caption?: string;
  chat: { id: number; type: string; title?: string };
  from?: TgUser;
  reply_to_message?: TgMessage;
  new_chat_members?: TgUser[];
  left_chat_member?: TgUser;
  forward_date?: number;
  sticker?: unknown;
  animation?: unknown;
  photo?: unknown;
  video?: unknown;
  audio?: unknown;
  voice?: unknown;
  document?: unknown;
  contact?: unknown;
  location?: unknown;
  poll?: unknown;
  game?: unknown;
  via_bot?: unknown;
  reply_markup?: unknown;
};

type TgUpdate = {
  update_id?: number;
  message?: TgMessage;
  callback_query?: {
    id: string;
    data?: string;
    from: TgUser;
    message?: { chat: { id: number }; message_id: number };
  };
  my_chat_member?: {
    chat: { id: number; title?: string; type: string };
    from: TgUser;
    new_chat_member: { status: string; user: TgUser };
    old_chat_member?: { status: string };
  };
};

function kb(rows: { text: string; url?: string; callback_data?: string }[][]) {
  return {
    inline_keyboard: rows.map((row) =>
      row.map((b) =>
        b.url
          ? { text: b.text, url: b.url }
          : { text: b.text, callback_data: b.callback_data },
      ),
    ),
  };
}

async function sendStoreCatalog(
  token: string,
  chatId: number,
  data: TelegramBotData,
  typeFilter?: BotProductType,
) {
  const products = data.products
    .filter((p) => p.isActive && (!typeFilter || p.type === typeFilter))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  if (!products.length) {
    await tgApi(token, "sendMessage", { chat_id: chatId, text: "No products yet." });
    return;
  }
  const lines = products
    .map(
      (p, i) =>
        `${i + 1}. *${p.name}*\n${p.description}\n💰 ${p.priceBdt} BDT / $${p.priceUsd}`,
    )
    .join("\n\n");
  const buttons = products.flatMap((p) => [
    [{ text: `ZiniPay · ${p.name}`.slice(0, 60), callback_data: `buy:${p.id}:zinipay` }],
    [{ text: `Plisio · ${p.name}`.slice(0, 60), callback_data: `buy:${p.id}:plisio` }],
  ]);
  await tgApi(token, "sendMessage", {
    chat_id: chatId,
    text: `🛍️ *Basictrick Store*\n\n${lines}`,
    parse_mode: "Markdown",
    reply_markup: kb(buttons),
  });
}

function resolveTarget(msg: TgMessage, args: string[]): string | null {
  if (msg.reply_to_message?.from?.id) return String(msg.reply_to_message.from.id);
  const mention = args[0];
  if (!mention) return null;
  if (/^\d+$/.test(mention)) return mention;
  return null;
}

async function upsertMember(from: TgUser) {
  const userId = String(from.id);
  await updateTelegramData((d) => {
    let member = d.members.find((m) => m.telegramUserId === userId);
    if (!member) {
      d.members.push({
        telegramUserId: userId,
        username: from.username,
        firstName: from.first_name,
        warns: 0,
        banned: false,
        addedGroupIds: [],
        purchasedProductIds: [],
        createdAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
      });
    } else {
      member.lastSeenAt = new Date().toISOString();
      member.username = from.username || member.username;
      member.firstName = from.first_name || member.firstName;
      member.addedGroupIds = member.addedGroupIds || [];
    }
    return d;
  });
}

async function sendAiStatus(token: string, chatId: number, userId: string) {
  const data = await getTelegramData();
  if (data.booster.freeGroupId) {
    await isMemberOfFreeGroup(token, data, userId);
  }
  const fresh = await getTelegramData();
  const member = fresh.members.find((m) => m.telegramUserId === userId);
  const status = computeAiUnlock(member, fresh);
  await refreshAiUnlock(userId);
  const lang = fresh.config.defaultLang;
  const text = status.unlocked
    ? lang === "bn"
      ? fresh.premium.unlockedMessageBn
      : fresh.premium.unlockedMessageEn
    : `${premiumLockedMessage(fresh)}\n\n📊 Groups: ${status.groups}/${fresh.premium.minGroupsToUnlockAi}\nFree group: ${member?.joinedFreeGroup ? "✅" : "❌"}\nMissing:\n- ${status.reasons.join("\n- ")}`;

  await tgApi(token, "sendMessage", {
    chat_id: chatId,
    text: `${fresh.premium.premiumBadge}\n${text}`,
    reply_markup: kb([
      [{ text: "🚀 Join Free Group", url: fresh.booster.freeGroupInvite }],
      [{ text: "How to add bot", callback_data: "menu:howtoadd" }],
    ]),
  });
}

async function assertPremiumAi(
  token: string,
  chatId: number,
  userId: string,
  admin: boolean,
): Promise<boolean> {
  const data = await getTelegramData();
  if (!data.premium.enabled || admin) return true;
  if (data.booster.freeGroupId) await isMemberOfFreeGroup(token, data, userId);
  const fresh = await getTelegramData();
  const member = fresh.members.find((m) => m.telegramUserId === userId);
  const { unlocked } = computeAiUnlock(member, fresh);
  if (!unlocked) {
    await tgApi(token, "sendMessage", {
      chat_id: chatId,
      text: premiumLockedMessage(fresh),
      reply_markup: kb([
        [{ text: "🚀 Join Free Group", url: fresh.booster.freeGroupInvite }],
        [{ text: "✦ AI Status", callback_data: "menu:aistatus" }],
      ]),
    });
    return false;
  }
  return true;
}

export async function processTelegramUpdate(update: TgUpdate) {
  const data = await getTelegramData();
  if (!data.config.enabled) return { ok: true, skipped: "disabled" };
  const token = data.config.botToken;
  if (!token) {
    await pushTgLog("error", "Bot token missing — set it in Telegram Admin");
    return { ok: false, error: "no token" };
  }

  // Track when users add bot to their groups (premium unlock)
  if (update.my_chat_member) {
    const ev = update.my_chat_member;
    const status = ev.new_chat_member.status;
    const chatId = String(ev.chat.id);
    const adder = String(ev.from.id);
    if (["member", "administrator"].includes(status)) {
      await updateTelegramData((d) => {
        let g = d.managedGroups.find((x) => x.chatId === chatId);
        if (!g) {
          g = {
            chatId,
            title: ev.chat.title || chatId,
            type: ev.chat.type,
            addedByUserId: adder,
            isActive: true,
            pending: false,
            createdAt: new Date().toISOString(),
          };
          d.managedGroups.push(g);
        } else {
          g.isActive = true;
          g.pending = false;
          g.title = ev.chat.title || g.title;
          g.addedByUserId = adder;
        }
        let m = d.members.find((x) => x.telegramUserId === adder);
        if (!m) {
          m = {
            telegramUserId: adder,
            username: ev.from.username,
            firstName: ev.from.first_name,
            warns: 0,
            banned: false,
            addedGroupIds: [],
            purchasedProductIds: [],
            createdAt: new Date().toISOString(),
            lastSeenAt: new Date().toISOString(),
          };
          d.members.push(m);
        }
        if (!m.addedGroupIds.includes(chatId)) m.addedGroupIds.push(chatId);
        return d;
      });
      await refreshAiUnlock(adder);
      await pushTgLog("info", `Bot added to ${ev.chat.title || chatId} by ${adder}`);
      await tgApi(token, "sendMessage", {
        chat_id: ev.from.id,
        text:
          data.config.defaultLang === "bn"
            ? `✅ গ্রুপে বট অ্যাড হয়েছে: ${ev.chat.title || chatId}\nAI আনলক চেক: /aistatus`
            : `✅ Bot added to: ${ev.chat.title || chatId}\nCheck AI unlock: /aistatus`,
      });
    } else if (["left", "kicked"].includes(status)) {
      await updateTelegramData((d) => {
        const g = d.managedGroups.find((x) => x.chatId === chatId);
        if (g) g.isActive = false;
        return d;
      });
    }
    return { ok: true };
  }

  // Join / leave
  if (update.message?.new_chat_members?.length) {
    const chatId = update.message.chat.id;
    const raid = checkAntiRaid(String(chatId), data.security);
    if (raid.raid) {
      for (const m of update.message.new_chat_members) {
        await tgApi(token, "banChatMember", { chat_id: chatId, user_id: m.id });
      }
      return { ok: true, raid: true };
    }

    for (const m of update.message.new_chat_members) {
      if (m.is_bot && data.security.locks.bot) {
        await tgApi(token, "banChatMember", { chat_id: chatId, user_id: m.id });
        continue;
      }
      await upsertMember(m);
      await updateTelegramData((d) => {
        const mem = d.members.find((x) => x.telegramUserId === String(m.id));
        if (mem && (d.security.captchaOnJoin || d.security.approvalMode)) {
          mem.captchaPending = true;
          mem.captchaJoinedAt = new Date().toISOString();
          mem.approved = false;
        }
        // track free group joins for booster
        if (d.booster.freeGroupId && String(chatId) === d.booster.freeGroupId) {
          if (mem) {
            mem.joinedFreeGroup = true;
            d.booster.joinsTracked += 1;
          }
        }
        return d;
      });

      if (data.security.captchaMuteUntilPass || data.security.approvalMode) {
        await restrictChatMember(token, chatId, m.id);
      }

      if (data.security.welcomeEnabled) {
        const tpl =
          data.config.defaultLang === "bn"
            ? data.security.welcomeMessageBn
            : data.security.welcomeMessageEn;
        const buttons = [];
        if (data.security.captchaOnJoin) {
          buttons.push([{ text: "✅ I'm human", callback_data: `captcha:${m.id}` }]);
        }
        if (data.booster.enabled) {
          buttons.push([{ text: "🚀 Free Group", url: data.booster.freeGroupInvite }]);
        }
        await tgApi(token, "sendMessage", {
          chat_id: chatId,
          text: fillTemplate(tpl, {
            name: m.first_name || m.username || "member",
            support: data.config.supportUrl,
            first: m.first_name || "member",
          }),
          reply_markup: buttons.length ? kb(buttons) : undefined,
        });
      }

      if (data.booster.enabled && data.booster.autoSendInviteOnJoin) {
        try {
          await sendBoostInvite(token, m.id, data, String(m.id));
        } catch {
          /* DM may fail if user never started bot */
        }
      }
    }

    if (data.security.cleanService) {
      await tgApi(token, "deleteMessage", {
        chat_id: chatId,
        message_id: update.message.message_id,
      });
    }
    return { ok: true };
  }

  if (update.message?.left_chat_member) {
    const left = update.message.left_chat_member;
    if (data.security.goodbyeEnabled) {
      await tgApi(token, "sendMessage", {
        chat_id: update.message.chat.id,
        text: fillTemplate(data.security.goodbyeMessage, {
          name: left.first_name || left.username || "member",
        }),
      });
    }
    if (data.security.cleanService) {
      await tgApi(token, "deleteMessage", {
        chat_id: update.message.chat.id,
        message_id: update.message.message_id,
      });
    }
    return { ok: true };
  }

  // Callbacks
  if (update.callback_query) {
    const cb = update.callback_query;
    const payload = cb.data || "";
    const chatId = cb.message?.chat.id;
    await tgApi(token, "answerCallbackQuery", { callback_query_id: cb.id });

    if (payload === "menu:aistatus" && chatId) {
      await sendAiStatus(token, chatId, String(cb.from.id));
      return { ok: true };
    }
    if (payload === "menu:howtoadd" && chatId) {
      await tgApi(token, "sendMessage", {
        chat_id: chatId,
        text:
          data.config.defaultLang === "bn"
            ? `📌 বট অ্যাড করার নিয়ম:\n1) আপনার গ্রুপে যান\n2) Add members → @${data.config.botUsername}\n3) Admin দিন (Delete + Ban)\n4) /aistatus চেক করুন`
            : `📌 Add bot:\n1) Open your group\n2) Add @${data.config.botUsername}\n3) Grant Delete + Ban admin\n4) Check /aistatus`,
      });
      return { ok: true };
    }
    if (payload === "menu:boost" && chatId) {
      await sendBoostInvite(token, chatId, data, String(cb.from.id));
      return { ok: true };
    }

    if (payload.startsWith("captcha:") && chatId) {
      const uid = payload.split(":")[1];
      if (String(cb.from.id) !== uid && !isBotAdmin(String(cb.from.id), data)) return { ok: true };
      await updateTelegramData((d) => {
        const m = d.members.find((x) => x.telegramUserId === uid);
        if (m) {
          m.captchaPending = false;
          m.approved = true;
        }
        return d;
      });
      await unrestrictChatMember(token, chatId, uid);
      await tgApi(token, "sendMessage", {
        chat_id: chatId,
        text: "✅ Verified. Welcome!",
      });
      return { ok: true };
    }

    if (payload.startsWith("approve:") && chatId) {
      if (!isBotAdmin(String(cb.from.id), data)) return { ok: true };
      const uid = payload.split(":")[1];
      await updateTelegramData((d) => {
        const m = d.members.find((x) => x.telegramUserId === uid);
        if (m) {
          m.captchaPending = false;
          m.approved = true;
        }
        return d;
      });
      await unrestrictChatMember(token, chatId, uid);
      return { ok: true };
    }

    if (payload === "menu:shop" && chatId) {
      await sendStoreCatalog(token, chatId, data);
      return { ok: true };
    }
    if (payload === "menu:vip" && chatId) {
      await sendStoreCatalog(token, chatId, data, "vip");
      return { ok: true };
    }
    if (payload === "menu:course" && chatId) {
      await sendStoreCatalog(token, chatId, data, "course");
      return { ok: true };
    }
    if (payload === "menu:tools" && chatId) {
      await sendStoreCatalog(token, chatId, data, "tool");
      return { ok: true };
    }

    if (payload.startsWith("buy:")) {
      const [, productId, gateway] = payload.split(":");
      const product = data.products.find((p) => p.id === productId && p.isActive);
      if (!product) {
        await tgApi(token, "sendMessage", { chat_id: chatId, text: "Product not found." });
        return { ok: true };
      }
      const order =
        gateway === "plisio"
          ? await createPlisioInvoice({
              product,
              telegramUserId: String(cb.from.id),
              telegramUsername: cb.from.username,
            })
          : await createZiniPayInvoice({
              product,
              telegramUserId: String(cb.from.id),
              telegramUsername: cb.from.username,
              currency: "BDT",
            });
      await tgApi(token, "sendMessage", {
        chat_id: chatId,
        text: `🧾 Order ${order.id}\n${product.name}\nAmount: ${order.amount} ${order.currency}\nGateway: ${order.gateway}`,
        reply_markup: order.paymentUrl
          ? kb([[{ text: "💳 Pay now", url: order.paymentUrl }]])
          : undefined,
      });
      return { ok: true };
    }
    return { ok: true };
  }

  const msg = update.message;
  if (!msg?.from) return { ok: true };
  const userId = String(msg.from.id);
  const text = (msg.text || msg.caption || "").trim();
  const chatId = msg.chat.id;
  const admin = isBotAdmin(userId, data);

  await upsertMember(msg.from);

  // Register group if bot sees messages there
  if (msg.chat.type !== "private") {
    await updateTelegramData((d) => {
      let g = d.managedGroups.find((x) => x.chatId === String(chatId));
      if (!g) {
        d.managedGroups.push({
          chatId: String(chatId),
          title: msg.chat.title || String(chatId),
          type: msg.chat.type,
          isActive: true,
          createdAt: new Date().toISOString(),
        });
      } else {
        g.isActive = true;
        g.title = msg.chat.title || g.title;
      }
      return d;
    });
  }

  const fresh = await getTelegramData();
  const member = fresh.members.find((m) => m.telegramUserId === userId);

  if (member?.banned) {
    await tgApi(token, "deleteMessage", { chat_id: chatId, message_id: msg.message_id });
    return { ok: true };
  }
  if (memberActiveMute(member) && !admin) {
    await tgApi(token, "deleteMessage", { chat_id: chatId, message_id: msg.message_id });
    return { ok: true };
  }
  if ((member?.captchaPending || (fresh.security.approvalMode && !member?.approved)) && !admin) {
    await tgApi(token, "deleteMessage", { chat_id: chatId, message_id: msg.message_id });
    return { ok: true };
  }
  if (fresh.security.nightMode && fresh.security.nightMuteAll && !admin) {
    await tgApi(token, "deleteMessage", { chat_id: chatId, message_id: msg.message_id });
    return { ok: true };
  }

  if (!admin) {
    const locked = detectLockedContent(
      {
        text,
        forward_date: msg.forward_date,
        sticker: !!msg.sticker,
        animation: !!msg.animation,
        photo: !!msg.photo,
        video: !!msg.video,
        audio: !!msg.audio,
        voice: !!msg.voice,
        document: !!msg.document,
        contact: !!msg.contact,
        location: !!msg.location,
        poll: !!msg.poll,
        game: !!msg.game,
        via_bot: !!msg.via_bot,
        reply_markup: !!msg.reply_markup,
      },
      fresh.security.locks,
      fresh.security,
    );
    if (locked) {
      await tgApi(token, "deleteMessage", { chat_id: chatId, message_id: msg.message_id });
      await tgApi(token, "sendMessage", { chat_id: chatId, text: `🔒 Locked: ${locked}` });
      return { ok: true, locked };
    }
  }

  if (!admin) {
    const flood = checkFlood(userId, fresh.security);
    if (flood.blocked) {
      await tgApi(token, "deleteMessage", { chat_id: chatId, message_id: msg.message_id });
      await applyPunish({
        token,
        data: fresh,
        chatId,
        userId,
        mode: fresh.security.floodMode === "delete" ? "tmute" : fresh.security.floodMode,
        muteMinutes: fresh.security.floodMuteMinutes,
        reason: `flood ${flood.count}`,
      });
      return { ok: true };
    }
  }

  if (text && !admin) {
    const bad = hitBlacklist(text, fresh.security);
    if (bad) {
      if (fresh.security.deleteBlacklistHits) {
        await tgApi(token, "deleteMessage", { chat_id: chatId, message_id: msg.message_id });
      }
      if (fresh.security.blacklistMode === "warn") {
        const r = await escalateWarn(token, fresh, chatId, userId, `blacklist:${bad}`);
        await tgApi(token, "sendMessage", {
          chat_id: chatId,
          text: `🚫 Blacklist ("${bad}"). Warn ${r.warns}/${fresh.security.maxWarns}`,
        });
      } else {
        await applyPunish({
          token,
          data: fresh,
          chatId,
          userId,
          mode: fresh.security.blacklistMode,
          muteMinutes: fresh.security.warnMuteMinutes,
          reason: `blacklist:${bad}`,
        });
      }
      return { ok: true };
    }
  }

  const parts = text.split(/\s+/);
  const cmd = parts[0]?.toLowerCase().split("@")[0] || "";
  const args = parts.slice(1);

  // Admin rose commands (same as before — condensed handlers)
  if (admin && cmd) {
    if (["/ban", "/tban", "/kick", "/mute", "/tmute"].includes(cmd)) {
      const target = resolveTarget(msg, args);
      if (!target) {
        await tgApi(token, "sendMessage", {
          chat_id: chatId,
          text: "Reply to user or pass numeric ID.",
        });
        return { ok: true };
      }
      const dur = parseDurationToSeconds(args.find((a) => /^\d+[smhdw]?$/i.test(a)));
      const minutes = dur ? Math.max(1, Math.floor(dur / 60)) : fresh.security.warnMuteMinutes;
      const mode =
        cmd === "/ban"
          ? "ban"
          : cmd === "/tban"
            ? "tban"
            : cmd === "/kick"
              ? "kick"
              : cmd === "/mute"
                ? "mute"
                : "tmute";
      await applyPunish({
        token,
        data: fresh,
        chatId,
        userId: target,
        mode,
        muteMinutes: minutes,
        reason: `admin ${cmd}`,
      });
      await tgApi(token, "sendMessage", { chat_id: chatId, text: `✅ ${cmd} → ${target}` });
      return { ok: true };
    }
    if (cmd === "/unban") {
      const target = resolveTarget(msg, args);
      if (!target) return { ok: true };
      await tgApi(token, "unbanChatMember", {
        chat_id: chatId,
        user_id: Number(target),
        only_if_banned: true,
      });
      await updateTelegramData((d) => {
        const m = d.members.find((x) => x.telegramUserId === target);
        if (m) m.banned = false;
        return d;
      });
      return { ok: true };
    }
    if (cmd === "/unmute") {
      const target = resolveTarget(msg, args);
      if (!target) return { ok: true };
      await unrestrictChatMember(token, chatId, target);
      await updateTelegramData((d) => {
        const m = d.members.find((x) => x.telegramUserId === target);
        if (m) m.mutedUntil = undefined;
        return d;
      });
      return { ok: true };
    }
    if (cmd === "/warn") {
      const target = resolveTarget(msg, args);
      if (!target) return { ok: true };
      const r = await escalateWarn(token, fresh, chatId, target, "admin warn");
      await tgApi(token, "sendMessage", {
        chat_id: chatId,
        text: `⚠️ Warn ${r.warns}/${fresh.security.maxWarns}`,
      });
      return { ok: true };
    }
    if (cmd === "/warns") {
      const target = resolveTarget(msg, args) || userId;
      const m = (await getTelegramData()).members.find((x) => x.telegramUserId === target);
      await tgApi(token, "sendMessage", {
        chat_id: chatId,
        text: `Warns ${target}: ${m?.warns || 0}`,
      });
      return { ok: true };
    }
    if (cmd === "/resetwarn" || cmd === "/rmwarn") {
      const target = resolveTarget(msg, args);
      if (!target) return { ok: true };
      await updateTelegramData((d) => {
        const m = d.members.find((x) => x.telegramUserId === target);
        if (m) m.warns = cmd === "/resetwarn" ? 0 : Math.max(0, m.warns - 1);
        return d;
      });
      return { ok: true };
    }
    if (cmd === "/purge") {
      const n = Math.min(50, Math.max(1, Number(args[0]) || 10));
      for (let i = 0; i < n; i++) {
        await tgApi(token, "deleteMessage", {
          chat_id: chatId,
          message_id: msg.message_id - i,
        });
      }
      return { ok: true };
    }
    if (cmd === "/del" && msg.reply_to_message) {
      await tgApi(token, "deleteMessage", {
        chat_id: chatId,
        message_id: msg.reply_to_message.message_id,
      });
      await tgApi(token, "deleteMessage", { chat_id: chatId, message_id: msg.message_id });
      return { ok: true };
    }
    if (cmd === "/pin" && msg.reply_to_message) {
      await tgApi(token, "pinChatMessage", {
        chat_id: chatId,
        message_id: msg.reply_to_message.message_id,
      });
      return { ok: true };
    }
    if (cmd === "/unpin") {
      await tgApi(token, "unpinChatMessage", { chat_id: chatId });
      return { ok: true };
    }
    if (cmd === "/lock" || cmd === "/unlock") {
      const key = (args[0] || "").toLowerCase() as keyof typeof fresh.security.locks;
      if (!(key in fresh.security.locks)) {
        await tgApi(token, "sendMessage", {
          chat_id: chatId,
          text: `Usage: ${cmd} <${Object.keys(fresh.security.locks).join("|")}>`,
        });
        return { ok: true };
      }
      await updateTelegramData((d) => {
        d.security.locks[key] = cmd === "/lock";
        return d;
      });
      await tgApi(token, "sendMessage", {
        chat_id: chatId,
        text: `${cmd === "/lock" ? "🔒" : "🔓"} ${key}`,
      });
      return { ok: true };
    }
    if (cmd === "/locks") {
      const lines = Object.entries(fresh.security.locks)
        .map(([k, v]) => `${v ? "🔒" : "🔓"} ${k}`)
        .join("\n");
      await tgApi(token, "sendMessage", { chat_id: chatId, text: lines });
      return { ok: true };
    }
    if (cmd === "/flood") {
      await tgApi(token, "sendMessage", {
        chat_id: chatId,
        text: `Flood ${fresh.security.floodMaxMessages}/${fresh.security.floodWindowSec}s → ${fresh.security.floodMode}`,
      });
      return { ok: true };
    }
    if (cmd === "/setwelcome") {
      const body = args.join(" ");
      if (body) {
        await updateTelegramData((d) => {
          if (d.config.defaultLang === "bn") d.security.welcomeMessageBn = body;
          else d.security.welcomeMessageEn = body;
          return d;
        });
      }
      return { ok: true };
    }
    if (cmd === "/setrules") {
      const body = args.join(" ") || msg.reply_to_message?.text;
      if (body) {
        await updateTelegramData((d) => {
          d.security.rulesText = body;
          return d;
        });
      }
      return { ok: true };
    }
    if (cmd === "/save" || cmd === "/setnote") {
      const name = args[0]?.toLowerCase();
      const content = args.slice(1).join(" ") || msg.reply_to_message?.text;
      if (name && content) {
        await updateTelegramData((d) => {
          const existing = d.notes.find((n) => n.name === name);
          if (existing) existing.content = content;
          else d.notes.push({ id: `note-${Date.now()}`, name, content, isActive: true });
          return d;
        });
        await tgApi(token, "sendMessage", { chat_id: chatId, text: `✅ Note #${name}` });
      }
      return { ok: true };
    }
    if (cmd === "/approve") {
      const target = resolveTarget(msg, args);
      if (!target) return { ok: true };
      await updateTelegramData((d) => {
        const m = d.members.find((x) => x.telegramUserId === target);
        if (m) {
          m.approved = true;
          m.captchaPending = false;
        }
        return d;
      });
      await unrestrictChatMember(token, chatId, target);
      return { ok: true };
    }
    if (cmd === "/night") {
      const on = (args[0] || "").toLowerCase() === "on";
      await updateTelegramData((d) => {
        d.security.nightMode = on;
        d.security.nightMuteAll = on;
        return d;
      });
      await tgApi(token, "sendMessage", {
        chat_id: chatId,
        text: on ? "🌙 Night ON" : "☀️ Night OFF",
      });
      return { ok: true };
    }
  }

  // Public commands
  if (cmd === "/start" || cmd === "/help") {
    if (fresh.booster.enabled && fresh.booster.autoSendInviteOnStart) {
      // invite after welcome
    }
    const helpAdmin = admin
      ? `\n\n🛡 Admin: /ban /mute /warn /purge /lock /save /night`
      : "";
    await tgApi(token, "sendMessage", {
      chat_id: chatId,
      text:
        `${fresh.premium.premiumBadge}\n` +
        (fresh.config.defaultLang === "bn"
          ? `🤖 ${fresh.ai.personaName}\n\n/shop /vip /course /tools\n/boost — ফ্রি গ্রুপ\n/aistatus — Premium AI\n/rules /id /get <note>\n\nস্মার্ট চ্যাট: facebook id, দাম, কিনব…`
          : `🤖 ${fresh.ai.personaName}\n\n/shop /vip /course /tools\n/boost — free group\n/aistatus — Premium AI\n/rules /id /get <note>\n\nSmart chat: facebook id, price, buy…`) +
        helpAdmin,
      reply_markup: kb([
        [
          { text: "🛒 Shop", callback_data: "menu:shop" },
          { text: "⭐ VIP", callback_data: "menu:vip" },
        ],
        [
          { text: "🚀 Boost", callback_data: "menu:boost" },
          { text: "✦ AI Status", callback_data: "menu:aistatus" },
        ],
        [
          {
            text: "Official Sell Bot",
            url: `https://t.me/${fresh.config.salesBotUsername.replace("@", "")}`,
          },
        ],
      ]),
    });
    if (fresh.booster.enabled && fresh.booster.autoSendInviteOnStart) {
      await sendBoostInvite(token, chatId, fresh, userId);
    }
    return { ok: true };
  }

  if (cmd === "/boost") {
    await sendBoostInvite(token, chatId, fresh, userId);
    return { ok: true };
  }

  if (cmd === "/aistatus") {
    await sendAiStatus(token, chatId, userId);
    return { ok: true };
  }

  if (cmd === "/id") {
    await tgApi(token, "sendMessage", {
      chat_id: chatId,
      text: `🪪 ID: \`${userId}\`\nChat: \`${chatId}\`\n@${msg.from.username || "none"}`,
      parse_mode: "Markdown",
    });
    return { ok: true };
  }

  if (cmd === "/rules") {
    await tgApi(token, "sendMessage", { chat_id: chatId, text: fresh.security.rulesText });
    return { ok: true };
  }

  if (cmd === "/get" || cmd === "/note") {
    const name = args[0]?.toLowerCase();
    const note = fresh.notes.find((n) => n.isActive && n.name === name);
    await tgApi(token, "sendMessage", {
      chat_id: chatId,
      text: note ? note.content : `Notes: ${fresh.notes.map((n) => n.name).join(", ")}`,
    });
    return { ok: true };
  }

  if (cmd === "/notes") {
    await tgApi(token, "sendMessage", {
      chat_id: chatId,
      text: fresh.notes.filter((n) => n.isActive).map((n) => `#${n.name}`).join("\n") || "none",
    });
    return { ok: true };
  }

  if (cmd === "/report" && fresh.security.reportEnabled) {
    await sendLog(
      token,
      fresh,
      `REPORT chat=${chatId} by=${userId} msg=${msg.reply_to_message?.message_id || "-"}`,
    );
    await tgApi(token, "sendMessage", { chat_id: chatId, text: "🚨 Report sent to admins." });
    return { ok: true };
  }

  if (cmd === "/shop" || cmd === "/vip" || cmd === "/course" || cmd === "/tools") {
    const typeFilter: BotProductType | undefined =
      cmd === "/vip" ? "vip" : cmd === "/course" ? "course" : cmd === "/tools" ? "tool" : undefined;
    await sendStoreCatalog(token, chatId, fresh, typeFilter);
    return { ok: true };
  }

  if (text.startsWith("#")) {
    const name = text.slice(1).split(/\s+/)[0]?.toLowerCase();
    const note = fresh.notes.find((n) => n.isActive && n.name === name);
    if (note) {
      await tgApi(token, "sendMessage", { chat_id: chatId, text: note.content });
      return { ok: true };
    }
  }

  // Smart AI replies — keyword sales always open; general AI premium-gated
  if (text && !text.startsWith("/")) {
    const kwHit = matchKeyword(text, fresh.keywords);
    if (kwHit) {
      const smart = buildSmartReply(text, fresh);
      if (smart) {
        await tgApi(token, "sendMessage", {
          chat_id: chatId,
          text: `${fresh.premium.premiumBadge}\n${smart.text}`,
          reply_markup: kb([
            smart.buttonUrl && smart.buttonText
              ? [{ text: smart.buttonText, url: smart.buttonUrl }]
              : [{ text: "🛒 Shop", callback_data: "menu:shop" }],
            [{ text: "🚀 Boost", callback_data: "menu:boost" }],
          ].filter(Boolean) as { text: string; url?: string; callback_data?: string }[][]),
        });
        return { ok: true, ai: "keyword" };
      }
    }

    const allowed = await assertPremiumAi(token, chatId, userId, admin);
    if (!allowed) return { ok: true, lockedAi: true };

    const smart = buildSmartReply(text, fresh);
    if (smart) {
      const rows: { text: string; url?: string; callback_data?: string }[][] = [];
      if (smart.buttonUrl && smart.buttonText) {
        rows.push([{ text: smart.buttonText, url: smart.buttonUrl }]);
      }
      if (
        smart.action === "shop" ||
        smart.action === "vip" ||
        smart.action === "tools" ||
        smart.action === "course"
      ) {
        rows.push([
          {
            text: "🛒 Open Store",
            callback_data: `menu:${smart.action === "shop" ? "shop" : smart.action}`,
          },
        ]);
      }
      if (smart.action === "boost") {
        rows.push([{ text: "🚀 Boost", callback_data: "menu:boost" }]);
      }
      rows.push([{ text: "✦ AI Status", callback_data: "menu:aistatus" }]);

      await tgApi(token, "sendMessage", {
        chat_id: chatId,
        text: `${fresh.premium.premiumBadge}\n${smart.text}`,
        reply_markup: kb(rows),
      });
      await pushTgLog("info", `AI ${smart.action} ← ${userId}: ${text.slice(0, 60)}`);
      return { ok: true, ai: smart.action };
    }
  }

  return { ok: true };
}

export async function setTelegramWebhook(publicUrl: string) {
  const data = await getTelegramData();
  const token = data.config.botToken;
  if (!token) throw new Error("Bot token required");
  const url = `${publicUrl.replace(/\/$/, "")}/api/telegram/webhook?secret=${data.config.webhookSecret}`;
  const res = await tgApi(token, "setWebhook", {
    url,
    allowed_updates: ["message", "callback_query", "my_chat_member", "chat_member"],
    drop_pending_updates: true,
  });
  await pushTgLog("info", `Webhook set → ${url}`);
  return { url, result: res };
}

export async function getTelegramBotInfo() {
  const data = await getTelegramData();
  const token = data.config.botToken;
  if (!token) throw new Error("Bot token required");
  const me = await tgApi(token, "getMe", {});
  const wh = await tgApi(token, "getWebhookInfo", {});
  return { me, webhook: wh, expectedSecret: data.config.webhookSecret };
}

export async function deleteTelegramWebhook() {
  const data = await getTelegramData();
  const token = data.config.botToken;
  if (!token) throw new Error("Bot token required");
  return tgApi(token, "deleteWebhook", { drop_pending_updates: true });
}
