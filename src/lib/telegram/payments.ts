import { newId } from "../utils";
import { getTelegramData, updateTelegramData, pushTgLog } from "./store";
import type { TgOrder, TgStoreProduct } from "./types";

export async function createZiniPayInvoice(opts: {
  product: TgStoreProduct;
  telegramUserId: string;
  telegramUsername?: string;
  currency: "BDT" | "USD";
}) {
  const data = await getTelegramData();
  const apiKey = data.config.zinipayApiKey;
  const amount = opts.currency === "BDT" ? opts.product.priceBdt : opts.product.priceUsd;
  const order: TgOrder = {
    id: newId("ord"),
    productId: opts.product.id,
    productName: opts.product.name,
    telegramUserId: opts.telegramUserId,
    telegramUsername: opts.telegramUsername,
    amount,
    currency: opts.currency,
    gateway: "zinipay",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  if (!apiKey) {
    order.status = "pending";
    order.paymentUrl = `${data.config.sitePublicUrl}/admin/telegram?mockPay=${order.id}`;
    await updateTelegramData((d) => {
      d.orders.unshift(order);
      return d;
    });
    await pushTgLog("warn", `ZiniPay key missing — mock order ${order.id}`);
    return order;
  }

  const base = data.config.sitePublicUrl.replace(/\/$/, "");
  const res = await fetch("https://api.zinipay.com/v1/payment/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "zini-api-key": apiKey,
    },
    body: JSON.stringify({
      cus_name: opts.telegramUsername || opts.telegramUserId,
      amount,
      metadata: { order_id: order.id, product_id: opts.product.id, tg: opts.telegramUserId },
      redirect_url: `${base}/api/payments/zinipay?order=${order.id}&status=success`,
      cancel_url: `${base}/api/payments/zinipay?order=${order.id}&status=cancel`,
      webhook_url: `${base}/api/payments/zinipay/webhook`,
    }),
  });
  const json = (await res.json()) as { payment_url?: string; data?: { payment_url?: string }; id?: string };
  order.paymentUrl = json.payment_url || json.data?.payment_url;
  order.gatewayRef = json.id;
  await updateTelegramData((d) => {
    d.orders.unshift(order);
    return d;
  });
  await pushTgLog("info", `ZiniPay invoice created ${order.id}`);
  return order;
}

export async function createPlisioInvoice(opts: {
  product: TgStoreProduct;
  telegramUserId: string;
  telegramUsername?: string;
}) {
  const data = await getTelegramData();
  const apiKey = data.config.plisioApiKey;
  const order: TgOrder = {
    id: newId("ord"),
    productId: opts.product.id,
    productName: opts.product.name,
    telegramUserId: opts.telegramUserId,
    telegramUsername: opts.telegramUsername,
    amount: opts.product.priceUsd,
    currency: "USD",
    gateway: "plisio",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  if (!apiKey) {
    order.paymentUrl = `${data.config.sitePublicUrl}/admin/telegram?mockPay=${order.id}`;
    await updateTelegramData((d) => {
      d.orders.unshift(order);
      return d;
    });
    await pushTgLog("warn", `Plisio key missing — mock order ${order.id}`);
    return order;
  }

  const base = data.config.sitePublicUrl.replace(/\/$/, "");
  const params = new URLSearchParams({
    api_key: apiKey,
    order_name: opts.product.name,
    order_number: order.id,
    source_currency: "USD",
    source_amount: String(opts.product.priceUsd),
    currency: "USDT_TRX",
    callback_url: `${base}/api/payments/plisio/webhook?json=true`,
    email: `${opts.telegramUserId}@telegram.local`,
  });
  const res = await fetch(`https://api.plisio.net/api/v1/invoices/new?${params.toString()}`);
  const json = (await res.json()) as {
    status?: string;
    data?: { invoice_url?: string; txn_id?: string };
  };
  order.paymentUrl = json.data?.invoice_url;
  order.gatewayRef = json.data?.txn_id;
  await updateTelegramData((d) => {
    d.orders.unshift(order);
    return d;
  });
  await pushTgLog("info", `Plisio invoice created ${order.id}`);
  return order;
}

export async function markOrderPaid(orderId: string, gatewayRef?: string) {
  const updated = await updateTelegramData((d) => {
    const o = d.orders.find((x) => x.id === orderId);
    if (!o) return d;
    if (o.status === "delivered" || o.status === "paid") return d;
    o.status = "paid";
    o.paidAt = new Date().toISOString();
    if (gatewayRef) o.gatewayRef = gatewayRef;

    let member = d.members.find((m) => m.telegramUserId === o.telegramUserId);
    if (!member) {
      member = {
        telegramUserId: o.telegramUserId,
        username: o.telegramUsername,
        warns: 0,
        banned: false,
        addedGroupIds: [],
        purchasedProductIds: [],
        createdAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
      };
      d.members.push(member);
    }
    if (!member.purchasedProductIds.includes(o.productId)) {
      member.purchasedProductIds.push(o.productId);
    }
    const product = d.products.find((p) => p.id === o.productId);
    if (product?.type === "vip") {
      const until = new Date();
      until.setDate(until.getDate() + 30);
      member.vipUntil = until.toISOString();
    }
    o.status = "delivered";
    o.deliveredAt = new Date().toISOString();
    d.logs.push({
      id: `log-${Date.now()}`,
      at: new Date().toISOString(),
      level: "info",
      message: `Order paid & delivered ${orderId} → ${o.telegramUserId}`,
    });
    return d;
  });

  const order = updated.orders.find((x) => x.id === orderId);
  const product = updated.products.find((p) => p.id === order?.productId);
  const token = updated.config.botToken;
  if (token && order) {
    const invite = product?.telegramInvite
      ? `\nInvite: ${product.telegramInvite}`
      : "";
    const note = product?.deliveryNote ? `\n${product.deliveryNote}` : "";
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: order.telegramUserId,
          text: `✅ Payment confirmed!\nOrder: ${order.id}\n${order.productName}${note}${invite}\n\nThank you for buying from Basictrick.`,
        }),
      });
    } catch {
      await pushTgLog("warn", `Could not DM delivery for ${orderId}`);
    }
  }

  return updated;
}
