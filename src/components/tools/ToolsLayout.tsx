import { useEffect, useState, type ReactNode } from "react";
import { fetchCatalog } from "../../lib/server-fns";
import type { CommunityTool, ToolCategory } from "../../lib/types";
import { SiteShell } from "../layout/SiteShell";
import { ToolsSidebar } from "./ToolsSidebar";

export function ToolsLayout({
  children,
  activeSlug,
}: {
  children: ReactNode;
  activeSlug?: string;
}) {
  const [categories, setCategories] = useState<ToolCategory[]>([]);
  const [tools, setTools] = useState<CommunityTool[]>([]);
  const [telegramUrl, setTelegramUrl] = useState<string>();
  const [tagline, setTagline] = useState<string>();

  useEffect(() => {
    void fetchCatalog().then((data) => {
      setCategories(data.categories);
      setTools(data.tools);
      setTelegramUrl(data.settings.telegramUrl);
      setTagline(data.settings.tagline);
    });
  }, []);

  return (
    <SiteShell telegramUrl={telegramUrl} tagline={tagline}>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <ToolsSidebar categories={categories} tools={tools} activeSlug={activeSlug} />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </SiteShell>
  );
}
