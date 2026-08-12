import { createFileRoute } from "@tanstack/react-router";
import { getPublishedCatalog } from "../lib/db";

export const Route = createFileRoute("/api/tools")({
  server: {
    handlers: {
      GET: async () => {
        const catalog = await getPublishedCatalog();
        return Response.json({
          ok: true,
          categories: catalog.categories,
          tools: catalog.tools.map((t) => ({
            id: t.id,
            categoryId: t.categoryId,
            name: t.name,
            slug: t.slug,
            shortDescription: t.shortDescription,
            version: t.version,
            toolType: t.toolType,
            onlineRoute: t.onlineRoute,
            downloadUrl: t.downloadUrl,
          })),
        });
      },
    },
  },
});
