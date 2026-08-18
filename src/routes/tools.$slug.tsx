import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ToolsLayout } from "../components/tools/ToolsLayout";
import { LanguageProvider, copy, useLang } from "../lib/language";
import { fetchTool } from "../lib/server-fns";
import type { CommunityTool } from "../lib/types";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/tools/$slug")({
  head: () => ({ meta: [{ title: "Tool — Basictrick" }] }),
  component: () => (
    <LanguageProvider>
      <ToolDetail />
    </LanguageProvider>
  ),
});

function ToolDetail() {
  const { slug } = Route.useParams();
  const { lang } = useLang();
  const t = copy[lang];
  const [tool, setTool] = useState<CommunityTool | null | undefined>(undefined);

  useEffect(() => {
    void fetchTool({ data: { slug } }).then((x) => setTool(x ?? null));
  }, [slug]);

  const downloadHref =
    tool?.downloadUrl ||
    (tool?.downloadPath ? `/uploads/${tool.downloadPath}` : undefined);

  return (
    <ToolsLayout activeSlug={slug}>
      {tool === undefined && <p className="text-slate-500">Loading…</p>}
      {tool === null && (
        <div>
          <p className="text-slate-500">Tool not found.</p>
          <Link to="/tools" className="mt-2 inline-block text-sky-600 hover:underline">
            Back to tools
          </Link>
        </div>
      )}
      {tool && (
        <article className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-sky-500">{tool.toolType}</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{tool.name}</h1>
            <p className="mt-2 text-slate-500">{tool.shortDescription}</p>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
            {tool.fullDescription}
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              {t.releaseNotes} · {t.version} {tool.version}
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{tool.releaseNotes}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(tool.toolType === "online" || tool.toolType === "generator") && tool.onlineRoute && (
              <Link to={tool.onlineRoute}>
                <Button className="bg-sky-600 hover:bg-sky-700">{t.launch}</Button>
              </Link>
            )}
            {tool.toolType === "download" && downloadHref && (
              <a href={downloadHref} download>
                <Button className="bg-sky-600 hover:bg-sky-700">{t.download}</Button>
              </a>
            )}
            {tool.toolType === "download" && !downloadHref && (
              <p className="text-sm text-amber-700">Download file coming soon — ask admin on Telegram.</p>
            )}
            {tool.toolType === "bookmark" && tool.bookmarkCode && (
              <a href={tool.bookmarkCode} className="inline-flex">
                <Button className="bg-sky-600 hover:bg-sky-700">Drag to Bookmarks</Button>
              </a>
            )}
          </div>
        </article>
      )}
    </ToolsLayout>
  );
}
