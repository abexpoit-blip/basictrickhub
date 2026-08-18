import { fillTemplate } from "./security";
import { isBotAdmin, tgApi } from "./moderation";
import { getTelegramData, updateTelegramData, pushTgLog } from "./store";
import type { TgMember, TelegramBotData } from "./types";

export type JoinCheck = {
  joined: boolean;
  status?: string;
  chatId?: string;
  error?: string;
  inaccessible?: boolean;
};

const FREE_GROUP_USER = "basictrick";

function normalizeChatRef(v?: string) {
  const s = String(v || "").trim();
  if (!s) return "";
  const n = s.startsWith("@") ? s : s.match(/^-?\d+$/) ? s : s.replace(/^https?:\/\/t\.me\//, "").replace(/^t\.me\//, "");
  if (n.startsWith("@") || n.match(/^-?\d+$/)) return n;
  return `@${n.replace("@", "")}`;
}

function compactName(v?: string) {
  return String(v || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function isFreeCommunityChat(
  chat: { id?: number | string; username?: string; title?: string },
  data: TelegramBotData,
) {
  const username = String(chat.username || "")
    .replace(/^@/, "")
    .toLowerCase();
  if (username === FREE_GROUP_USER) return true;
  const id = String(chat.id || "").trim();
  const stored = String(data.booster.freeGroupId || "").trim();
  if (id && /^-?\d+$/.test(stored) && id === stored) return true;
  const compact = compactName(chat.title);
  if (compact.includes("basictrick")) return true;
  return (data.managedGroups || []).some((g) => {
    if (id && g.chatId && String(g.chatId) === id) {
      return (
        String(g.username || "").replace(/^@/, "") === FREE_GROUP_USER ||
        compactName(g.title).includes("basictrick") ||
        (g.inviteLink || "").includes("t.me/basictrick")
      );
    }
    return false;
  });
}

function isInaccessibleError(desc?: string) {
  return /member list is inaccessible/i.test(desc || "");
}

function isJoinedStatus(status?: string, isMember?: boolean) {
  if (status === "member" || status === "administrator" || status === "creator") return true;
  if (status === "restricted" && isMember !== false) return true;
  return false;
}

function candidateGroupIds(data: TelegramBotData): string[] {
  const ids: string[] = [];
  const push = (v?: string) => {
    const val = normalizeChatRef(v);
    if (val && !ids.includes(val)) ids.push(val);
  };
  push("@basictrick");
  push("basictrick");
  push(data.booster.freeGroupId);
  for (const g of data.managedGroups || []) {
    const looksFree =
      String(g.username || "").replace(/^@/, "") === FREE_GROUP_USER ||
      String(g.chatId || "").includes("basictrick") ||
      (g.inviteLink || "").includes("t.me/basictrick");
    if (!looksFree) continue;
    push(g.chatId);
    if (g.username) push(g.username);
  }
  return ids;
}

export async function markJoined(userId: string, resolvedChatId?: string) {
  await updateTelegramData((d) => {
    const m = d.members.find((x) => x.telegramUserId === userId);
    if (m) m.joinedFreeGroup = true;
    else {
      d.members.push({
        telegramUserId: userId,
        warns: 0,
        banned: false,
        addedGroupIds: [],
        purchasedProductIds: [],
        joinedFreeGroup: true,
        createdAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
      });
    }
    if (resolvedChatId && /^\-?\d+$/.test(resolvedChatId)) {
      d.booster.freeGroupId = resolvedChatId;
    }
    return d;
  });
}

async function isUserGroupAdmin(token: string, chatId: string, uid: number) {
  const admins = await tgApi(token, "getChatAdministrators", { chat_id: chatId });
  if (!admins.ok || !Array.isArray(admins.result)) return false;
  return (admins.result as { user?: { id?: number } }[]).some((a) => Number(a.user?.id) === uid);
}

async function expandCandidates(token: string, data: TelegramBotData): Promise<string[]> {
  const ids = candidateGroupIds(data);
  const out: string[] = [];
  const push = (v?: string | number) => {
    const val = String(v || "").trim();
    if (val && !out.includes(val)) out.push(val);
  };
  for (const chatId of ids) {
    push(chatId);
    const chat = await tgApi(token, "getChat", { chat_id: chatId });
    if (!chat.ok) continue;
    const info = chat.result as
      | { id?: number; username?: string; type?: string; linked_chat_id?: number }
      | undefined;
    if (info?.id) push(String(info.id));
    if (info?.linked_chat_id) push(String(info.linked_chat_id));
  }
  return out;
}

/** Live Telegram check. @basictrick is a CHANNEL — getChatMember needs the bot as admin. */
export async function checkFreeGroupMembership(
  token: string,
  data: TelegramBotData,
  userId: string,
): Promise<JoinCheck> {
  const uid = Number(userId);
  if (!Number.isFinite(uid)) return { joined: false, error: "Invalid user id" };

  if (isBotAdmin(userId, data)) {
    await markJoined(userId);
    return { joined: true, status: "bot-admin" };
  }

  let lastError = "";
  let inaccessible = false;
  let leftOfficial = false;
  let officialStatus = "";
  let isChannel = false;

  for (const chatId of await expandCandidates(token, data)) {
    const chat = await tgApi(token, "getChat", { chat_id: chatId });
    const info = chat.ok
      ? (chat.result as
          | { id?: number; username?: string; type?: string; linked_chat_id?: number }
          | undefined)
      : undefined;
    const target = info?.id ? String(info.id) : chatId;
    const official =
      String(info?.username || "")
        .replace(/^@/, "")
        .toLowerCase() === FREE_GROUP_USER ||
      String(chatId).replace(/^@/, "").toLowerCase() === FREE_GROUP_USER;
    if (info?.type === "channel") isChannel = true;

    if (info?.id && (!data.booster.freeGroupId || !/^-?\d+$/.test(String(data.booster.freeGroupId)))) {
      await updateTelegramData((d) => {
        d.booster.freeGroupId = String(info.id);
        return d;
      });
    }

    const res = await tgApi(token, "getChatMember", {
      chat_id: target,
      user_id: uid,
    });
    if (!res.ok) {
      lastError = res.description || "getChatMember failed";
      if (isInaccessibleError(res.description)) {
        inaccessible = true;
        if (await isUserGroupAdmin(token, target, uid)) {
          await markJoined(userId, info?.id ? String(info.id) : undefined);
          return { joined: true, status: "administrator", chatId: target };
        }
      }
      continue;
    }
    const result = res.result as { status?: string; is_member?: boolean } | undefined;
    if (isJoinedStatus(result?.status, result?.is_member)) {
      await markJoined(userId, info?.id ? String(info.id) : undefined);
      return { joined: true, status: result?.status, chatId: target };
    }
    if (official) {
      leftOfficial = true;
      officialStatus = result?.status || "left";
    }
    lastError = `status:${result?.status || "unknown"}`;
  }

  const live = await getTelegramData();
  const cached = !!live.members.find((m) => m.telegramUserId === userId)?.joinedFreeGroup;
  if (cached && !leftOfficial) return { joined: true, status: "cached" };

  if (leftOfficial) {
    return { joined: false, status: officialStatus || "left" };
  }

  await pushTgLog("warn", `Join check failed for ${userId}: ${lastError || "no chat"}`);
  return {
    joined: false,
    inaccessible,
    error: inaccessible
      ? isChannel
        ? "CHANNEL_BOT_NOT_ADMIN"
        : "MEMBER_LIST_HIDDEN"
      : lastError || "Could not reach @basictrick. Add @basictrickbot as channel admin.",
  };
}

export async function isMemberOfFreeGroup(
  token: string,
  data: TelegramBotData,
  userId: string,
): Promise<boolean> {
  const r = await checkFreeGroupMembership(token, data, userId);
  return r.joined;
}

export function computeAiUnlock(member: TgMember | undefined, data: TelegramBotData) {
  if (!data.premium.enabled) return { unlocked: true, reasons: [] as string[] };
  const reasons: string[] = [];
  const groups = member?.addedGroupIds?.length || 0;
  if (groups < data.premium.minGroupsToUnlockAi) {
    reasons.push(
      `Add bot to ${data.premium.minGroupsToUnlockAi} group(s) (now ${groups})`,
    );
  }
  if (data.premium.requireFreeGroupJoin && !member?.joinedFreeGroup) {
    reasons.push("Join free community group");
  }
  return { unlocked: reasons.length === 0, reasons, groups };
}

export async function sendBoostInvite(
  token: string,
  chatId: number,
  data: TelegramBotData,
  userId: string,
) {
  if (!data.booster.enabled) return;
  const lang = data.config.defaultLang;
  const text = fillTemplate(
    lang === "bn" ? data.booster.boostMessageBn : data.booster.boostMessageEn,
    {
      invite: data.booster.freeGroupInvite,
      group: data.booster.freeGroupTitle,
    },
  );
  await tgApi(token, "sendMessage", {
    chat_id: chatId,
    text,
    reply_markup: {
      inline_keyboard: [
        [{ text: "⚡ Join @basictrick", url: data.booster.freeGroupInvite }],
        [{ text: "✅ Verify", callback_data: "join:verify" }],
      ],
    },
  });
  await updateTelegramData((d) => {
    d.booster.invitesSent += 1;
    const m = d.members.find((x) => x.telegramUserId === userId);
    if (m) m.boostInvitesSent = (m.boostInvitesSent || 0) + 1;
    return d;
  });
  await pushTgLog("info", `Boost invite → ${userId}`);
}

export async function refreshAiUnlock(userId: string) {
  const data = await getTelegramData();
  const member = data.members.find((m) => m.telegramUserId === userId);
  const { unlocked } = computeAiUnlock(member, data);
  await updateTelegramData((d) => {
    const m = d.members.find((x) => x.telegramUserId === userId);
    if (m) m.aiUnlocked = unlocked;
    return d;
  });
  return unlocked;
}

export function premiumLockedMessage(data: TelegramBotData) {
  const lang = data.config.defaultLang;
  return fillTemplate(
    lang === "bn" ? data.premium.lockedMessageBn : data.premium.lockedMessageEn,
    {
      invite: data.booster.freeGroupInvite,
      group: data.booster.freeGroupTitle,
      support: data.config.supportUrl,
    },
  );
}
