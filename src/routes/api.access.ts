import { createFileRoute } from "@tanstack/react-router";

/** Stub for future Telegram bot tool unlock / session exchange */
export const Route = createFileRoute("/api/access")({
  server: {
    handlers: {
      GET: async () =>
        Response.json({
          ok: true,
          message: "Access API ready for Telegram bot integration",
          endpoints: {
            validate: "POST /api/access/validate { key }",
            tools: "GET /api/tools",
          },
        }),
    },
  },
});
