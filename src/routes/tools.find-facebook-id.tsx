import { createFileRoute } from "@tanstack/react-router";
import { BulkChecker } from "../components/tools/BulkChecker";
import { ToolsLayout } from "../components/tools/ToolsLayout";
import { LanguageProvider } from "../lib/language";
import { runFindId } from "../lib/server-fns";

export const Route = createFileRoute("/tools/find-facebook-id")({
  head: () => ({ meta: [{ title: "Find Facebook ID — Basictrick" }] }),
  component: () => (
    <LanguageProvider>
      <ToolsLayout activeSlug="find-facebook-id">
        <BulkChecker
          title="Find Facebook ID"
          subtitle="Extract numeric Facebook IDs from profile, page, group, or post URLs."
          placeholder={"https://www.facebook.com/zuck\nhttps://www.facebook.com/profile.php?id=4"}
          onCheck={(text) => runFindId({ data: { text } })}
          positiveLabel="Found IDs"
          negativeLabel="Not found"
        />
      </ToolsLayout>
    </LanguageProvider>
  ),
});
