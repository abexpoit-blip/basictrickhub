import type { PunishMode, TgMember, TelegramBotData } from "./types";
import { untilIso } from "./security";
import { pushTgLog, updateTelegramData } from "./store";

export async function tgApi(token: string, method: string, body: Record<string, unknown>) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<{ ok: boolean; result?: unknown; description?: string }>;
}

export async function sendLog(
  token: string,
  data: TelegramBotData,
  text: string,
) {
  const ch = data.security.logChannelId?.trim();
  if (!ch) return;
  try {
    await tgApi(token, "sendMessage", { chat_id: ch, text: `🛡 ${text}` });
  } catch {
    /* ignore */
  }
}

export function isBotAdmin(userId: string, data: TelegramBotData) {
  const id = String(userId || "").trim();
  if (!id) return false;
  return (data.config.adminIds || [])
    .map((x) => String(x).trim())
    .filter(Boolean)
    .includes(id);
}

export async function restrictChatMember(
  token: string,
  chatId: number | string,
  userId: number | string,
  untilDateSec?: number,
) {
  return tgApi(token, "restrictChatMember", {
    chat_id: chatId,
    user_id: Number(userId),
    permissions: {
      can_send_messages: false,
      can_send_audios: false,
      can_send_documents: false,
      can_send_photos: false,
      can_send_videos: false,
      can_send_video_notes: false,
      can_send_voice_notes: false,
      can_send_polls: false,
      can_send_other_messages: false,
      can_add_web_page_previews: false,
    },
    until_date: untilDateSec || 0,
  });
}

export async function unrestrictChatMember(
  token: string,
  chatId: number | string,
  userId: number | string,
) {
  return tgApi(token, "restrictChatMember", {
    chat_id: chatId,
    user_id: Number(userId),
    permissions: {
      can_send_messages: true,
      can_send_audios: true,
      can_send_documents: true,
      can_send_photos: true,
      can_send_videos: true,
      can_send_video_notes: true,
      can_send_voice_notes: true,
      can_send_polls: true,
      can_send_other_messages: true,
      can_add_web_page_previews: true,
      can_invite_users: true,
    },
  });
}

export async function applyPunish(opts: {
  token: string;
  data: TelegramBotData;
  chatId: number;
  userId: string;
  mode: PunishMode;
  muteMinutes?: number;
  reason?: string;
}) {
  const { token, chatId, userId, mode } = opts;
  const minutes = opts.muteMinutes ?? 10;
  const reason = opts.reason || mode;

  await updateTelegramData((d) => {
    let m = d.members.find((x) => x.telegramUserId === userId);
    if (!m) {
      m = {
        telegramUserId: userId,
        warns: 0,
        banned: false,
        addedGroupIds: [],
        purchasedProductIds: [],
        createdAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
      };
      d.members.push(m);
    }
    if (mode === "warn") m.warns += 1;
    if (mode === "mute" || mode === "tmute") {
      m.mutedUntil = mode === "mute" ? untilIso(365 * 24 * 60) : untilIso(minutes);
    }
    if (mode === "ban" || mode === "tban") {
      m.banned = true;
      m.banUntil = mode === "tban" ? untilIso(minutes) : undefined;
    }
    if (mode === "kick") {
      // kick = ban then unban
    }
    return d;
  });

  if (mode === "mute" || mode === "tmute") {
    const until = mode === "mute" ? 0 : Math.floor(Date.now() / 1000) + minutes * 60;
    await restrictChatMember(token, chatId, userId, until || undefined);
  } else if (mode === "ban" || mode === "tban") {
    await tgApi(token, "banChatMember", {
      chat_id: chatId,
      user_id: Number(userId),
      until_date:
        mode === "tban" ? Math.floor(Date.now() / 1000) + minutes * 60 : undefined,
    });
  } else if (mode === "kick") {
    await tgApi(token, "banChatMember", { chat_id: chatId, user_id: Number(userId) });
    await tgApi(token, "unbanChatMember", {
      chat_id: chatId,
      user_id: Number(userId),
      only_if_banned: true,
    });
  }

  await pushTgLog("warn", `Punish ${mode} user ${userId} — ${reason}`);
  await sendLog(token, opts.data, `${mode.toUpperCase()} ${userId}: ${reason}`);
}

export async function escalateWarn(
  token: string,
  data: TelegramBotData,
  chatId: number,
  userId: string,
  reason: string,
) {
  await applyPunish({
    token,
    data,
    chatId,
    userId,
    mode: "warn",
    reason,
  });
  const fresh = await import("./store").then((m) => m.getTelegramData());
  const member = fresh.members.find((m) => m.telegramUserId === userId);
  const warns = member?.warns || 0;
  if (warns >= fresh.security.maxWarns) {
    await applyPunish({
      token,
      data: fresh,
      chatId,
      userId,
      mode: fresh.security.warnMode === "warn" ? "ban" : fresh.security.warnMode,
      muteMinutes: fresh.security.warnMuteMinutes,
      reason: `warn limit ${warns}/${fresh.security.maxWarns}`,
    });
    return { warns, escalated: true };
  }
  return { warns, escalated: false };
}

export function memberActiveMute(m?: TgMember) {
  if (!m?.mutedUntil) return false;
  return new Date(m.mutedUntil).getTime() > Date.now();
}
