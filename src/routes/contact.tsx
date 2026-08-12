import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteShell } from "../components/layout/SiteShell";
import { LanguageProvider, copy, useLang } from "../lib/language";
import { fetchSettings } from "../lib/server-fns";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Basictrick" }] }),
  component: () => (
    <LanguageProvider>
      <ContactPage />
    </LanguageProvider>
  ),
});

function ContactPage() {
  const { lang } = useLang();
  const t = copy[lang];
  const [settings, setSettings] = useState({
    telegramUrl: "https://t.me/basictrick",
    telegramSupport: "https://t.me/basictrick",
    contactEmail: "support@basictrick.com",
    tagline: "",
  });

  useEffect(() => {
    void fetchSettings().then(setSettings);
  }, []);

  return (
    <SiteShell telegramUrl={settings.telegramUrl} tagline={settings.tagline}>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold text-slate-900">{t.contactTitle}</h1>
        <p className="mt-2 text-slate-500">Reach the Basictrick team on Telegram for shop, VIP, and support.</p>
        <div className="mt-8 space-y-4 rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
          <a
            href={settings.telegramUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700"
          >
            Join Community Telegram
            <span>→</span>
          </a>
          <a
            href={settings.telegramSupport}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-xl border border-sky-200 px-4 py-3 text-sm font-semibold text-sky-800 hover:bg-sky-50"
          >
            Message Support
            <span>→</span>
          </a>
          <p className="text-sm text-slate-500">
            Email:{" "}
            <a className="text-sky-700 hover:underline" href={`mailto:${settings.contactEmail}`}>
              {settings.contactEmail}
            </a>
          </p>
        </div>
      </div>
    </SiteShell>
  );
}
