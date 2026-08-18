import { createFileRoute } from "@tanstack/react-router";
import { LanguageProvider, useLang } from "../lib/language";
import { SiteShell } from "../components/layout/SiteShell";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/license")({
  head: () => ({ meta: [{ title: "License — Basictrick" }] }),
  component: () => (
    <LanguageProvider>
      <LicenseHub />
    </LanguageProvider>
  ),
});

const CARDS = [
  {
    name: "FB Boost Tools",
    blurbBn: "পোস্ট বুস্ট এক্সটেনশন। Download চাপলে ZIP, License চাপলে গ্রুপ ভেরিফাই করে ১টা কি।",
    blurbEn: "Post boost extension. Download = ZIP. License = join-check, then 1 key.",
    download: "/api/extension/download?tool=boost",
    start: "license_boost",
    page: "/tools/fb-boost-tools",
  },
  {
    name: "FB Reset Tools",
    blurbBn: "রিসেট টুলস স্লট। Download চাপলে ফাইল (আসলে ZIP), License চাপলে গ্রুপ ভেরিফাই করে ১টা কি।",
    blurbEn: "Reset tools slot. Download = ZIP when ready. License = join-check, then 1 key.",
    download: "/api/extension/download?tool=reset",
    start: "license_reset",
    page: "/tools/fb-reset-tools",
  },
];

function LicenseHub() {
  const { lang } = useLang();
  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-br from-violet-600 via-sky-500 to-cyan-400 p-6 text-white shadow-xl">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">License</h1>
          <p className="mt-2 max-w-xl text-sm text-white/90">
            {lang === "bn"
              ? "আগে @basictrick জয়েন। License চাপলে বট ভেরিফাই করে ১টা কি দেয়। ১ ডিভাইসে ১০টা Chrome/browser।"
              : "Join @basictrick first. License verifies membership, then 1 key. 10 browsers on 1 device."}
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {CARDS.map((card) => (
            <article
              key={card.name}
              className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-bold text-slate-900">{card.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{lang === "bn" ? card.blurbBn : card.blurbEn}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={card.download}>
                  <Button className="bg-sky-600 hover:bg-sky-700">Download</Button>
                </a>
                <a href={`https://t.me/basictrickbot?start=${card.start}`} target="_blank" rel="noreferrer">
                  <Button className="bg-violet-600 hover:bg-violet-700">License</Button>
                </a>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-6 text-xs text-slate-500">
          {lang === "bn"
            ? "License ক্লিক = Telegram বট খুলবে → গ্রুপ জয়েন চেক → কি। Download ক্লিক = এক্সটেনশন ZIP।"
            : "License opens the bot → group join check → key. Download saves the extension ZIP."}
        </p>
      </div>
    </SiteShell>
  );
}
