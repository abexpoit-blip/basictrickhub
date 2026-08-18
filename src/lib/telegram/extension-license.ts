import { randomBytes } from "node:crypto";
import { isMemberOfFreeGroup } from "./booster";
import { tgApi } from "./moderation";
import { updateTelegramData } from "./store";
import type { ExtToolKind, TelegramBotData } from "./types";

export const EXTENSION_LICENSE_DAYS = 7;
export const MAX_BROWSERS_PER_LICENSE = 10;
export const EXTENSION_GROUP_URL = "https://t.me/basictrick";
export const BOT_DEEP_LINK = "https://t.me/basictrickbot";

export const EXT_TOOLS: Record<
  ExtToolKind,
  { name: string; slug: string; downloadUrl: string; pageUrl: string; startPayload: string }
> = {
  boost: {
    name: "FB Boost Tools",
    slug: "fb-boost-tools",
    downloadUrl: "https://basictrickhub.com/api/extension/download?tool=boost",
    pageUrl: "https://basictrickhub.com/tools/fb-boost-tools",
    startPayload: "license_boost",
  },
  reset: {
    name: "FB Reset Tools",
    slug: "fb-reset-tools",
    downloadUrl: "https://basictrickhub.com/api/extension/download?tool=reset",
    pageUrl: "https://basictrickhub.com/tools/fb-reset-tools",
    startPayload: "license_reset",
  },
};

function part(): string {
  return randomBytes(3).toString("hex").toUpperCase().slice(0, 4);
}

export function generateLicenseKey(tool: ExtToolKind = "boost"): string {
  const prefix = tool === "reset" ? "BR" : "BT";
  return `${prefix}-${part()}-${part()}-${part()}`;
}

export function parseToolKind(raw?: string | null): ExtToolKind | null {
  const v = String(raw || "").toLowerCase().trim();
  if (v === "boost" || v === "license_boost" || v === "fb-boost-tools") return "boost";
  if (v === "reset" || v === "license_reset" || v === "fb-reset-tools") return "reset";
  return null;
}

export function isLicenseActive(lic: { isActive: boolean; expiresAt: string } | undefined): boolean {
  if (!lic?.isActive) return false;
  return new Date(lic.expiresAt).getTime() > Date.now();
}

export function licenseTool(lic: { tool?: ExtToolKind }): ExtToolKind {
  return lic.tool === "reset" ? "reset" : "boost";
}

export function boundBrowsers(lic: { deviceId?: string; deviceIds?: string[] }): string[] {
  const ids = [...(lic.deviceIds || [])];
  if (lic.deviceId && !ids.includes(lic.deviceId)) ids.unshift(lic.deviceId);
  return [...new Set(ids)];
}

export function getActiveLicenseForUser(data: TelegramBotData, userId: string, tool: ExtToolKind = "boost") {
  return (data.extensionLicenses || []).find(
    (l) => l.telegramUserId === userId && licenseTool(l) === tool && isLicenseActive(l),
  );
}

export function findValidLicense(data: TelegramBotData, key: string) {
  const k = key.trim().toUpperCase().replace(/\s+/g, "");
  if (!k) return null;
  const lic = (data.extensionLicenses || []).find((l) => l.key.toUpperCase() === k);
  if (!isLicenseActive(lic)) return null;
  return lic;
}

export function daysLeft(expiresAt: string): number {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000));
}

export function normalizeDeviceId(raw: string | undefined | null): string {
  const id = String(raw || "").trim();
  if (!/^[a-zA-Z0-9_-]{16,128}$/.test(id)) return "";
  return id;
}

export type LicenseCheckResult = {
  valid: boolean;
  error?: string;
  expiresAt?: string;
  daysLeft?: number;
  browsersUsed?: number;
  browsersMax?: number;
};

let licenseLock: Promise<unknown> = Promise.resolve();
function withLicenseLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = licenseLock.then(fn, fn);
  licenseLock = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

