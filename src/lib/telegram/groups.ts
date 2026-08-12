import { tgApi } from "./moderation";
import { getTelegramData, updateTelegramData } from "./store";
import type { TgManagedGroup } from "./types";

export type ParsedChatRef =
  | { kind: "username"; value: string }
  | { kind: "chatId"; value: string }
  | { kind: "invite"; value: string; raw: string }
  | { kind: "unknown"; value: string };

/** Parse @name, t.me/name, t.me/+hash, numeric / -100 chat id, or raw invite URL. */
export function parseTelegramChatRef(input: string): ParsedChatRef {
  const raw = input.trim();
  if (!raw) return { kind: "unknown", value: raw };

  if (/^-?\d{5,}$/.test(raw)) {
    return { kind: "chatId", value: raw };
  }

  const at = raw.match(/^@([A-Za-z0-9_]{4,})$/);
  if (at) return { kind: "username", value: at[1] };

  try {
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw.replace(/^\/+/, "")}`;
    const u = new URL(withProto);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "t.me" || host === "telegram.me") {
      const part = u.pathname.replace(/^\/+/, "").split("/")[0] || "";
      if (part.startsWith("+") || part.toLowerCase() === "joinchat") {
        return { kind: "invite", value: withProto.split("?")[0], raw };
      }
      if (/^[A-Za-z0-9_]{4,}$/.test(part)) {
        return { kind: "username", value: part };
      }
    }
  } catch {
    /* fall through */
  }

  if (/^[A-Za-z0-9_]{4,}$/.test(raw)) {
    return { kind: "username", value: raw };
  }

  if (/t\.me\/\+/i.test(raw) || /joinchat/i.test(raw)) {
    return { kind: "invite", value: raw, raw };
  }

  return { kind: "unknown", value: raw };
}

type TgChat = {
  id: number;
  type: string;
  title?: string;
  username?: string;
};

function pendingIdFromInvite(invite: string) {
  const hash = [...invite].reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
  return `pending:${Math.abs(hash).toString(36)}`;
}

async function upsertGroup(group: TgManagedGroup) {
  return updateTelegramData((s) => {
    const idx = s.managedGroups.findIndex((g) => g.chatId === group.chatId);
    if (idx >= 0) {
      s.managedGroups[idx] = {
        ...s.managedGroups[idx],
        ...group,
        pending: group.pending ?? false,
      };
    } else {
      s.managedGroups.push(group);
    }
    return s;
  });
}

/**
 * Add group/channel by public @username, chat id, or private invite link.
 * Private invites are stored as pending until the bot is added to the chat.
 */
export async function addGroupByLink(input: string, titleHint?: string) {
  const data = await getTelegramData();
  const token = data.config.botToken;
  if (!token) throw new Error("Save bot token in Connect first");

  const parsed = parseTelegramChatRef(input);
  const now = new Date().toISOString();

  if (parsed.kind === "invite") {
    const pendingId = pendingIdFromInvite(parsed.value);
    const existing = data.managedGroups.find(
      (g) => g.inviteLink === parsed.value || g.chatId === pendingId,
    );
    if (existing) {
      return {
        store: data,
        group: existing,
        message: "Already saved — add the bot to this group/channel, then Sync",
      };
    }
    const group: TgManagedGroup = {
      chatId: pendingId,
      title: titleHint?.trim() || "Pending invite (add bot)",
      type: "unknown",
      inviteLink: parsed.value,
      isActive: false,
      pending: true,
      createdAt: now,
    };
    const store = await upsertGroup(group);
    return {
      store,
      group,
      message:
        "Invite saved. Open the link → Add this bot as Admin (Delete messages + Ban users). Then click Sync.",
    };
  }

  if (parsed.kind === "unknown") {
    throw new Error("Paste a valid link: https://t.me/name , @name , chat id, or invite link");
  }

  const chatRef = parsed.kind === "username" ? `@${parsed.value}` : parsed.value;
  const res = await tgApi(token, "getChat", { chat_id: chatRef });
  if (!res.ok || !res.result) {
    throw new Error(res.description || "getChat failed — bot must be a member for private chats");
  }
  const chat = res.result as TgChat;
  const group: TgManagedGroup = {
    chatId: String(chat.id),
    title: chat.title || titleHint?.trim() || chat.username || String(chat.id),
    type: chat.type,
    username: chat.username,
    inviteLink: chat.username ? `https://t.me/${chat.username}` : undefined,
    isActive: true,
    pending: false,
    createdAt: now,
  };
  const store = await upsertGroup(group);
  return { store, group, message: `Added: ${group.title}` };
}

/** Refresh known groups and drop duplicate pending rows. */
export async function syncManagedGroups() {
  const data = await getTelegramData();
  const token = data.config.botToken;
  if (!token) throw new Error("Bot token required");

  let updated = 0;
  for (const g of data.managedGroups) {
    if (g.pending || g.chatId.startsWith("pending:")) continue;
    const res = await tgApi(token, "getChat", { chat_id: g.chatId });
    if (!res.ok || !res.result) continue;
    const chat = res.result as TgChat;
    await updateTelegramData((s) => {
      const row = s.managedGroups.find((x) => x.chatId === g.chatId);
      if (!row) return s;
      row.title = chat.title || row.title;
      row.type = chat.type || row.type;
      row.username = chat.username || row.username;
      if (chat.username) row.inviteLink = `https://t.me/${chat.username}`;
      row.isActive = true;
      row.pending = false;
      return s;
    });
    updated += 1;
  }

  const store = await updateTelegramData((s) => {
    const live = s.managedGroups.filter((g) => !g.pending && !g.chatId.startsWith("pending:"));
    s.managedGroups = s.managedGroups.filter((g) => {
      if (!g.pending) return true;
      return !live.some((l) => l.inviteLink && g.inviteLink && l.inviteLink === g.inviteLink);
    });
    return s;
  });

  return { store, updated };
}

export async function removeManagedGroup(chatId: string) {
  return updateTelegramData((s) => {
    s.managedGroups = s.managedGroups.filter((g) => g.chatId !== chatId);
    return s;
  });
}

export async function setManagedGroupActive(chatId: string, isActive: boolean) {
  return updateTelegramData((s) => {
    const g = s.managedGroups.find((x) => x.chatId === chatId);
    if (g) g.isActive = isActive;
    return s;
  });
}
