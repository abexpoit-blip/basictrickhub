/** Post a new method drop into the Telegram group via Bot API */
export async function postMethodDropToTelegram(opts: {
  botToken?: string;
  chatId?: string;
  title: string;
  summary: string;
  slug: string;
  sitePublicUrl?: string;
  tag?: string;
}): Promise<{ ok: boolean; detail?: string }> {
  const token = opts.botToken?.trim();
  const chatId = opts.chatId?.trim();
  if (!token || !chatId) {
    return { ok: false, detail: "Telegram bot token / chat id not configured in Admin Settings" };
  }

  const base = (opts.sitePublicUrl || "").replace(/\/$/, "") || "https://basictrick.com";
  const link = `${base}/method/${opts.slug}`;
  const tag = opts.tag ? `#${opts.tag.replace(/\s+/g, "")}` : "#MethodDrop";

  const text = [
    "🔥 *NEW METHOD DROP*",
    "",
    `*${escapeMd(opts.title)}*`,
    opts.summary ? escapeMd(opts.summary) : "",
    "",
    `${tag} · Basictrick`,
    `👉 ${link}`,
    "",
    "Join community for full pack ⬇️",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: false,
      }),
      signal: AbortSignal.timeout(15000),
    });
    const json = (await res.json()) as { ok?: boolean; description?: string };
    if (!json.ok) return { ok: false, detail: json.description || "Telegram API error" };
    return { ok: true };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : "Telegram request failed" };
  }
}

function escapeMd(s: string) {
  return s.replace(/([_*`\[\]])/g, "\\$1");
}
