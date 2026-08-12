import { createFileRoute } from "@tanstack/react-router";
import { markOrderPaid } from "../lib/telegram/payments";
import { pushTgLog } from "../lib/telegram/store";

export const Route = createFileRoute("/api/payments/zinipay")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const order = url.searchParams.get("order");
        const status = url.searchParams.get("status");
        if (order && status === "success") {
          await markOrderPaid(order);
          await pushTgLog("info", `ZiniPay redirect success ${order}`);
          return Response.redirect(new URL("/shop?paid=1", request.url).toString(), 302);
        }
        return Response.redirect(new URL("/shop?paid=0", request.url).toString(), 302);
      },
    },
  },
});
