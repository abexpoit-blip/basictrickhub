import type { TgKeywordRule } from "./types";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Short Latin keywords (id, ip, vpn) use word-boundary match to avoid false hits. */
export function keywordMatches(text: string, kw: string): boolean {
  const k = kw.trim();
  if (!k) return false;
  const lower = text.toLowerCase();
  const needle = k.toLowerCase();
  // Bangla / multi-word / longer phrases: substring
  if (/[^\u0000-\u007f]/.test(k) || k.includes(" ") || k.length > 4) {
    return lower.includes(needle);
  }
  const re = new RegExp(`(^|[^a-z0-9_])${escapeRegex(needle)}([^a-z0-9_]|$)`, "i");
  return re.test(text);
}

export function matchKeyword(text: string, rules: TgKeywordRule[]): TgKeywordRule | null {
  const active = rules.filter((r) => r.isActive).sort((a, b) => b.priority - a.priority);
  for (const rule of active) {
    for (const kw of rule.keywords) {
      if (keywordMatches(text, kw)) return rule;
    }
  }
  return null;
}