/** 1 license → up to 10 browsers (Chrome / any) on the user's machine. */
export async function activateLicenseForDevice(
  key: string,
  deviceIdRaw: string,
): Promise<LicenseCheckResult> {
  return withLicenseLock(async () => {
    const deviceId = normalizeDeviceId(deviceIdRaw);
    if (!deviceId) {
      return { valid: false, error: "Device id missing" };
    }

    let result: LicenseCheckResult = { valid: false, error: "Invalid or expired license" };
    await updateTelegramData((d) => {
      d.extensionLicenses = d.extensionLicenses || [];
      const k = key.trim().toUpperCase().replace(/\s+/g, "");
      const lic = d.extensionLicenses.find((l) => l.key.toUpperCase() === k);
      if (!lic || !isLicenseActive(lic)) {
        result = { valid: false, error: "Invalid or expired license" };
        return d;
      }
      const slots = boundBrowsers(lic);
      if (slots.includes(deviceId)) {
        lic.deviceIds = slots;
        result = {
          valid: true,
          expiresAt: lic.expiresAt,
          daysLeft: daysLeft(lic.expiresAt),
          browsersUsed: slots.length,
          browsersMax: MAX_BROWSERS_PER_LICENSE,
        };
        return d;
      }
      if (slots.length >= MAX_BROWSERS_PER_LICENSE) {
        result = {
          valid: false,
          error: `This license already used on ${MAX_BROWSERS_PER_LICENSE} browsers`,
          browsersUsed: slots.length,
          browsersMax: MAX_BROWSERS_PER_LICENSE,
        };
        return d;
      }
      slots.push(deviceId);
      lic.deviceIds = slots;
      lic.deviceId = slots[0];
      lic.deviceBoundAt = lic.deviceBoundAt || new Date().toISOString();
      result = {
        valid: true,
        expiresAt: lic.expiresAt,
        daysLeft: daysLeft(lic.expiresAt),
        browsersUsed: slots.length,
        browsersMax: MAX_BROWSERS_PER_LICENSE,
      };
      return d;
    });
    return result;
  });
}

export async function unbindLicenseDevice(telegramUserId: string, tool?: ExtToolKind) {
  let found = false;
  const next = await updateTelegramData((d) => {
    for (const lic of d.extensionLicenses || []) {
      if (lic.telegramUserId !== telegramUserId || !isLicenseActive(lic)) continue;
      if (tool && licenseTool(lic) !== tool) continue;
      lic.deviceId = undefined;
      lic.deviceIds = [];
      lic.deviceBoundAt = undefined;
      found = true;
    }
    return d;
  });
  return {
    found,
    license: tool
      ? getActiveLicenseForUser(next, telegramUserId, tool)
      : getActiveLicenseForUser(next, telegramUserId, "boost"),
  };
}

export async function issueOrReuseLicense(userId: string, username: string | undefined, tool: ExtToolKind) {
  return updateTelegramData((d) => {
    d.extensionLicenses = d.extensionLicenses || [];
    const existing = getActiveLicenseForUser(d, userId, tool);
    if (existing) return d;
    const now = new Date();
    const expires = new Date(now.getTime() + EXTENSION_LICENSE_DAYS * 86400000);
    d.extensionLicenses.push({
      key: generateLicenseKey(tool),
      tool,
      telegramUserId: userId,
      username,
      issuedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      isActive: true,
      deviceIds: [],
    });
    return d;
  });
}

function licenseHubMarkup(lang: string) {
  const bn = lang === "bn";
  return {
    inline_keyboard: [
      [{ text: `🚀 ${EXT_TOOLS.boost.name}`, callback_data: "menu:tool:boost" }],
      [
        { text: "📥 Download", url: EXT_TOOLS.boost.downloadUrl },
        { text: "🪪 License", callback_data: "lic:issue:boost" },
      ],
      [{ text: `🔄 ${EXT_TOOLS.reset.name}`, callback_data: "menu:tool:reset" }],
      [
        { text: "📥 Download", url: EXT_TOOLS.reset.pageUrl },
        { text: "🪪 License", callback_data: "lic:issue:reset" },
      ],
      [{ text: bn ? "🏠 মেনু" : "🏠 Menu", callback_data: "menu:usermenu" }],
    ],
  };
}

export async function sendToolPanel(
  token: string,
  chatId: number,
  data: TelegramBotData,
  tool: ExtToolKind,
) {
  const lang = data.config.defaultLang;
  const meta = EXT_TOOLS[tool];
  const icon = tool === "boost" ? "🚀" : "🔄";
  await tgApi(token, "sendMessage", {
    chat_id: chatId,
    text:
      lang === "bn"
        ? `${icon} ${meta.name}\n\n❝ এক কি — দশ ব্রাউজার। ❞\n\n📥 Download = এক্সটেনশন ZIP\n🪪 License = আগে গ্রুপ জয়েন ভেরিফাই, তারপর ১টা কি`
        : `${icon} ${meta.name}\n\n❝ One key — ten browsers. ❞\n\n📥 Download = extension ZIP\n🪪 License = verify group join, then 1 key`,
    reply_markup: {
      inline_keyboard: [
        [{ text: "📥 Download", url: meta.downloadUrl }],
        [{ text: "🪪 License", callback_data: `lic:issue:${tool}` }],
        [{ text: "🏠 Menu", callback_data: "menu:usermenu" }],
      ],
    },
  });
}

