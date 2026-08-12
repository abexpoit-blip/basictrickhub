import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Send, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteShell } from "../components/layout/SiteShell";
import { LanguageProvider, useLang } from "../lib/language";
import { fetchMethod, fetchSettings } from "../lib/server-fns";
import type { MethodGuide } from "../lib/types";
import { cn } from "../lib/utils";

export const Route = createFileRoute("/method/$slug")({
  head: () => ({ meta: [{ title: "Method — Basictrick" }] }),
  component: () => (
    <LanguageProvider>
      <MethodDetail />
    </LanguageProvider>
  ),
});

const ACCENT: Record<string, string> = {
  sky: "from-sky-500 to-cyan-400",
  rose: "from-rose-500 to-orange-400",
  emerald: "from-emerald-500 to-teal-400",
  indigo: "from-indigo-500 to-violet-400",
  amber: "from-amber-500 to-yellow-400",
};

function MethodDetail() {
  const { slug } = Route.useParams();
  const { lang } = useLang();
  const [method, setMethod] = useState<MethodGuide | null | undefined>(undefined);
  const [telegramUrl, setTelegramUrl] = useState("https://t.me/basictrick");
  const [siteUrl, setSiteUrl] = useState("http://localhost:8080");

  useEffect(() => {
    void Promise.all([fetchMethod({ data: { slug } }), fetchSettings()]).then(([m, s]) => {
      setMethod(m ?? null);
      setTelegramUrl(s.telegramUrl);
      setSiteUrl(s.sitePublicUrl || "http://localhost:8080");
    });
  }, [slug]);

  const shareUrl =
    method &&
    `https://t.me/share/url?url=${encodeURIComponent(`${siteUrl.replace(/\/$/, "")}/method/${method.slug}`)}&text=${encodeURIComponent(
      `🔥 NEW METHOD DROP — ${method.title}\n${method.summary}`,
    )}`;

  return (
    <SiteShell telegramUrl={telegramUrl}>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link to="/method" className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          {lang === "bn" ? "মেথডে ফিরে যান" : "Back to methods"}
        </Link>

        {method === undefined && <p className="mt-6 text-slate-500">Loading…</p>}
        {method === null && <p className="mt-6 text-slate-500">Method not found.</p>}

        {method && (
          <article className="mt-6 overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-lg shadow-sky-100/60">
            <div className={cn("h-2 w-full bg-gradient-to-r", ACCENT[method.accent || "sky"] || ACCENT.sky)} />
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap gap-2">
                {method.isNewDrop && (
                  <span className="rounded-full bg-gradient-to-r from-rose-500 to-orange-400 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                    New Method Drop
                  </span>
                )}
                {method.tag && (
                  <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-bold uppercase text-sky-700">
                    {method.tag}
                  </span>
                )}
                {method.level && (
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-700">
                    {method.level}
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{method.title}</h1>
              <p className="mt-2 text-slate-500">{method.summary}</p>

              <div className="prose prose-slate mt-8 max-w-none whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {method.content}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
                >
                  <Send className="h-4 w-4" />
                  {lang === "bn" ? "পূর্ণ প্যাক টেলিগ্রামে" : "Full pack on Telegram"}
                </a>
                {shareUrl && (
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-5 py-2.5 text-sm font-semibold text-sky-800 hover:bg-sky-50"
                  >
                    <Share2 className="h-4 w-4" />
                    {lang === "bn" ? "টেলিগ্রামে শেয়ার" : "Share to Telegram"}
                  </a>
                )}
              </div>
            </div>
          </article>
        )}
      </div>
    </SiteShell>
  );
}
