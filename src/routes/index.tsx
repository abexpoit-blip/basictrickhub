import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logoBT from "../assets/logo-bt.png";
import { SiteShell } from "../components/layout/SiteShell";
import { copy, LanguageProvider, useLang } from "../lib/language";
import { fetchSettings } from "../lib/server-fns";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Basictrick — Trusted Telegram Community" },
      {
        name: "description",
        content:
          "Basictrick — Facebook Autopay Threshold methods, boost ads, community tools. Earn $10–100 daily.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <LanguageProvider>
      <HomeInner />
    </LanguageProvider>
  );
}

function HomeInner() {
  const { lang, ready } = useLang();
  const t = copy[lang];
  const [telegramUrl, setTelegramUrl] = useState("https://t.me/basictrick");

  useEffect(() => {
    void fetchSettings().then((s) => {
      setTelegramUrl(s.telegramUrl);
    });
  }, []);

  if (!ready) {
    return <div className="min-h-screen bg-[#f5fbff]" />;
  }

  const services = [
    { title: t.s1t, desc: t.s1d },
    { title: t.s2t, desc: t.s2d },
    { title: t.s3t, desc: t.s3d },
    { title: t.s4t, desc: t.s4d },
    { title: t.s5t, desc: t.s5d },
    { title: t.s6t, desc: t.s6d },
  ];

  const steps = [
    { title: t.how1t, desc: t.how1d, n: "01" },
    { title: t.how2t, desc: t.how2d, n: "02" },
    { title: t.how3t, desc: t.how3d, n: "03" },
  ];

  const why = [t.why1, t.why2, t.why3, t.why4];

  return (
    <SiteShell telegramUrl={telegramUrl} tagline={t.footerTag}>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#bae6fd_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_right,_#e0f2fe_0%,_transparent_40%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
          <div>
            <p className="mb-4 inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold tracking-wider text-sky-700">
              {t.trusted}
            </p>
            <div className="mb-4 flex items-center gap-3">
              <img
                src={logoBT}
                alt="Basictrick"
                className="h-16 w-16 object-contain drop-shadow-sm sm:h-20 sm:w-20"
              />
              <h1 className="text-4xl font-extrabold tracking-tight text-sky-800 sm:text-5xl md:text-6xl">
                Basictrick
              </h1>
            </div>
            <p className="max-w-xl text-lg font-medium text-slate-700 sm:text-xl">{t.heroTitle}</p>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-500">{t.heroSub}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/tools"
                className="rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700"
              >
                {t.heroCtaTools}
              </Link>
              <Link
                to="/shop"
                className="rounded-full border border-sky-200 bg-white px-6 py-3 text-sm font-semibold text-sky-800 transition hover:bg-sky-50"
              >
                {t.heroCtaShop}
              </Link>
              <a
                href={telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-transparent px-6 py-3 text-sm font-semibold text-sky-700 hover:underline"
              >
                {t.getStarted} →
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-sky-300/40 to-cyan-200/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-sky-100 bg-white/90 p-6 shadow-xl shadow-sky-100">
              <p className="text-xs font-bold uppercase tracking-wider text-sky-500">{t.whatYouGet}</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                {[t.perk1, t.perk2, t.perk3, t.perk4, t.perk5].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="text-sky-500">▸</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/tools/adsterra-image-generator"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                {t.tryAdsterra}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-sky-100/80 bg-white/60 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-wider text-sky-500">{t.servicesEy}</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-slate-900">{t.servicesTitle}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">{t.servicesSub}</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <article
                key={s.title}
                className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm transition hover:border-sky-300"
              >
                <h3 className="text-base font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-wider text-sky-500">{t.howEy}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{t.howTitle}</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
                <span className="text-2xl font-extrabold text-sky-200">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-sky-100/80 bg-gradient-to-b from-sky-50/80 to-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-wider text-sky-500">{t.whyEy}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{t.whyTitle}</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {why.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm text-slate-700"
              >
                <span className="mt-0.5 text-sky-600">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/tools"
              className="rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
            >
              {t.heroCtaTools}
            </Link>
            <Link
              to="/method"
              className="rounded-full border border-sky-200 bg-white px-5 py-2.5 text-sm font-semibold text-sky-800 hover:bg-sky-50"
            >
              {t.navMethod}
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-sky-600 to-cyan-600 px-6 py-12 text-center shadow-xl shadow-sky-200 sm:px-10">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">{t.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-sky-50">{t.ctaSub}</p>
          <a
            href={telegramUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-sky-700 hover:bg-sky-50"
          >
            {t.ctaBtn}
          </a>
        </div>
      </section>
    </SiteShell>
  );
}
