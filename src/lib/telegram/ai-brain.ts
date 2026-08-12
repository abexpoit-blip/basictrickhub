import type { TgAiBrain, TgAiIntent, TelegramBotData } from "./types";
import { fillTemplate } from "./security";
import { matchKeyword } from "./keywords";

export function matchIntent(text: string, intents: TgAiIntent[]): TgAiIntent | null {
  const lower = text.toLowerCase();
  const active = intents.filter((i) => i.isActive).sort((a, b) => b.priority - a.priority);
  for (const intent of active) {
    for (const p of intent.patterns) {
      if (p && lower.includes(p.toLowerCase())) return intent;
    }
  }
  return null;
}

export function buildSmartReply(
  text: string,
  data: TelegramBotData,
): {
  text: string;
  action: TgAiIntent["action"] | "keyword" | "fallback";
  buttonUrl?: string;
  buttonText?: string;
} | null {
  const brain: TgAiBrain = data.ai;
  if (!brain.enabled || !brain.smartMode) return null;
  if (!text || text.startsWith("/")) return null;

  const lang = data.config.defaultLang;
  const vars = {
    persona: brain.personaName,
    salesBot: data.config.salesBotUsername,
    site: data.config.sitePublicUrl.replace(/\/$/, ""),
    support: data.config.supportUrl,
    invite: data.booster.freeGroupInvite,
    group: data.booster.freeGroupTitle,
  };

  // 1) keyword sales rules first (higher business value)
  const kw = matchKeyword(text, data.keywords);
  if (kw) {
    return {
      text: fillTemplate(lang === "bn" ? kw.replyBn : kw.replyEn, {
        ...vars,
        salesBot: kw.suggestBotUsername || data.config.salesBotUsername,
      }),
      action: "keyword",
      buttonText: kw.buttonText || "Open Official Bot",
      buttonUrl:
        kw.buttonUrl ||
        `https://t.me/${(kw.suggestBotUsername || data.config.salesBotUsername).replace("@", "")}`,
    };
  }

  // 2) AI intents
  const intent = matchIntent(text, brain.intents);
  if (intent) {
    return {
      text: fillTemplate(lang === "bn" ? intent.replyBn : intent.replyEn, vars),
      action: intent.action,
      buttonText:
        intent.action === "boost"
          ? "Join Free Group"
          : intent.action === "support"
            ? "Support"
            : intent.action !== "none"
              ? "Open Store"
              : undefined,
      buttonUrl:
        intent.action === "boost"
          ? data.booster.freeGroupInvite
          : intent.action === "support"
            ? data.config.supportUrl
            : undefined,
    };
  }

  // 3) fallback smart reply
  return {
    text: fillTemplate(lang === "bn" ? brain.fallbackBn : brain.fallbackEn, vars),
    action: "fallback",
  };
}
