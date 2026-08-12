import { createFileRoute } from "@tanstack/react-router";
import { BulkChecker } from "../components/tools/BulkChecker";
import { ToolsLayout } from "../components/tools/ToolsLayout";
import { LanguageProvider } from "../lib/language";
import { runUidCheck } from "../lib/server-fns";

export const Route = createFileRoute("/tools/check-live-uid")({
  head: () => ({ meta: [{ title: "Check Live UID — Basictrick" }] }),
  component: () => (
    <LanguageProvider>
      <ToolsLayout activeSlug="check-live-uid">
        <BulkChecker
          title="Check Live UID Facebook"
          subtitle="Bulk verify whether Facebook User IDs are live or dead."
          placeholder={"100012345678901\n100023456789012"}
          onCheck={(text) => runUidCheck({ data: { text } })}
        />
      </ToolsLayout>
    </LanguageProvider>
  ),
});
