import { createFileRoute } from "@tanstack/react-router";
import { BulkChecker } from "../components/tools/BulkChecker";
import { ToolsLayout } from "../components/tools/ToolsLayout";
import { LanguageProvider } from "../lib/language";
import { runBmLiveCheck } from "../lib/server-fns";

export const Route = createFileRoute("/tools/check-live-bm")({
  head: () => ({ meta: [{ title: "Check Live BM — Basictrick" }] }),
  component: () => (
    <LanguageProvider>
      <ToolsLayout activeSlug="check-live-bm">
        <BulkChecker
          title="Check Live BM"
          subtitle="Check Business Manager live/dead status (best-effort public probe)."
          placeholder={"123456789012345\n987654321098765"}
          onCheck={(text) => runBmLiveCheck({ data: { text } })}
          positiveLabel="Live BM"
          negativeLabel="Dead BM"
          showNameBadge
        />
      </ToolsLayout>
    </LanguageProvider>
  ),
});
