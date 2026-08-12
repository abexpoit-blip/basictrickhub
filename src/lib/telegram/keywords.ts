import type { TgKeywordRule } from "./types";

export function matchKeyword(text: string, rules: TgKeywordRule[]): TgKeywordRule | null {
  const lower = text.toLowerCase();
  const active = rules.filter((r) => r.isActive).sort((a, b) => b.priority - a.priority);
  for (const rule of active) {
    for (const kw of rule.keywords) {
      if (kw && lower.includes(kw.toLowerCase())) return rule;
    }
  }
  return null;
}
