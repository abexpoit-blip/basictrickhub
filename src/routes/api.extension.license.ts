import { createFileRoute } from "@tanstack/react-router";
import { activateLicenseForDevice } from "../lib/telegram/extension-license";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: cors });
}

export const Route = createFileRoute("/api/extension/license")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async () =>
        json(
          { ok: false, valid: false, error: "POST key + deviceId required" },
          405,
        ),
      POST: async ({ request }) => {
        let key = "";
        let deviceId = "";
        try {
          const body = (await request.json()) as { key?: string; deviceId?: string };
          key = body.key || "";
          deviceId = body.deviceId || "";
        } catch {
          return json({ ok: false, valid: false, error: "Invalid body" }, 400);
        }
        if (!key.trim()) {
          return json({ ok: false, valid: false, error: "License key required" }, 400);
        }
        const result = await activateLicenseForDevice(key, deviceId);
        return json({ ok: true, ...result });
      },
    },
  },
});
