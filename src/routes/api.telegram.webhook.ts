import { createFileRoute } from "@tanstack/react-router";
import { processTelegramUpdate } from "../lib/telegram/bot-engine";
import { getTelegramData, pushTgLog } from "../lib/telegram/store";

export const Route = createFileRoute("/api/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const secret = url.searchParams.get("secret");
        const data = await getTelegramData();
        if (!secret || secret !== data.config.webhookSecret) {
          return Response.json({ ok: false, error: "invalid secret" }, { status: 401 });
        }
        const update = await request.json();
        try {
          const result = await processTelegramUpdate(update);
          return Response.json(result);
        } catch (e) {
          await pushTgLog("error", e instanceof Error ? e.message : "webhook error");
          return Response.json({ ok: false }, { status: 500 });
        }
      },
      GET: async () =>
        Response.json({
          ok: true,
          message: "Basictrick Telegram webhook endpoint",
        }),
    },
  },
});
