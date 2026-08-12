import { fillTemplate } from "./security";
import { tgApi } from "./moderation";
import { getTelegramData, updateTelegramData, pushTgLog } from "./store";
import type { TgMember, TelegramBotData } from "./types";

export async function isMemberOfFreeGroup(
  token: string,
  data: TelegramBotData,
  userId: string,
): Promise<boolean> {
  const chatId = data.booster.freeGroupId?.trim();
  if (!chatId) return !!data.members.find((m) => m.telegramUserId === userId)?.joinedFreeGroup;
  try {
    const res = await tgApi(token, "getChatMember", {
      chat_id: chatId,
      user_id: Number(userId),
    });
    const status = (res.result as { status?: string } | undefined)?.status;
    const ok = status === "member" || status === "administrator" || status === "creator";
    if (ok) {
      await updateTelegramData((d) => {
        const m = d.members.find((x) => x.telegramUserId === userId);
        if (m) m.joinedFreeGroup = true;
        return d;
      });
    }
    return ok;
  } catch {
    return false;
  }
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
        [{ text: "🚀 Join Free Group", url: data.booster.freeGroupInvite }],
        [{ text: "✦ Check AI Status", callback_data: "menu:aistatus" }],
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
