import { createFileRoute } from "@tanstack/react-router";
import { markOrderPaid } from "../lib/telegram/payments";
import { pushTgLog } from "../lib/telegram/store";

export const Route = createFileRoute("/api/payments/zinipay/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as {
          metadata?: { order_id?: string };
          order_id?: string;
          status?: string;
          id?: string;
        };
        const orderId = body.metadata?.order_id || body.order_id;
        if (orderId && (body.status === "COMPLETED" || body.status === "completed" || body.status === "paid" || !body.status)) {
          await markOrderPaid(orderId, body.id);
          await pushTgLog("info", `ZiniPay webhook paid ${orderId}`);
        }
        return Response.json({ ok: true });
      },
    },
  },
});