export async function sendLicenseHub(token: string, chatId: number, data: TelegramBotData) {
  const lang = data.config.defaultLang;
  await tgApi(token, "sendMessage", {
    chat_id: chatId,
    text:
      lang === "bn"
        ? `🔑 License সেকশন\n\n১) Download — এক্সটেনশন ZIP\n২) License — আগে @basictrick জয়েন ভেরিফাই, তারপর ১টা কি\n\n⏳ ${EXTENSION_LICENSE_DAYS} দিন · 💻 ১ ডিভাইসে ${MAX_BROWSERS_PER_LICENSE}টা Chrome/browser`
        : `🔑 License section\n\n1) Download — extension ZIP\n2) License — verify @basictrick join, then 1 key\n\n⏳ ${EXTENSION_LICENSE_DAYS} days · 💻 ${MAX_BROWSERS_PER_LICENSE} browsers on 1 device`,
    reply_markup: licenseHubMarkup(lang),
  });
}

export async function sendExtensionLicense(
  token: string,
  chatId: number,
  data: TelegramBotData,
  userId: string,
  username: string | undefined,
  tool: ExtToolKind,
) {
  const lang = data.config.defaultLang;
  const meta = EXT_TOOLS[tool];
  const joined = await isMemberOfFreeGroup(token, data, userId);
  if (!joined) {
    await tgApi(token, "sendMessage", {
      chat_id: chatId,
      text:
        lang === "bn"
          ? `🔑 ${meta.name}\n\nলাইসেন্স দেওয়ার আগে আমাদের পাবলিক গ্রুপে জয়েন ভেরিফাই করতে হবে।\nজয়েন করে আবার License চাপুন।\n\n👉 ${data.booster.freeGroupInvite || EXTENSION_GROUP_URL}`
          : `🔑 ${meta.name}\n\nJoin our public group first. License is issued only after join is verified.\n\n👉 ${data.booster.freeGroupInvite || EXTENSION_GROUP_URL}`,
      reply_markup: {
        inline_keyboard: [
          [{ text: "⚡ Join @basictrick", url: data.booster.freeGroupInvite || EXTENSION_GROUP_URL }],
          [{ text: "🪪 Check again", callback_data: `lic:issue:${tool}` }],
          [{ text: "📥 Download", url: meta.downloadUrl }],
        ],
      },
    });
    return { ok: true, joined: false };
  }

  const next = await issueOrReuseLicense(userId, username, tool);
  const lic = getActiveLicenseForUser(next, userId, tool);
  if (!lic) {
    await tgApi(token, "sendMessage", {
      chat_id: chatId,
      text: "Could not issue license. Try again.",
    });
    return { ok: false };
  }

  const left = daysLeft(lic.expiresAt);
  const used = boundBrowsers(lic).length;
  await tgApi(token, "sendMessage", {
    chat_id: chatId,
    text:
      lang === "bn"
        ? `✅ ${meta.name} লাইসেন্স\n\n🔑 \`${lic.key}\`\n⏳ বাকি: ${left} দিন\n📅 মেয়াদ: ${lic.expiresAt.slice(0, 10)}\n💻 ব্রাউজার স্লট: ${used}/${MAX_BROWSERS_PER_LICENSE} (১ ডিভাইসে Chrome/অন্য browser)\n\nএক্সটেনশনে কি পেস্ট করুন। ১ ইউজার = ১ কি।`
        : `✅ ${meta.name} license\n\n🔑 \`${lic.key}\`\n⏳ Left: ${left} days\n📅 Expires: ${lic.expiresAt.slice(0, 10)}\n💻 Browser slots: ${used}/${MAX_BROWSERS_PER_LICENSE} (same device, Chrome or any browser)\n\nPaste this key in the extension. 1 user = 1 key.`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "📥 Download", url: meta.downloadUrl }],
        [{ text: "🏠 Menu", callback_data: "menu:usermenu" }],
      ],
    },
  });
  return { ok: true, joined: true, key: lic.key };
}
