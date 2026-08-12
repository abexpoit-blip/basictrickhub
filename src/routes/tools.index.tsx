import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ToolsLayout } from "../components/tools/ToolsLayout";
import { LanguageProvider, copy, useLang } from "../lib/language";
import { fetchCatalog } from "../lib/server-fns";
import type { CommunityTool, ToolCategory } from "../lib/types";
import { cn } from "../lib/utils";

export const Route = createFileRoute("/tools/")({
  head: () => ({ meta: [{ title: "Tools — Basictrick" }] }),
  component: () => (
    <LanguageProvider>
      <ToolsHub />
    </LanguageProvider>
  ),
});

const TYPE_STYLE: Record<string, string> = {
  generator: "from-rose-500 to-orange-400",
  download: "from-indigo-500 to-sky-400",
  bookmark: "from-amber-500 to-yellow-400",
  online: "from-emerald-500 to-teal-400",
};

const CAT_STYLE = [
  "from-rose-500/15 via-white to-white border-rose-100",
  "from-indigo-500/15 via-white to-white border-indigo-100",
  "from-amber-500/15 via-white to-white border-amber-100",
  "from-emerald-500/15 via-white to-white border-emerald-100",
];

function ToolsHub() {
  const { lang } = useLang();
  const t = copy[lang];
  const [categories, setCategories] = useState<ToolCategory[]>([]);
  const [tools, setTools] = useState<CommunityTool[]>([]);

  useEffect(() => {
    void fetchCatalog().then((d) => {
      setCategories(d.categories);
      setTools(d.tools);
    });
  }, []);

  return (
    <ToolsLayout>
      <div>
        <div className="rounded-3xl bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-400 p-6 text-white shadow-xl shadow-sky-200/50">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t.toolsTitle}</h1>
          <p className="mt-2 max-w-xl text-sm text-sky-50">
            {lang === "bn"
              ? "Facebook Extensions, Bookmark, ID চেকার ও Adsterra ক্রিয়েটিভ জেনারেটর — প্রিমিয়াম কমিউনিটি টুলস।"
              : "Facebook Extensions, Bookmarks, ID checkers & Adsterra creative generator — premium community tools."}
          </p>
        </div>

        <div className="mt-8 space-y-10">
          {categories.map((cat, idx) => {
            const catTools = tools.filter((x) => x.categoryId === cat.id);
            if (!catTools.length) return null;
            return (
              <section key={cat.id}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{cat.name}</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {catTools.map((tool) => {
                    const href = tool.onlineRoute || `/tools/${tool.slug}`;
                    return (
                      <Link
                        key={tool.id}
                        to={href}
                        className={cn(
                          "group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                          CAT_STYLE[idx % CAT_STYLE.length],
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-slate-900 group-hover:text-sky-800">{tool.name}</h3>
                          <span
                            className={cn(
                              "rounded-full bg-gradient-to-r px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm",
                              TYPE_STYLE[tool.toolType] || TYPE_STYLE.online,
                            )}
                          >
                            {tool.toolType}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-500">{tool.shortDescription}</p>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </ToolsLayout>
  );
}
