import { tgApi } from "./moderation";
import type { TelegramBotData } from "./types";

export type ToolKind = "boost" | "reset";

export const TOOL_DOWNLOADS: Record<
  ToolKind,
  { name: string; downloadUrl: string; pageUrl: string }
> = {
  boost: {
    name: "FB Boost Tools",
    downloadUrl: "https://basictrickhub.com/api/extension/download?tool=boost",
    pageUrl: "https://basictrickhub.com/tools/fb-boost-tools",
  },
  reset: {
    name: "FB Reset Tools",
    downloadUrl: "https://basictrickhub.com/api/extension/download?tool=reset",
    pageUrl: "https://basictrickhub.com/tools/fb-reset-tools",
  },
};

export function parseToolKind(raw?: string | null): ToolKind | null {
  const v = String(raw || "").toLowerCase().trim();
  if (v === "boost" || v === "fb-boost-tools") return "boost";
  if (v === "reset" || v === "fb-reset-tools") return "reset";
  return null;
}

export async function sendToolDownload(
  token: string,
  chatId: number,
  data: TelegramBotData,
  tool: ToolKind,
) {
  const lang = data.config.defaultLang;
  const meta = TOOL_DOWNLOADS[tool];
  const icon = tool === "boost" ? "🚀" : "🔄";
  await tgApi(token, "sendMessage", {
    chat_id: chatId,
    text:
      lang === "bn"
        ? `${icon} ${meta.name}\n\n📥 Download — Chrome extension ZIP\n🌐 Website — tool page`
        : `${icon} ${meta.name}\n\n📥 Download — Chrome extension ZIP\n🌐 Website — tool page`,
    reply_markup: {
      inline_keyboard: [
        [{ text: "📥 Download", url: meta.downloadUrl }],
        [{ text: "🌐 Website", url: meta.pageUrl }],
        [{ text: "🏠 Menu", callback_data: "menu:usermenu" }],
      ],
    },
  });
}
