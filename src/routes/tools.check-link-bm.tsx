import { createFileRoute } from "@tanstack/react-router";
import { BulkChecker } from "../components/tools/BulkChecker";
import { ToolsLayout } from "../components/tools/ToolsLayout";
import { LanguageProvider } from "../lib/language";
import { runBmLinkCheck } from "../lib/server-fns";

export const Route = createFileRoute("/tools/check-link-bm")({
  head: () => ({ meta: [{ title: "Check Link BM — Basictrick" }] }),
  component: () => (
    <LanguageProvider>
      <ToolsLayout activeSlug="check-link-bm">
        <BulkChecker
          title="Check Link BM"
          subtitle="Check BM invitation links — Available vs Accepted/Unavailable."
          placeholder={"1033730259341235|https://fb.me/asemjRDPooanFg\nhttps://fb.me/xxxxx"}
          onCheck={(text) => runBmLinkCheck({ data: { text } })}
          positiveLabel="Available"
          negativeLabel="Unavailable"
          positiveStatuses={["available"]}
          negativeStatuses={["unavailable"]}
        />
      </ToolsLayout>
    </LanguageProvider>
  ),
});
