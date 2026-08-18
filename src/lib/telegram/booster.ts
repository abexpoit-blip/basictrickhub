import { fillTemplate } from "./security";
import { tgApi } from "./moderation";
import { getTelegramData, updateTelegramData, pushTgLog } from "./store";
import type { TgMember, TelegramBotData } from "./types";

export type JoinCheck = {
  joined: boolean;
  status?: string;
  chatId?: string;
  error?: string;
};

function isJoinedStatus(status?: string, isMember?: boolean) {
  if (status === "member" || status === "administrator" || status === "creator") return true;
  if (status === "restricted" && isMember) return true;
  return false;
}

function candidateGroupIds(data: TelegramBotData): string[] {
  const ids: string[] = [];
  const push = (v?: string) => {
    const s = String(v || "").trim();
    if (!s) return;
    const n = s.startsWith("@") ? s : s.match(/^-?\d+$/) ? s : s.replace(/^t\.me\//, "");
    const val = n.startsWith("@") || n.match(/^-?\d+$/) ? n : `@${n.replace("@", "")}`;
    if (!ids.includes(val)) ids.push(val);
  };
  push(data.booster.freeGroupId);
  push("@basictrick");
  push("basictrick");
  for (const g of data.managedGroups || []) {
    const looksFree =
      g.username === "basictrick" ||
      g.chatId === "@basictrick" ||
      (g.inviteLink || "").includes("t.me/basictrick");
    if (!looksFree) continue;
    push(g.chatId);
    if (g.username) push(g.username);
  }
  return ids;
}

async function markJoined(userId: string, resolvedChatId?: string) {
  await updateTelegramData((d) => {
    const m = d.members.find((x) => x.telegramUserId === userId);
    if (m) m.joinedFreeGroup = true;
    if (resolvedChatId && /^\-?\d+$/.test(resolvedChatId)) {
      d.booster.freeGroupId = resolvedChatId;
    }
    return d;
  });
}

/** Live Telegram check. getChatMember does not throw — must read res.ok. */
export async function checkFreeGroupMembership(
  token: string,
  data: TelegramBotData,
  userId: string,
): Promise<JoinCheck> {
  const uid = Number(userId);
  if (!Number.isFinite(uid)) return { joined: false, error: "Invalid user id" };

  let lastError = "";
  for (const chatId of candidateGroupIds(data)) {
    const res = await tgApi(token, "getChatMember", {
      chat_id: chatId,
      user_id: uid,
    });
    if (!res.ok) {
      lastError = res.description || "getChatMember failed";
      continue;
    }
    const result = res.result as { status?: string; is_member?: boolean } | undefined;
    const joined = isJoinedStatus(result?.status, result?.is_member);
    if (joined) {
      let numericId = chatId;
      const chat = await tgApi(token, "getChat", { chat_id: chatId });
      const id = (chat.result as { id?: number } | undefined)?.id;
      if (chat.ok && id) numericId = String(id);
      await markJoined(userId, numericId);
      return { joined: true, status: result?.status, chatId: numericId };
    }
    return { joined: false, status: result?.status || "left", chatId };
  }

  const cached = !!data.members.find((m) => m.telegramUserId === userId)?.joinedFreeGroup;
  if (cached) return { joined: true, status: "cached" };
  await pushTgLog("warn", `Join check failed for ${userId}: ${lastError || "no chat"}`);
  return {
    joined: false,
    error: lastError || "Could not reach @basictrick. Add the bot to the group as admin.",
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
