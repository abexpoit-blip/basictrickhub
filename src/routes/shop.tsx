import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteShell } from "../components/layout/SiteShell";
import { LanguageProvider, copy, useLang } from "../lib/language";
import { fetchProducts, fetchSettings } from "../lib/server-fns";
import type { Product } from "../lib/types";

export const Route = createFileRoute("/shop")({
  head: () => ({ meta: [{ title: "Shop — Basictrick" }] }),
  component: () => (
    <LanguageProvider>
      <ShopPage />
    </LanguageProvider>
  ),
});

function ShopPage() {
  const { lang } = useLang();
  const t = copy[lang];
  const [products, setProducts] = useState<Product[]>([]);
  const [telegramUrl, setTelegramUrl] = useState("https://t.me/basictrick");
  const [tagline, setTagline] = useState("");

  useEffect(() => {
    void Promise.all([fetchProducts(), fetchSettings()]).then(([p, s]) => {
      setProducts(p);
      setTelegramUrl(s.telegramUrl);
      setTagline(s.tagline);
    });
  }, []);

  return (
    <SiteShell telegramUrl={telegramUrl} tagline={tagline}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold text-slate-900">{t.shopTitle}</h1>
        <p className="mt-2 text-slate-500">Digital methods & VIP access — purchase via Telegram.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <article key={p.id} className="flex flex-col rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">{p.name}</h2>
              <p className="mt-2 flex-1 text-sm text-slate-500 leading-relaxed">{p.description}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-sky-700">{p.priceLabel}</span>
                <a
                  href={p.telegramUrl || telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700"
                >
                  {t.buyTelegram}
                </a>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-slate-400">
          Need something custom? <Link to="/contact" className="text-sky-600 hover:underline">Contact us</Link>
        </p>
      </div>
    </SiteShell>
  );
}
