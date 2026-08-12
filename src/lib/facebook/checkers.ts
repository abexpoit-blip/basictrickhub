export type CheckStatus = "live" | "dead" | "available" | "unavailable" | "unknown" | "error";

export interface CheckItemResult {
  input: string;
  id?: string;
  status: CheckStatus;
  detail?: string;
  name?: string;
}

function parseLine(line: string): { id: string; rest?: string; raw: string } {
  const raw = line.trim();
  if (!raw) return { id: "", raw };
  const pipe = raw.indexOf("|");
  if (pipe === -1) {
    const urlMatch = raw.match(/https?:\/\/\S+/i);
    if (urlMatch) return { id: raw.replace(urlMatch[0], "").trim() || urlMatch[0], rest: urlMatch[0], raw };
    return { id: raw, raw };
  }
  return { id: raw.slice(0, pipe).trim(), rest: raw.slice(pipe + 1).trim(), raw };
}

export function parseLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map(parseLine)
    .filter((x) => x.id || x.rest);
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

export async function checkLiveUids(text: string): Promise<CheckItemResult[]> {
  const lines = parseLines(text);
  return mapPool(lines, 20, async (line) => {
    const uid = (line.id || "").replace(/\D/g, "") || line.id;
    if (!uid) return { input: line.raw, status: "error" as const, detail: "Invalid UID" };
    try {
      const res = await fetch(
        `https://graph.facebook.com/${encodeURIComponent(uid)}/picture?redirect=false`,
        { signal: AbortSignal.timeout(12000) },
      );
      const body = await res.text();
      if (body.includes("height") && body.includes("width") && !body.includes("error")) {
        try {
          const json = JSON.parse(body) as { data?: { is_silhouette?: boolean } };
          if (json.data?.is_silhouette === true) {
            // Silhouette can still mean account exists; treat as live if dimensions present
          }
        } catch {
          /* ignore */
        }
        return { input: line.raw, id: uid, status: "live" as const };
      }
      return { input: line.raw, id: uid, status: "dead" as const, detail: "Inactive or not found" };
    } catch (e) {
      return {
        input: line.raw,
        id: uid,
        status: "error" as const,
        detail: e instanceof Error ? e.message : "Request failed",
      };
    }
  });
}

export async function checkLiveBms(text: string): Promise<CheckItemResult[]> {
  const lines = parseLines(text);
  return mapPool(lines, 10, async (line) => {
    const id = (line.id || "").replace(/\D/g, "");
    if (!id) return { input: line.raw, status: "error" as const, detail: "Invalid BM ID" };
    try {
      const graph = await fetch(`https://graph.facebook.com/${encodeURIComponent(id)}?fields=id,name`, {
        signal: AbortSignal.timeout(12000),
      });
      const gText = await graph.text();
      if (gText.includes('"name"') || (gText.includes('"id"') && !gText.includes("error"))) {
        let name: string | undefined;
        try {
          name = (JSON.parse(gText) as { name?: string }).name;
        } catch {
          /* ignore */
        }
        return { input: line.raw, id, status: "live" as const, name };
      }

      const page = await fetch(`https://www.facebook.com/${encodeURIComponent(id)}`, {
        redirect: "follow",
        signal: AbortSignal.timeout(12000),
        headers: { "user-agent": "Mozilla/5.0 BasictrickChecker/1.0" },
      });
      const html = await page.text();
      if (page.status === 404 || /content not found|page isn't available|doesn't exist/i.test(html)) {
        return { input: line.raw, id, status: "dead" as const };
      }
      if (page.ok) return { input: line.raw, id, status: "live" as const };
      return { input: line.raw, id, status: "unknown" as const, detail: "Could not confirm (blocked or rate-limited)" };
    } catch (e) {
      return {
        input: line.raw,
        id,
        status: "error" as const,
        detail: e instanceof Error ? e.message : "Request failed",
      };
    }
  });
}

