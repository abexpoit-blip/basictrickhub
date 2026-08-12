import { createFileRoute } from "@tanstack/react-router";
import { BulkChecker } from "../components/tools/BulkChecker";
import { ToolsLayout } from "../components/tools/ToolsLayout";
import { LanguageProvider } from "../lib/language";
import { runBmVerifiedCheck } from "../lib/server-fns";

export const Route = createFileRoute("/tools/check-bm-verified")({
  head: () => ({ meta: [{ title: "Check BM Verified — Basictrick" }] }),
  component: () => (
    <LanguageProvider>
      <ToolsLayout activeSlug="check-bm-verified">
        <BulkChecker
          title="Check BM Verified"
          subtitle="Check Business Manager verification signals when publicly available."
          placeholder={"123456789012345"}
          onCheck={(text) => runBmVerifiedCheck({ data: { text } })}
          positiveLabel="Verified"
          negativeLabel="Not verified"
          showNameBadge
        />
      </ToolsLayout>
    </LanguageProvider>
  ),
});
