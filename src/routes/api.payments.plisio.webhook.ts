import { createFileRoute } from "@tanstack/react-router";
import { markOrderPaid } from "../lib/telegram/payments";
import { pushTgLog } from "../lib/telegram/store";

export const Route = createFileRoute("/api/payments/plisio/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as {
          order_number?: string;
          status?: string;
          txn_id?: string;
        };
        // Also support form-urlencoded style fields if sent as JSON via ?json=true
        if (body.order_number && (body.status === "completed" || body.status === "mismatch")) {
          if (body.status === "completed") {
            await markOrderPaid(body.order_number, body.txn_id);
            await pushTgLog("info", `Plisio webhook paid ${body.order_number}`);
          }
        }
        return Response.json({ ok: true });
      },
      GET: async ({ request }) => {
        // Plisio sometimes hits with query params
        const url = new URL(request.url);
        const order = url.searchParams.get("order_number");
        const status = url.searchParams.get("status");
        if (order && status === "completed") {
          await markOrderPaid(order);
        }
        return Response.json({ ok: true });
      },
    },
  },
});
