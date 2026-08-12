import { createFileRoute } from "@tanstack/react-router";
import { AdsterraGenerator } from "../components/tools/AdsterraGenerator";
import { ToolsLayout } from "../components/tools/ToolsLayout";
import { LanguageProvider } from "../lib/language";

export const Route = createFileRoute("/tools/adsterra-image-generator")({
  head: () => ({ meta: [{ title: "Adsterra Image Generator — Basictrick" }] }),
  component: () => (
    <LanguageProvider>
      <ToolsLayout activeSlug="adsterra-image-generator">
        <AdsterraGenerator />
      </ToolsLayout>
    </LanguageProvider>
  ),
});
