import { createFileRoute } from "@tanstack/react-router";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function filesFor(tool: string) {
  if (tool === "reset") {
    return {
      filename: "fb-reset-tools.zip",
      paths: [
        path.join(process.cwd(), "public", "downloads", "fb-reset-tools.zip"),
        path.join(process.cwd(), "uploads", "fb-reset-tools.zip"),
      ],
    };
  }
  return {
    filename: "fb-boost-tools.zip",
    paths: [
      path.join(process.cwd(), "public", "downloads", "basictrick-post-booster.zip"),
      path.join(process.cwd(), "public", "downloads", "fb-boost-tools.zip"),
      path.join(process.cwd(), "uploads", "basictrick-post-booster.zip"),
    ],
  };
}

export const Route = createFileRoute("/api/extension/download")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const tool = (url.searchParams.get("tool") || "boost").toLowerCase();
        const pack = filesFor(tool);
        for (const file of pack.paths) {
          try {
            await access(file);
            const buf = await readFile(file);
            return new Response(buf, {
              headers: {
                ...cors,
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="${pack.filename}"`,
                "Cache-Control": "no-store",
              },
            });
          } catch {
            /* try next */
          }
        }
        return Response.json(
          {
            ok: false,
            error:
              tool === "reset"
                ? "FB Reset Tools zip coming soon"
                : "FB Boost Tools zip not found",
          },
          { status: 404, headers: cors },
        );
      },
    },
  },
});
