import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logoBT from "../../assets/logo-bt.png";
import { copy, useLang } from "../../lib/language";
import { cn } from "../../lib/utils";
import { LanguagePicker } from "../LanguagePicker";

export function Header({ telegramUrl }: { telegramUrl?: string }) {
  const { lang, setLang } = useLang();
  const t = copy[lang];
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/shop" as const, label: t.navShop },
    { to: "/method" as const, label: t.navMethod },
    { to: "/tools" as const, label: t.navTools },
    { to: "/license" as const, label: t.navLicense },
    { to: "/contact" as const, label: t.navContact },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-sky-100/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-18 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logoBT} alt="Basictrick" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
          <span className="text-lg sm:text-xl font-bold tracking-tight text-sky-700">Basictrick</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-sky-50 hover:text-sky-700"
              activeProps={{ className: "rounded-full px-3.5 py-2 text-sm font-medium bg-sky-100 text-sky-800" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex rounded-full border border-sky-100 bg-white p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={cn(
                "rounded-full px-2.5 py-1.5 transition",
                lang === "en" ? "bg-sky-600 text-white" : "text-slate-500",
              )}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("bn")}
              className={cn(
                "rounded-full px-2.5 py-1.5 transition",
                lang === "bn" ? "bg-sky-600 text-white" : "text-slate-500",
              )}
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              বাংলা
            </button>
          </div>

          <a
            href={telegramUrl || "https://t.me/basictrick"}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-700"
          >
            {t.getStarted}
          </a>

          <button
            type="button"
            className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-sky-50"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-sky-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-sky-50"
              >
                {l.label}
              </Link>
            ))}
            <a
              href={telegramUrl || "https://t.me/basictrick"}
              target="_blank"
              rel="noreferrer"
              className="mt-2 rounded-lg bg-sky-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
            >
              {t.getStarted}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer({ tagline }: { tagline?: string }) {
  const { lang } = useLang();
  const t = copy[lang];
  return (
    <footer className="border-t border-sky-100 bg-gradient-to-b from-white to-sky-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <img src={logoBT} alt="" className="h-8 w-8 object-contain" />
          <div>
            <p className="font-semibold text-sky-800">Basictrick</p>
            <p className="text-xs text-slate-500">{tagline || t.footerTag}</p>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} Basictrick. {lang === "bn" ? "সর্বস্বত্ব সংরক্ষিত।" : "All rights reserved."}
        </p>
      </div>
    </footer>
  );
}

export function SiteShell({
  children,
  telegramUrl,
  tagline,
}: {
  children: React.ReactNode;
  telegramUrl?: string;
  tagline?: string;
}) {
  const { lang } = useLang();
  return (
    <div className={cn("min-h-screen flex flex-col bg-[#f5fbff]", lang === "bn" && "font-bn")}>
      <LanguagePicker />
      <Header telegramUrl={telegramUrl} />
      <main className="flex-1">{children}</main>
      <Footer tagline={tagline} />
    </div>
  );
}
