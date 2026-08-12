import { useMemo, useState } from "react";
import type { CheckItemResult } from "../../lib/facebook/checkers";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

function itemId(i: CheckItemResult) {
  return (i.id || i.input || "").trim();
}

export function BulkChecker({
  title,
  subtitle,
  placeholder,
  onCheck,
  positiveLabel = "Live Account",
  negativeLabel = "Dead Account",
  positiveStatuses = ["live", "available"],
  negativeStatuses = ["dead", "unavailable"],
  showNameBadge = false,
}: {
  title: string;
  subtitle: string;
  placeholder: string;
  onCheck: (text: string) => Promise<CheckItemResult[]>;
  positiveLabel?: string;
  negativeLabel?: string;
  positiveStatuses?: string[];
  negativeStatuses?: string[];
  /** Show account/BM name next to ID when available (e.g. BM Name tool) */
  showNameBadge?: boolean;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CheckItemResult[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const positive = useMemo(
    () => results.filter((r) => positiveStatuses.includes(r.status)),
    [results, positiveStatuses],
  );
  const negative = useMemo(
    () => results.filter((r) => negativeStatuses.includes(r.status)),
    [results, negativeStatuses],
  );
  const other = useMemo(
    () =>
      results.filter(
        (r) => !positiveStatuses.includes(r.status) && !negativeStatuses.includes(r.status),
      ),
    [results, positiveStatuses, negativeStatuses],
  );

  const total = results.length;
  const livePct = total ? ((positive.length / total) * 100).toFixed(1) : "0.0";
  const deadPct = total ? ((negative.length / total) * 100).toFixed(1) : "0.0";

  async function run() {
    setLoading(true);
    setProgress(12);
    const tick = window.setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + 8));
    }, 200);
    try {
      const res = await onCheck(text);
      setResults(res);
      setProgress(100);
    } finally {
      window.clearInterval(tick);
      setLoading(false);
      window.setTimeout(() => setProgress(0), 800);
    }
  }

  function flashCopied(key: string) {
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1500);
  }

  function copyList(items: CheckItemResult[], key: string) {
    const payload = items.map(itemId).filter(Boolean).join("\n");
    void navigator.clipboard.writeText(payload);
    flashCopied(key);
  }

  function exportList(items: CheckItemResult[], filename: string) {
    const payload = items.map(itemId).filter(Boolean).join("\n");
    const blob = new Blob([payload], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const rows = [
      ["uid", "status", "note"],
      ...results.map((r) => [
        itemId(r),
        r.status,
        friendlyNote(r),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "basictrick-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        <p className="mt-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Best-effort public checks — Facebook may rate-limit. No Meta Developer App required.
        </p>
      </div>

      {(loading || progress > 0) && (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-medium text-emerald-700">
            <span>{progress >= 100 ? "Complete!" : "Checking…"}</span>
            <span>{Math.min(progress, 100)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="text-sm font-medium text-slate-700">Input (one per line)</label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="min-h-40 font-mono text-sm"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={run}
            disabled={loading || !text.trim()}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? "Checking…" : "Check"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setText("");
              setResults([]);
              setProgress(0);
            }}
          >
            Reset
          </Button>
          {results.length > 0 && (
            <Button variant="outline" onClick={exportCsv}>
              Export CSV
            </Button>
          )}
          {copied && (
            <span className="text-xs font-medium text-emerald-600">{copied} copied</span>
          )}
        </div>
      </div>

      {results.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <ResultPane
              title={positiveLabel}
              count={positive.length}
              tone="live"
              items={positive}
              showNameBadge={showNameBadge}
              copied={copied === "live"}
              onCopy={() => copyList(positive, "live")}
              onExport={() => exportList(positive, "live-uids.txt")}
            />
            <ResultPane
              title={negativeLabel}
              count={negative.length}
              tone="dead"
              items={negative}
              showNameBadge={showNameBadge}
              copied={copied === "dead"}
              onCopy={() => copyList(negative, "dead")}
              onExport={() => exportList(negative, "dead-uids.txt")}
            />
          </div>

          {other.length > 0 && (
            <ResultPane
              title="Need review"
              count={other.length}
              tone="other"
              items={other}
              showNameBadge={showNameBadge}
              showFriendlyNote
              copied={copied === "other"}
              onCopy={() => copyList(other, "other")}
              onExport={() => exportList(other, "other-uids.txt")}
            />
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label="Live Account"
              value={positive.length}
              hint={`${livePct}% of the total`}
              tone="live"
            />
            <StatCard
              label="Dead Account"
              value={negative.length}
              hint={`${deadPct}% of the total`}
              tone="dead"
            />
            <StatCard
              label="Total Checked"
              value={total}
              hint="Total accounts checked"
              tone="total"
            />
          </div>
        </>
      )}
    </div>
  );
}

function friendlyNote(r: CheckItemResult) {
  if (r.status === "live" || r.status === "available") return "Active / reachable";
  if (r.status === "dead" || r.status === "unavailable") return "Inactive or not found";
  if (r.detail && !looksLikeRawJunk(r.detail)) return r.detail;
  if (r.status === "error") return "Check failed — try again";
  if (r.status === "unknown") return "Could not confirm";
  return r.status;
}

function looksLikeRawJunk(s: string) {
  return (
    s.includes("{") ||
    s.includes("<") ||
    s.includes("is_silhouette") ||
    s.includes("http://") ||
    s.includes("https://") ||
    s.length > 80
  );
}

function ResultPane({
  title,
  count,
  tone,
  items,
  onCopy,
  onExport,
  copied,
  showNameBadge,
  showFriendlyNote,
}: {
  title: string;
  count: number;
  tone: "live" | "dead" | "other";
  items: CheckItemResult[];
  onCopy: () => void;
  onExport: () => void;
  copied?: boolean;
  showNameBadge?: boolean;
  showFriendlyNote?: boolean;
}) {
  const header =
    tone === "live"
      ? "border-emerald-100 bg-emerald-50/60 text-emerald-800"
      : tone === "dead"
        ? "border-rose-100 bg-rose-50/60 text-rose-800"
        : "border-amber-100 bg-amber-50/60 text-amber-900";

  const icon = tone === "live" ? "✓" : tone === "dead" ? "✕" : "!";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className={`flex items-center justify-between border-b px-4 py-3 ${header}`}>
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white ${
              tone === "live" ? "bg-emerald-500" : tone === "dead" ? "bg-rose-500" : "bg-amber-500"
            }`}
          >
            {icon}
          </span>
          {title} ({count})
        </h3>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" disabled={!items.length} onClick={onCopy}>
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" disabled={!items.length} onClick={onExport}>
            Export
          </Button>
        </div>
      </div>
      <div className="max-h-72 space-y-1.5 overflow-auto bg-slate-50/80 p-3">
        {items.length === 0 ? (
          <p className="px-1 py-6 text-center text-xs text-slate-400">No results yet</p>
        ) : (
          items.map((i, idx) => {
            const id = itemId(i);
            const note = showFriendlyNote ? friendlyNote(i) : null;
            return (
              <div
                key={`${id}-${idx}`}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs font-medium text-slate-800">{id}</p>
                  {showNameBadge && i.name ? (
                    <p className="truncate text-[11px] text-slate-500">{i.name}</p>
                  ) : null}
                  {note ? <p className="truncate text-[11px] text-slate-500">{note}</p> : null}
                </div>
                {id && /^\d+$/.test(id) ? (
                  <a
                    href={`https://facebook.com/${id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-[11px] font-medium text-sky-600 hover:underline"
                    title="Open on Facebook"
                  >
                    Open
                  </a>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  tone: "live" | "dead" | "total";
}) {
  const styles =
    tone === "live"
      ? "border-emerald-100 from-emerald-50 to-white"
      : tone === "dead"
        ? "border-rose-100 from-rose-50 to-white"
        : "border-sky-100 from-sky-50 to-white";
  const iconBg =
    tone === "live" ? "bg-emerald-500" : tone === "dead" ? "bg-rose-500" : "bg-sky-500";
  const icon = tone === "live" ? "✓" : tone === "dead" ? "✕" : "≡";

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 shadow-sm ${styles}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          <p className="mt-1 text-[11px] text-slate-500">{hint}</p>
        </div>
        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${iconBg}`}>
          {icon}
        </span>
      </div>
    </div>
  );
}
