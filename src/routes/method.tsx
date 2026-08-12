import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Send, Sparkles, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SiteShell } from "../components/layout/SiteShell";
import { LanguageProvider, copy, useLang } from "../lib/language";
import { fetchMethods, fetchSettings } from "../lib/server-fns";
import type { MethodGuide } from "../lib/types";
import { cn } from "../lib/utils";

export const Route = createFileRoute("/method")({
  head: () => ({ meta: [{ title: "Methods — Basictrick" }] }),
  component: () => (
    <LanguageProvider>
      <MethodPage />
    </LanguageProvider>
  ),
});

const ACCENT: Record<string, string> = {
  sky: "from-sky-500 to-cyan-400",
  rose: "from-rose-500 to-orange-400",
  emerald: "from-emerald-500 to-teal-400",
  indigo: "from-indigo-500 to-violet-400",
  amber: "from-amber-500 to-yellow-400",
  cyan: "from-cyan-500 to-sky-400",
};

function MethodPage() {
  const { lang } = useLang();
  const t = copy[lang];
  const [methods, setMethods] = useState<MethodGuide[]>([]);
  const [telegramUrl, setTelegramUrl] = useState("https://t.me/basictrick");
  const [tagline, setTagline] = useState("");

  useEffect(() => {
    void Promise.all([fetchMethods(), fetchSettings()]).then(([m, s]) => {
      setMethods(m);
      setTelegramUrl(s.telegramUrl);
      setTagline(s.tagline);
    });
  }, []);

  const drops = useMemo(
    () => [...methods].sort((a, b) => Number(!!b.isNewDrop) - Number(!!a.isNewDrop) || a.sortOrder - b.sortOrder),
    [methods],
  );
  const featured = drops.filter((m) => m.isNewDrop).slice(0, 3);

  return (
    <SiteShell telegramUrl={telegramUrl} tagline={tagline}>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#fda4af55,_transparent_45%),radial-gradient(ellipse_at_top_right,_#7dd3fc66,_transparent_40%)]" />

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg shadow-rose-200">
                <Flame className="h-3.5 w-3.5" />
                {lang === "bn" ? "নিউ মেথড ড্রপ" : "New Method Drops"}
              </p>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {t.methodTitle}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
                {lang === "bn"
                  ? "নতুন নতুন Autopay, Boost ও Earning ট্রিক মেথড — ড্রপ হলে টেলিগ্রাম গ্রুপেও অটো শো হবে।"
                  : "Fresh Autopay, Boost & earning trick methods — new drops also auto-post to the Telegram group."}
              </p>
            </div>
            <a
              href={telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-200 hover:bg-sky-700"
            >
              <Send className="h-4 w-4" />
              {lang === "bn" ? "টেলিগ্রামে ড্রপ দেখুন" : "See drops on Telegram"}
            </a>
          </div>

          {featured.length > 0 && (
            <div className="mt-10">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Sparkles className="h-4 w-4 text-amber-500" />
                {lang === "bn" ? "হট ড্রপস" : "Hot Drops"}
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {featured.map((m, i) => (
                  <Link
                    key={m.id}
                    to="/method/$slug"
                    params={{ slug: m.slug }}
                    className="group relative overflow-hidden rounded-3xl p-[1px] shadow-lg shadow-sky-100 transition hover:-translate-y-0.5"
                  >
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-90",
                        ACCENT[m.accent || "sky"] || ACCENT.sky,
                      )}
                    />
                    <div className="relative flex h-full flex-col rounded-[1.4rem] bg-white/95 p-5 backdrop-blur">
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                          NEW DROP
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          #{String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <h2 className="mt-3 text-lg font-bold text-slate-900 group-hover:text-sky-800">{m.title}</h2>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{m.summary}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {m.tag && (
                          <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                            {m.tag}
                          </span>
                        )}
                        {m.level && (
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                            {m.level}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Zap className="h-4 w-4 text-sky-500" />
              {lang === "bn" ? "সব মেথড / ট্রিকস" : "All Methods & Tricks"}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {drops.map((m) => (
                <Link
                  key={m.id}
                  to="/method/$slug"
                  params={{ slug: m.slug }}
                  className="group overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm transition hover:border-sky-300 hover:shadow-md"
                >
                  <div className={cn("h-1.5 w-full bg-gradient-to-r", ACCENT[m.accent || "sky"] || ACCENT.sky)} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-base font-bold text-slate-900 group-hover:text-sky-800">{m.title}</h2>
                      {m.isNewDrop && (
                        <span className="shrink-0 rounded-full bg-gradient-to-r from-rose-500 to-orange-400 px-2 py-0.5 text-[10px] font-bold text-white">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{m.summary}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {m.tag && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                          {m.tag}
                        </span>
                      )}
                      {m.level && (
                        <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                          {m.level}
                        </span>
                      )}
                      {m.telegramPostedAt && (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                          {lang === "bn" ? "TG-তে পোস্টেড" : "Posted on TG"}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
