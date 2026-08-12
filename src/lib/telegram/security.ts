import type { LockKey, PunishMode, TgLocks, TgSecurityConfig } from "./types";

const floodBuckets = new Map<string, number[]>();
const joinBuckets = new Map<string, number[]>(); // chatId -> join timestamps

export function checkFlood(
  userId: string,
  cfg: TgSecurityConfig,
): { blocked: boolean; count: number } {
  if (!cfg.antiFlood) return { blocked: false, count: 0 };
  const now = Date.now();
  const windowMs = cfg.floodWindowSec * 1000;
  const prev = (floodBuckets.get(userId) || []).filter((t) => now - t < windowMs);
  prev.push(now);
  floodBuckets.set(userId, prev);
  return { blocked: prev.length > cfg.floodMaxMessages, count: prev.length };
}

export function checkAntiRaid(
  chatId: string,
  cfg: TgSecurityConfig,
): { raid: boolean; count: number } {
  if (!cfg.antiRaid) return { raid: false, count: 0 };
  const now = Date.now();
  const windowMs = cfg.antiRaidWindowSec * 1000;
  const key = `chat:${chatId}`;
  const prev = (joinBuckets.get(key) || []).filter((t) => now - t < windowMs);
  prev.push(now);
  joinBuckets.set(key, prev);
  return { raid: prev.length >= cfg.antiRaidJoinLimit, count: prev.length };
}

export function hitBlacklist(text: string, cfg: TgSecurityConfig): string | null {
  const lower = text.toLowerCase();
  for (const w of cfg.blacklistWords) {
    if (w && lower.includes(w.toLowerCase())) return w;
  }
  return null;
}

export function hasLink(text: string) {
  return /https?:\/\/|t\.me\/|www\.|tg:\/\//i.test(text);
}

export function hasInviteLink(text: string) {
  return /t\.me\/\+|t\.me\/joinchat\/|telegram\.me\/joinchat\//i.test(text);
}

export function isAllowlistedUrl(text: string, domains: string[]) {
  if (!domains.length) return false;
  try {
    const urls = text.match(/https?:\/\/[^\s]+|t\.me\/[^\s]+/gi) || [];
    if (!urls.length) return false;
    return urls.every((u) => {
      const normalized = u.startsWith("http") ? u : `https://${u}`;
      const host = new URL(normalized).hostname.replace(/^www\./, "");
      return domains.some((d) => host === d || host.endsWith(`.${d}`) || u.includes(d));
    });
  } catch {
    return false;
  }
}

export function fillTemplate(tpl: string, vars: Record<string, string>) {
  return tpl.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");
}

export function parseDurationToSeconds(raw?: string): number {
  if (!raw) return 0;
  const m = raw.trim().toLowerCase().match(/^(\d+)\s*([smhdw])?$/);
  if (!m) return 0;
  const n = Number(m[1]);
  const u = m[2] || "m";
  const mult: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 };
  return n * (mult[u] || 60);
}

export function untilIso(minutes: number) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

export type MediaFlags = {
  text?: string;
  forward_date?: number;
  sticker?: boolean;
  animation?: boolean;
  photo?: boolean;
  video?: boolean;
  audio?: boolean;
  voice?: boolean;
  document?: boolean;
  contact?: boolean;
  location?: boolean;
  poll?: boolean;
  game?: boolean;
  via_bot?: boolean;
  reply_markup?: boolean;
  new_chat_members?: boolean;
  left_chat_member?: boolean;
};

export function detectLockedContent(
  flags: MediaFlags,
  locks: TgLocks,
  cfg: TgSecurityConfig,
): LockKey | "url" | "forward" | null {
  const text = flags.text || "";

  if ((locks.forward || cfg.blockForwards) && flags.forward_date) return "forward";
  if (locks.sticker && flags.sticker) return "sticker";
  if (locks.gif && flags.animation) return "gif";
  if ((locks.photo || locks.media) && flags.photo) return "photo";
  if ((locks.video || locks.media) && flags.video) return "video";
  if ((locks.audio || locks.media) && flags.audio) return "audio";
  if ((locks.voice || locks.media) && flags.voice) return "voice";
  if ((locks.document || locks.media) && flags.document) return "document";
  if (locks.contact && flags.contact) return "contact";
  if (locks.location && flags.location) return "location";
  if (locks.poll && flags.poll) return "poll";
  if (locks.game && flags.game) return "game";
  if (locks.inline && flags.via_bot) return "inline";
  if (locks.button && flags.reply_markup) return "button";
  if (locks.bot && flags.new_chat_members) return "bot";

  if (text) {
    if ((locks.invitelink || cfg.blockInvitelinks) && hasInviteLink(text)) return "invitelink";
    if ((locks.url || cfg.blockLinks) && hasLink(text)) {
      if (isAllowlistedUrl(text, cfg.allowlistedDomains)) return null;
      return "url";
    }
    if (locks.rtl && /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(text)) return "rtl";
  }
  return null;
}

export function punishLabel(mode: PunishMode) {
  return mode;
}
