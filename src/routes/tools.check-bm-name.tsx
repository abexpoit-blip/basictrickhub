import { createFileRoute } from "@tanstack/react-router";
import { BulkChecker } from "../components/tools/BulkChecker";
import { ToolsLayout } from "../components/tools/ToolsLayout";
import { LanguageProvider } from "../lib/language";
import { runBmNameCheck } from "../lib/server-fns";

export const Route = createFileRoute("/tools/check-bm-name")({
  head: () => ({ meta: [{ title: "Check BM Name — Basictrick" }] }),
  component: () => (
    <LanguageProvider>
      <ToolsLayout activeSlug="check-bm-name">
        <BulkChecker
          title="Check BM Name"
          subtitle="Look up Business Manager display names from BM IDs."
          placeholder={"123456789012345"}
          onCheck={(text) => runBmNameCheck({ data: { text } })}
          positiveLabel="Found"
          negativeLabel="Not found"
          showNameBadge
        />
      </ToolsLayout>
    </LanguageProvider>
  ),
});
