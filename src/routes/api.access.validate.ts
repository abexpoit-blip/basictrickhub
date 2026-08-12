import { createFileRoute } from "@tanstack/react-router";
import { validateAccessKey } from "../lib/db";

export const Route = createFileRoute("/api/access/validate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as { key?: string };
        if (!body.key) {
          return Response.json({ ok: false, valid: false, error: "key required" }, { status: 400 });
        }
        const found = await validateAccessKey(body.key);
        return Response.json({
          ok: true,
          valid: !!found,
          label: found?.label,
          telegramUserId: found?.telegramUserId,
        });
      },
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const key = url.searchParams.get("key");
        if (!key) {
          return Response.json({ ok: false, valid: false, error: "key required" }, { status: 400 });
        }
        const found = await validateAccessKey(key);
        return Response.json({ ok: true, valid: !!found, label: found?.label });
      },
    },
  },
});