export async function checkBmVerified(text: string): Promise<CheckItemResult[]> {
  const lines = parseLines(text);
  return mapPool(lines, 8, async (line) => {
    const id = (line.id || "").replace(/\D/g, "");
    if (!id) return { input: line.raw, status: "error" as const, detail: "Invalid BM ID" };
    try {
      const res = await fetch(
        `https://graph.facebook.com/${encodeURIComponent(id)}?fields=id,name,verification_status`,
        { signal: AbortSignal.timeout(12000) },
      );
      const body = await res.text();
      try {
        const json = JSON.parse(body) as {
          name?: string;
          verification_status?: string;
          error?: unknown;
        };
        if (json.error) {
          return { input: line.raw, id, status: "unknown" as const, detail: "Verification not publicly available" };
        }
        const status = (json.verification_status || "").toLowerCase();
        if (status === "verified") {
          return { input: line.raw, id, status: "live" as const, name: json.name, detail: "verified" };
        }
        if (status) {
          return {
            input: line.raw,
            id,
            status: "dead" as const,
            name: json.name,
            detail: "Not verified",
          };
        }
      } catch {
        /* fall through */
      }
      return { input: line.raw, id, status: "unknown" as const, detail: "Could not determine verification" };
    } catch (e) {
      return {
        input: line.raw,
        id,
        status: "error" as const,
        detail: e instanceof Error ? e.message : "Request failed",
      };
    }
  });
}

export async function checkBmLinks(text: string): Promise<CheckItemResult[]> {
  const lines = parseLines(text);
  return mapPool(lines, 8, async (line) => {
    const url = line.rest || line.id;
    if (!/^https?:\/\//i.test(url)) {
      return { input: line.raw, status: "error" as const, detail: "Need a valid http(s) invite link" };
    }
    try {
      const res = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
        headers: { "user-agent": "Mozilla/5.0 BasictrickChecker/1.0" },
      });
      const html = await res.text();
      const lower = html.toLowerCase();
      if (
        /already (been )?accepted|invitation.*(no longer|expired|invalid)|link.*(expired|invalid)|not available/i.test(
          lower,
        )
      ) {
        return {
          input: line.raw,
          id: line.id,
          status: "unavailable" as const,
          detail: "Accepted / unavailable",
        };
      }
      if (
        /accept invitation|join this business|business manager invitation|you've been invited/i.test(lower) ||
        res.ok
      ) {
        return {
          input: line.raw,
          id: line.id,
          status: "available" as const,
          detail: "Likely still available",
        };
      }
      return { input: line.raw, id: line.id, status: "unknown" as const, detail: "Could not confirm link status" };
    } catch (e) {
      return {
        input: line.raw,
        id: line.id,
        status: "error" as const,
        detail: e instanceof Error ? e.message : "Request failed",
      };
    }
  });
}

export async function checkBmNames(text: string): Promise<CheckItemResult[]> {
  const lines = parseLines(text);
  return mapPool(lines, 10, async (line) => {
    const id = (line.id || "").replace(/\D/g, "");
    if (!id) return { input: line.raw, status: "error" as const, detail: "Invalid BM ID" };
    try {
      const res = await fetch(`https://graph.facebook.com/${encodeURIComponent(id)}?fields=id,name`, {
        signal: AbortSignal.timeout(12000),
      });
      const body = await res.text();
      try {
        const json = JSON.parse(body) as { name?: string; error?: unknown };
        if (json.name) {
          return { input: line.raw, id, status: "live" as const, name: json.name };
        }
      } catch {
        /* ignore */
      }

      const page = await fetch(`https://business.facebook.com/overview?business_id=${encodeURIComponent(id)}`, {
        redirect: "manual",
        signal: AbortSignal.timeout(12000),
        headers: { "user-agent": "Mozilla/5.0 BasictrickChecker/1.0" },
      });
      const loc = page.headers.get("location") || "";
      if (loc) {
        return { input: line.raw, id, status: "unknown" as const, detail: "Redirected — name not public" };
      }
      return { input: line.raw, id, status: "unknown" as const, detail: "Name not publicly available" };
    } catch (e) {
      return {
        input: line.raw,
        id,
        status: "error" as const,
        detail: e instanceof Error ? e.message : "Request failed",
      };
    }
  });
}

function extractIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const idParam = u.searchParams.get("id");
    if (idParam && /^\d+$/.test(idParam)) return idParam;

    const patterns = [
      /\/(?:profile\.php\?id=)(\d+)/i,
      /\/groups\/(\d+)/i,
      /\/pages\/[^/]+\/(\d+)/i,
      /\/(?:story\.php\?story_fbid=)(\d+)/i,
      /\/reel\/(\d+)/i,
      /\/videos\/(\d+)/i,
      /\/posts\/(\d+)/i,
      /facebook\.com\/(\d{5,})/i,
    ];
    for (const re of patterns) {
      const m = url.match(re);
      if (m?.[1]) return m[1];
    }
    return null;
  } catch {
    return null;
  }
}

function extractIdFromHtml(html: string): string | null {
  const patterns = [
    /"entity_id"\s*:\s*"?(\d+)"?/,
    /"userID"\s*:\s*"(\d+)"/,
    /"pageID"\s*:\s*"(\d+)"/,
    /"page_id"\s*:\s*"?(\d+)"?/,
    /"groupID"\s*:\s*"(\d+)"/,
    /content="fb:\/\/(?:profile|page|group)\/(\d+)"/,
    /property="al:android:url"\s+content="fb:\/\/(?:page|profile)\/(\d+)"/,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

export async function findFacebookIds(text: string): Promise<CheckItemResult[]> {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  return mapPool(lines, 6, async (raw) => {
    const fromUrl = extractIdFromUrl(raw);
    if (fromUrl) {
      return { input: raw, id: fromUrl, status: "live" as const, detail: "Parsed from URL" };
    }
    if (!/^https?:\/\//i.test(raw)) {
      return { input: raw, status: "error" as const, detail: "Provide a Facebook URL" };
    }
    try {
      const targets = [raw];
      if (raw.includes("facebook.com")) {
        targets.push(raw.replace("www.facebook.com", "mbasic.facebook.com").replace("://facebook.com", "://mbasic.facebook.com"));
      }
      for (const target of targets) {
        const res = await fetch(target, {
          redirect: "follow",
          signal: AbortSignal.timeout(15000),
          headers: { "user-agent": "Mozilla/5.0 BasictrickChecker/1.0" },
        });
        const html = await res.text();
        const id = extractIdFromHtml(html) || extractIdFromUrl(res.url);
        if (id) {
          return { input: raw, id, status: "live" as const, detail: "Extracted from page" };
        }
      }
      return { input: raw, status: "unknown" as const, detail: "ID not found on this page" };
    } catch (e) {
      return {
        input: raw,
        status: "error" as const,
        detail: e instanceof Error ? e.message : "Request failed",
      };
    }
  });
}

export const FACEBOOK_QUICK_LINKS = [
  { title: "Ads Manager", url: "https://www.facebook.com/adsmanager/manage/campaigns" },
  { title: "Business Settings", url: "https://business.facebook.com/settings" },
  { title: "Business Manager Home", url: "https://business.facebook.com/" },
  { title: "Billing & Payments", url: "https://business.facebook.com/billing_hub/payment_activity" },
  { title: "Ad Account Settings", url: "https://www.facebook.com/ads/manager/account_settings/" },
  { title: "Pages", url: "https://www.facebook.com/pages/?category=your_pages" },
  { title: "Meta Business Suite", url: "https://business.facebook.com/latest/home" },
  { title: "Events Manager (Pixels)", url: "https://business.facebook.com/events_manager2" },
  { title: "Audience Insights", url: "https://www.facebook.com/ads/audience-insights" },
  { title: "Creator Studio", url: "https://business.facebook.com/creatorstudio" },
];
