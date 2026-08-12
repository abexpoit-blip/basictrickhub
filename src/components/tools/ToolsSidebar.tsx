import { Link } from "@tanstack/react-router";
import {
  Bookmark,
  ChevronDown,
  Fingerprint,
  Puzzle,
  Sparkles,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CommunityTool, ToolCategory } from "../../lib/types";
import { cn } from "../../lib/utils";

const ACCENTS: Record<
  string,
  { bar: string; soft: string; text: string; ring: string; icon: string }
> = {
  sky: {
    bar: "from-sky-500 to-cyan-400",
    soft: "bg-sky-50",
    text: "text-sky-700",
    ring: "ring-sky-200",
    icon: "bg-sky-500",
  },
  cyan: {
    bar: "from-cyan-500 to-teal-400",
    soft: "bg-cyan-50",
    text: "text-cyan-700",
    ring: "ring-cyan-200",
    icon: "bg-cyan-500",
  },
  indigo: {
    bar: "from-indigo-500 to-sky-400",
    soft: "bg-indigo-50",
    text: "text-indigo-700",
    ring: "ring-indigo-200",
    icon: "bg-indigo-500",
  },
  amber: {
    bar: "from-amber-500 to-orange-400",
    soft: "bg-amber-50",
    text: "text-amber-800",
    ring: "ring-amber-200",
    icon: "bg-amber-500",
  },
  rose: {
    bar: "from-rose-500 to-pink-400",
    soft: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-200",
    icon: "bg-rose-500",
  },
  emerald: {
    bar: "from-emerald-500 to-teal-400",
    soft: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200",
    icon: "bg-emerald-500",
  },
};

function catAccent(cat: ToolCategory, index: number) {
  const keys = Object.keys(ACCENTS);
  const key = cat.accent && ACCENTS[cat.accent] ? cat.accent : keys[index % keys.length];
  return ACCENTS[key];
}

function CatIcon({ slug, className }: { slug: string; className?: string }) {
  if (slug.includes("generator") || slug.includes("creative")) return <Sparkles className={className} />;
  if (slug.includes("extension")) return <Puzzle className={className} />;
  if (slug.includes("bookmark")) return <Bookmark className={className} />;
  if (slug.includes("id")) return <Fingerprint className={className} />;
  return <Wrench className={className} />;
}

export function ToolsSidebar({
  categories,
  tools,
  activeSlug,
}: {
  categories: ToolCategory[];
  tools: CommunityTool[];
  activeSlug?: string;
}) {
  const byCat = useMemo(() => {
    const map: Record<string, CommunityTool[]> = {};
    for (const t of tools) (map[t.categoryId] ||= []).push(t);
    return map;
  }, [tools]);

  const activeCategoryId = useMemo(() => {
    const hit = tools.find(
      (t) => t.slug === activeSlug || t.onlineRoute?.split("/").pop() === activeSlug,
    );
    return hit?.categoryId ?? categories[0]?.id;
  }, [tools, activeSlug, categories]);

  // Only one accordion open at a time — not all expanded
  const [openId, setOpenId] = useState<string | undefined>(activeCategoryId);

  useEffect(() => {
    if (activeCategoryId) setOpenId(activeCategoryId);
  }, [activeCategoryId]);

  return (
    <aside className="w-full shrink-0 lg:w-80">
      <div className="overflow-hidden rounded-3xl border border-sky-100/80 bg-gradient-to-b from-white via-sky-50/40 to-cyan-50/30 p-2 shadow-[0_12px_40px_-16px_rgba(14,165,233,0.35)] ring-1 ring-sky-100/60">
        <div className="mb-2 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-3 py-3 text-white shadow-md shadow-sky-200/50">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-50/90">Basictrick</p>
            <p className="text-sm font-semibold leading-tight">Community Tools</p>
          </div>
        </div>

        <div className="space-y-1.5 p-1">
          {categories.map((cat, index) => {
            const accent = catAccent(cat, index);
            const isOpen = openId === cat.id;
            const items = byCat[cat.id] || [];
            return (
              <div
                key={cat.id}
                className={cn(
                  "overflow-hidden rounded-2xl border transition",
                  isOpen ? `border-transparent bg-white shadow-sm ring-1 ${accent.ring}` : "border-transparent bg-white/50 hover:bg-white",
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenId((id) => (id === cat.id ? undefined : cat.id))}
                  className="flex w-full items-center gap-2.5 px-2.5 py-2.5 text-left"
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm bg-gradient-to-br",
                      accent.bar,
                    )}
                  >
                    <CatIcon slug={cat.slug} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-slate-800">{cat.name}</span>
                    <span className="block text-[10px] font-medium text-slate-400">
                      {items.length} tools
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
                      isOpen && "rotate-180 text-sky-600",
                    )}
                  />
                </button>

                <div
                  className={cn(
                    "grid transition-all duration-200",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <ul className="space-y-0.5 px-2 pb-2">
                      {items.map((tool) => {
                        const href = tool.onlineRoute || `/tools/${tool.slug}`;
                        const active =
                          activeSlug === tool.slug ||
                          activeSlug === tool.onlineRoute?.split("/").pop();
                        return (
                          <li key={tool.id}>
                            <Link
                              to={href}
                              className={cn(
                                "group flex items-center gap-2 rounded-xl px-2.5 py-2 text-[13px] transition",
                                active
                                  ? cn("font-semibold text-slate-900", accent.soft)
                                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                              )}
                            >
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full transition",
                                  active ? accent.icon : "bg-slate-300 group-hover:bg-sky-400",
                                )}
                              />
                              <span className="truncate">{tool.name}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
