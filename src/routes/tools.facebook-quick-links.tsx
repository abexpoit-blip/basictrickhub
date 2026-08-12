import { createFileRoute } from "@tanstack/react-router";
import { ToolsLayout } from "../components/tools/ToolsLayout";
import { LanguageProvider } from "../lib/language";
import { FACEBOOK_QUICK_LINKS } from "../lib/facebook/checkers";

export const Route = createFileRoute("/tools/facebook-quick-links")({
  head: () => ({ meta: [{ title: "Facebook Quick Links — Basictrick" }] }),
  component: () => (
    <LanguageProvider>
      <ToolsLayout activeSlug="facebook-quick-links">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Facebook Quick Links</h1>
            <p className="mt-1 text-sm text-slate-500">
              Shortcuts to Ads Manager, Business Settings, billing, pixels, and more.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {FACEBOOK_QUICK_LINKS.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-sky-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-sky-300 hover:text-sky-800"
              >
                {link.title}
                <span className="mt-1 block text-xs font-normal text-slate-400 truncate">{link.url}</span>
              </a>
            ))}
          </div>
        </div>
      </ToolsLayout>
    </LanguageProvider>
  ),
});
