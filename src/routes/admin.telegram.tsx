import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { verifyAdminPassword } from "../lib/server-fns";
import { BOT_COMMAND_DOCS } from "../lib/telegram/commands-catalog";
import {
  tgAdminAddGroup,
  tgAdminBotStatus,
  tgAdminBroadcastPost,
  tgAdminCreatePost,
  tgAdminDeletePost,
  tgAdminDeleteWebhook,
  tgAdminGet,
  tgAdminMarkPaid,
  tgAdminMemberAction,
  tgAdminRemoveGroup,
  tgAdminSaveAi,
  tgAdminSaveBooster,
  tgAdminSaveConfig,
  tgAdminSaveKeywords,
  tgAdminSaveLinks,
  tgAdminSaveNotes,
  tgAdminSavePremium,
  tgAdminSaveProducts,
  tgAdminSaveSecurity,
  tgAdminSetWebhook,
  tgAdminSyncGroups,
  tgAdminToggleGroup,
} from "../lib/telegram/admin-fns";
import type {
  BotProductType,
  PunishMode,
  TelegramBotData,
  TgAiIntent,
  TgKeywordRule,
  TgLinkButton,
  TgLocks,
  TgStoreProduct,
} from "../lib/telegram/types";
import { DEFAULT_LOCKS } from "../lib/telegram/types";
import { newId } from "../lib/utils";

export const Route = createFileRoute("/admin/telegram")({
  head: () => ({ meta: [{ title: "Telegram Omni Admin — Basictrick" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    mockPay: typeof s.mockPay === "string" ? s.mockPay : undefined,
  }),
  component: TelegramAdminPage,
});

const TABS = [
  "Overview",
  "Connect",
  "Groups",
  "Commands",
  "Booster",
  "AI Brain",
  "Posts",
  "Security",
  "Keywords",
  "Notes",
  "Store",
  "Links",
  "Orders",
  "Members",
  "Logs",
] as const;

const inputCls =
  "border-white/10 bg-[#0b1220] text-slate-100 placeholder:text-slate-500 focus-visible:ring-sky-500/40";
const PUNISH_MODES: PunishMode[] = ["warn", "mute", "tmute", "kick", "ban", "tban", "delete"];
const PRODUCT_TYPES: BotProductType[] = [
  "tool",
  "method",
  "course",
  "vip",
  "group",
  "account",
  "shortner",
  "card",
  "sitelist",
  "other",
];

const LINK_CATEGORIES = ["method", "tools", "shortner", "card", "sitelist", "other"] as const;

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-slate-500">{hint}</span>}
    </label>
  );
}

function Card({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#121a2b] to-[#0b1220] p-5 shadow-[0_0_0_1px_rgba(56,189,248,0.04)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, tone = "sky" }: { label: string; value: string | number; tone?: string }) {
  const tones: Record<string, string> = {
    sky: "from-sky-500/20 to-transparent text-sky-300",
    emerald: "from-emerald-500/20 to-transparent text-emerald-300",
    amber: "from-amber-500/20 to-transparent text-amber-300",
    violet: "from-violet-500/20 to-transparent text-violet-300",
  };
  return (
    <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${tones[tone] || tones.sky} p-4`}>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function TelegramAdminPage() {
  const navigate = useNavigate();
  const { mockPay } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<TelegramBotData | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("bt-admin-pass");
    if (saved) {
      setPassword(saved);
      void load(saved);
    }
  }, []);

  useEffect(() => {
    if (!authed || !mockPay || !password) return;
    void (async () => {
      try {
        await tgAdminMarkPaid({ data: { password, orderId: mockPay } });
        setMsg(`Mock payment paid: ${mockPay}`);
        await load(password);
        void navigate({ to: "/admin/telegram", search: {}, replace: true });
      } catch {
        setError("Mock pay failed");
      }
    })();
  }, [authed, mockPay, password]);

  async function load(pass: string) {
    setBusy(true);
    setError("");
    try {
      const d = await tgAdminGet({ data: { password: pass } });
      setData(d);
      setAuthed(true);
      sessionStorage.setItem("bt-admin-pass", pass);
    } catch {
      setError("Invalid password");
      setAuthed(false);
      sessionStorage.removeItem("bt-admin-pass");
    } finally {
      setBusy(false);
    }
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const res = await verifyAdminPassword({ data: { password } });
    if (!res.ok) {
      setError("Wrong password");
      return;
    }
    await load(password);
  }

  if (!authed || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060a12] px-4">
        <form
          onSubmit={login}
          className="w-full max-w-md space-y-4 rounded-3xl border border-white/10 bg-[#0d1524] p-8 shadow-2xl"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-[0.2em] text-sky-400 uppercase">Basictrick</p>
            <h1 className="text-2xl font-semibold text-white">Omni Telegram Admin</h1>
            <p className="text-sm text-slate-400">Rose security · AI brain · Booster · Group posts</p>
          </div>
          <Input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <Button type="submit" disabled={busy} className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold">
            {busy ? "…" : "Enter control center"}
          </Button>
          <Link to="/admin" className="block text-center text-xs text-slate-500 hover:text-sky-300">
            ← Website Admin
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,165,233,0.12),_transparent_55%)]" />
      <header className="relative border-b border-white/10 bg-[#0b1220]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.25em] text-sky-400 uppercase">Control Center</p>
            <h1 className="text-xl font-semibold text-white">Telegram Omni Admin</h1>
            <p className="text-xs text-slate-400">
              @{data.config.botUsername || "Bot"} ·{" "}
              <span className={data.config.enabled ? "text-emerald-400" : "text-amber-400"}>
                {data.config.enabled ? "LIVE" : "PAUSED"}
              </span>
              {" · "}
              {data.premium.premiumBadge}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="border-white/15 bg-white/5 text-slate-200">
              <Link to="/admin">Website Admin</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/15 bg-white/5"
              onClick={() => {
                sessionStorage.removeItem("bt-admin-pass");
                setAuthed(false);
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                tab === t
                  ? "bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl space-y-4 px-4 py-6">
        {msg && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
            {msg}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-300">
            {error}
          </div>
        )}

        {tab === "Overview" && <OverviewPanel data={data} onGo={setTab} />}
        {tab === "Connect" && (
          <ConnectPanel
            data={data}
            password={password}
            onSaved={setData}
            onMsg={setMsg}
            onErr={setError}
          />
        )}
        {tab === "Groups" && (
          <GroupsPanel
            data={data}
            password={password}
            onSaved={setData}
            onMsg={setMsg}
            onErr={setError}
          />
        )}
        {tab === "Commands" && <CommandsPanel />}
        {tab === "Booster" && (
          <BoosterPanel
            data={data}
            password={password}
            onSaved={(d) => {
              setData(d);
              setMsg("Booster + Premium gate saved");
            }}
          />
        )}
        {tab === "AI Brain" && (
          <AiPanel
            data={data}
            password={password}
            onSaved={(d) => {
              setData(d);
              setMsg("AI Brain saved");
            }}
          />
        )}
        {tab === "Posts" && (
          <PostsPanel
            data={data}
            password={password}
            onSaved={(d) => {
              setData(d);
              setMsg("Posts updated");
            }}
            onMsg={setMsg}
            onErr={setError}
          />
        )}
        {tab === "Security" && (
          <SecurityPanel
            data={data}
            password={password}
            onSaved={(d) => {
              setData(d);
              setMsg("Security saved");
            }}
          />
        )}
        {tab === "Keywords" && (
          <KeywordsPanel
            data={data}
            password={password}
            onSaved={(d) => {
              setData(d);
              setMsg("Keywords saved");
            }}
          />
        )}
        {tab === "Notes" && (
          <NotesPanel
            data={data}
            password={password}
            onSaved={(d) => {
              setData(d);
              setMsg("Notes saved");
            }}
          />
        )}
        {tab === "Store" && (
          <StorePanel
            data={data}
            password={password}
            onSaved={(d) => {
              setData(d);
              setMsg("Store saved");
            }}
          />
        )}
        {tab === "Links" && (
          <LinksPanel
            data={data}
            password={password}
            onSaved={(d) => {
              setData(d);
              setMsg("Link buttons saved");
            }}
          />
        )}
        {tab === "Orders" && (
          <OrdersPanel data={data} password={password} onRefresh={() => load(password)} onMsg={setMsg} />
        )}
        {tab === "Members" && (
          <MembersPanel data={data} password={password} onRefresh={() => load(password)} onMsg={setMsg} />
        )}
        {tab === "Logs" && <LogsPanel data={data} />}
      </main>
    </div>
  );
}

function OverviewPanel({
  data,
  onGo,
}: {
  data: TelegramBotData;
  onGo: (t: (typeof TABS)[number]) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Managed groups" value={data.managedGroups.filter((g) => g.isActive).length} />
        <Stat label="Members" value={data.members.length} tone="violet" />
        <Stat label="Boost invites" value={data.booster.invitesSent} tone="amber" />
        <Stat label="Pending orders" value={data.orders.filter((o) => o.status === "pending").length} tone="emerald" />
      </div>
      <Card
        title="Quick actions"
        subtitle="Maintain everything from one place"
        action={
          <div className="flex flex-wrap gap-2">
            {(["Connect", "Booster", "AI Brain", "Posts", "Commands"] as const).map((t) => (
              <Button key={t} size="sm" className="bg-sky-500/90 text-slate-950 hover:bg-sky-400" onClick={() => onGo(t)}>
                {t}
              </Button>
            ))}
          </div>
        }
      >
        <div className="grid gap-3 md:grid-cols-3 text-sm text-slate-300">
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="font-medium text-white">Group Booster</p>
            <p className="mt-1 text-xs text-slate-400">
              Free group: {data.booster.freeGroupTitle || "—"}
              <br />
              Joins tracked: {data.booster.joinsTracked}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="font-medium text-white">Premium AI gate</p>
            <p className="mt-1 text-xs text-slate-400">
              Need {data.premium.minGroupsToUnlockAi}+ groups
              <br />
              Free join required: {data.premium.requireFreeGroupJoin ? "Yes" : "No"}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="font-medium text-white">Omni AI</p>
            <p className="mt-1 text-xs text-slate-400">
              Persona: {data.ai.personaName}
              <br />
              Intents: {data.ai.intents.filter((i) => i.isActive).length} active
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function CommandsPanel() {
  const cats = useMemo(() => [...new Set(BOT_COMMAND_DOCS.map((c) => c.category))], []);
  return (
    <Card
      title="Command → Response map"
      subtitle="বট কোন কমান্ডে কী রেসপন্স করে — পুরো রেফারেন্স"
    >
      <div className="space-y-6">
        {cats.map((cat) => (
          <div key={cat}>
            <h3 className="mb-2 text-xs font-semibold tracking-wider text-sky-400 uppercase">{cat}</h3>
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-white/5 text-[11px] text-slate-400">
                  <tr>
                    <th className="px-3 py-2">Command</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2">Example response</th>
                  </tr>
                </thead>
                <tbody>
                  {BOT_COMMAND_DOCS.filter((c) => c.category === cat).map((c) => (
                    <tr key={c.command} className="border-t border-white/5">
                      <td className="px-3 py-2 font-mono text-xs text-sky-300">
                        {c.command}
                        {c.adminOnly ? <span className="ml-1 text-amber-400">admin</span> : null}
                      </td>
                      <td className="px-3 py-2 text-slate-300">
                        <div>{c.descriptionBn}</div>
                        <div className="text-[11px] text-slate-500">{c.descriptionEn}</div>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-400">{c.exampleResponse}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ConnectPanel({
  data,
  password,
  onSaved,
  onMsg,
  onErr,
}: {
  data: TelegramBotData;
  password: string;
  onSaved: (d: TelegramBotData) => void;
  onMsg: (s: string) => void;
  onErr: (s: string) => void;
}) {
  const [cfg, setCfg] = useState(data.config);
  const [busy, setBusy] = useState(false);
  const [statusJson, setStatusJson] = useState("");
  useEffect(() => setCfg(data.config), [data.config]);
  const webhook = `${cfg.sitePublicUrl.replace(/\/$/, "")}/api/telegram/webhook?secret=${cfg.webhookSecret}`;

  return (
    <div className="space-y-4">
      <Card title="Connect Telegram" subtitle="BotFather token → HTTPS webhook → Test">
        <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm text-slate-300">
          <li>@BotFather → token paste below</li>
          <li>Admin IDs: your Telegram numeric IDs (comma separated)</li>
          <li>
            Public HTTPS URL: <code className="text-sky-300">https://basictrickhub.com</code>
          </li>
          <li>Save → Test getMe → Set Webhook</li>
          <li>Groups tab → paste group/channel link to register</li>
        </ol>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Bot token">
            <Input className={inputCls} value={cfg.botToken} onChange={(e) => setCfg({ ...cfg, botToken: e.target.value })} />
          </Field>
          <Field label="Public HTTPS URL">
            <Input className={inputCls} value={cfg.sitePublicUrl} onChange={(e) => setCfg({ ...cfg, sitePublicUrl: e.target.value })} />
          </Field>
          <Field label="Webhook URL">
            <Input className={inputCls} value={webhook} readOnly />
          </Field>
          <Field label="Admin Telegram IDs">
            <Input
              className={inputCls}
              value={cfg.adminIds.join(",")}
              onChange={(e) =>
                setCfg({
                  ...cfg,
                  adminIds: e.target.value.split(",").map((x) => x.trim()).filter(Boolean),
                })
              }
            />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            disabled={busy}
            className="bg-sky-500 text-slate-950"
            onClick={async () => {
              setBusy(true);
              try {
                onSaved(await tgAdminSaveConfig({ data: { password, config: cfg } }));
                onMsg("Saved");
              } catch (e) {
                onErr(e instanceof Error ? e.message : "fail");
              } finally {
                setBusy(false);
              }
            }}
          >
            Save
          </Button>
          <Button
            disabled={busy}
            variant="outline"
            className="border-white/15"
            onClick={async () => {
              setBusy(true);
              try {
                const st = await tgAdminBotStatus({ data: { password } });
                setStatusJson(JSON.stringify(st, null, 2));
                const whUrl =
                  st && typeof st === "object" && "webhook" in st
                    ? ((st as { webhook?: { result?: { url?: string } } }).webhook?.result?.url ?? "")
                    : "";
                if (!whUrl) {
                  onMsg("getMe OK — but webhook is EMPTY. Click green Set Webhook");
                } else {
                  onMsg(`getMe OK · webhook active`);
                }
              } catch (e) {
                onErr(e instanceof Error ? e.message : "fail");
              } finally {
                setBusy(false);
              }
            }}
          >
            Test getMe
          </Button>
          <Button
            disabled={busy}
            className="bg-emerald-500 text-slate-950"
            onClick={async () => {
              setBusy(true);
              try {
                await tgAdminSaveConfig({ data: { password, config: cfg } });
                const res = await tgAdminSetWebhook({ data: { password, publicUrl: cfg.sitePublicUrl } });
                setStatusJson(JSON.stringify(res, null, 2));
                const live =
                  res && typeof res === "object" && "webhookInfo" in res
                    ? ((res as { webhookInfo?: { result?: { url?: string } } }).webhookInfo?.result?.url ?? "")
                    : "";
                if (!live) {
                  onErr("Set Webhook ran but Telegram still has empty URL — check token / HTTPS");
                } else {
                  onMsg(`Webhook ACTIVE: ${live}`);
                }
                onSaved(await tgAdminGet({ data: { password } }));
              } catch (e) {
                onErr(e instanceof Error ? e.message : "Webhook needs HTTPS");
              } finally {
                setBusy(false);
              }
            }}
          >
            Set Webhook
          </Button>
          <Button
            disabled={busy}
            variant="outline"
            className="border-rose-500/40 text-rose-300"
            onClick={async () => {
              setBusy(true);
              try {
                setStatusJson(JSON.stringify(await tgAdminDeleteWebhook({ data: { password } }), null, 2));
                onMsg("Webhook deleted");
              } finally {
                setBusy(false);
              }
            }}
          >
            Delete webhook
          </Button>
        </div>
        {statusJson && (
          <pre className="mt-4 max-h-64 overflow-auto rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-slate-400">
            {statusJson}
          </pre>
        )}
      </Card>
      <Card title="Bot config extras">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Sell bot username">
            <Input className={inputCls} value={cfg.salesBotUsername} onChange={(e) => setCfg({ ...cfg, salesBotUsername: e.target.value })} />
          </Field>
          <Field label="Support URL">
            <Input className={inputCls} value={cfg.supportUrl} onChange={(e) => setCfg({ ...cfg, supportUrl: e.target.value })} />
          </Field>
          <Field label="ZiniPay key">
            <Input className={inputCls} type="password" value={cfg.zinipayApiKey} onChange={(e) => setCfg({ ...cfg, zinipayApiKey: e.target.value })} />
          </Field>
          <Field label="Plisio key">
            <Input className={inputCls} type="password" value={cfg.plisioApiKey} onChange={(e) => setCfg({ ...cfg, plisioApiKey: e.target.value })} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={cfg.enabled} onChange={(e) => setCfg({ ...cfg, enabled: e.target.checked })} />
            Bot enabled
          </label>
        </div>
        <Button
          className="mt-3 bg-sky-500 text-slate-950"
          onClick={async () => onSaved(await tgAdminSaveConfig({ data: { password, config: cfg } }))}
        >
          Save config
        </Button>
      </Card>
    </div>
  );
}

function BoosterPanel({
  data,
  password,
  onSaved,
}: {
  data: TelegramBotData;
  password: string;
  onSaved: (d: TelegramBotData) => void;
}) {
  const [booster, setBooster] = useState(data.booster);
  const [premium, setPremium] = useState(data.premium);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setBooster(data.booster);
    setPremium(data.premium);
  }, [data.booster, data.premium]);

  async function save() {
    setBusy(true);
    try {
      await tgAdminSaveBooster({ data: { password, booster } });
      onSaved(await tgAdminSavePremium({ data: { password, premium } }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Invites sent" value={booster.invitesSent} tone="amber" />
        <Stat label="Joins tracked" value={booster.joinsTracked} tone="emerald" />
        <Stat label="Daily target" value={booster.targetDailyJoins} />
      </div>
      <Card title="Group Booster" subtitle="ফ্রি গ্রুপে অটো ইনভাইট / মেম্বার বুস্ট (invite-link based)">
        <div className="mb-3 flex flex-wrap gap-4 text-sm">
          {(
            [
              ["enabled", "Booster on"],
              ["autoSendInviteOnStart", "Invite on /start"],
              ["autoSendInviteOnJoin", "DM invite on group join"],
              ["requireJoinFreeGroup", "Require free group for AI"],
            ] as const
          ).map(([k, label]) => (
            <label key={k} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={booster[k] as boolean}
                onChange={(e) => setBooster({ ...booster, [k]: e.target.checked })}
              />
              {label}
            </label>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Free group title" hint="দেখানোর নাম">
            <Input className={inputCls} value={booster.freeGroupTitle} onChange={(e) => setBooster({ ...booster, freeGroupTitle: e.target.value })} />
          </Field>
          <Field label="Free group chat ID" hint="-100… (getChat / add bot then copy)">
            <Input className={inputCls} value={booster.freeGroupId} onChange={(e) => setBooster({ ...booster, freeGroupId: e.target.value })} />
          </Field>
          <Field label="Invite link" hint="https://t.me/+xxxx">
            <Input className={inputCls} value={booster.freeGroupInvite} onChange={(e) => setBooster({ ...booster, freeGroupInvite: e.target.value })} />
          </Field>
          <Field label="Daily join target">
            <Input className={inputCls} type="number" value={booster.targetDailyJoins} onChange={(e) => setBooster({ ...booster, targetDailyJoins: Number(e.target.value) })} />
          </Field>
          <Field label="Boost message BN">
            <Textarea className={inputCls} rows={3} value={booster.boostMessageBn} onChange={(e) => setBooster({ ...booster, boostMessageBn: e.target.value })} />
          </Field>
          <Field label="Boost message EN">
            <Textarea className={inputCls} rows={3} value={booster.boostMessageEn} onChange={(e) => setBooster({ ...booster, boostMessageEn: e.target.value })} />
          </Field>
        </div>
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <h3 className="mb-2 text-sm font-semibold text-amber-200">Force-add before text</h3>
          <label className="mb-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!booster.forceAddEnabled}
              onChange={(e) => setBooster({ ...booster, forceAddEnabled: e.target.checked })}
            />
            Enabled — user must add N members before texting
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Required adds (e.g. 5)">
              <Input
                className={inputCls}
                type="number"
                value={booster.forceAddRequired ?? 5}
                onChange={(e) => setBooster({ ...booster, forceAddRequired: Number(e.target.value) })}
              />
            </Field>
            <Field label="Bot command">
              <Input className={inputCls} value="/forceadd 5 · /forceadd on|off" readOnly />
            </Field>
            <Field label="Message BN">
              <Textarea
                className={inputCls}
                rows={3}
                value={booster.forceAddMessageBn || ""}
                onChange={(e) => setBooster({ ...booster, forceAddMessageBn: e.target.value })}
              />
            </Field>
            <Field label="Message EN">
              <Textarea
                className={inputCls}
                rows={3}
                value={booster.forceAddMessageEn || ""}
                onChange={(e) => setBooster({ ...booster, forceAddMessageEn: e.target.value })}
              />
            </Field>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          Note: Telegram API ইউজারকে জোর করে অ্যাড করতে দেয় না — কেউ মেম্বার অ্যাড করলে কাউন্ট হয়। কমান্ড: /forceadd 5
        </p>
      </Card>
      <Card title="Premium AI unlock" subtitle="AI ব্যবহার করতে ফ্রি গ্রুপ + নিজের গ্রুপগুলোতে বট অ্যাড লাগবে">
        <div className="mb-3 flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={premium.enabled} onChange={(e) => setPremium({ ...premium, enabled: e.target.checked })} />
            Gate enabled
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={premium.requireFreeGroupJoin}
              onChange={(e) => setPremium({ ...premium, requireFreeGroupJoin: e.target.checked })}
            />
            Require free group
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Min groups to unlock AI">
            <Input
              className={inputCls}
              type="number"
              value={premium.minGroupsToUnlockAi}
              onChange={(e) => setPremium({ ...premium, minGroupsToUnlockAi: Number(e.target.value) })}
            />
          </Field>
          <Field label="Premium badge">
            <Input className={inputCls} value={premium.premiumBadge} onChange={(e) => setPremium({ ...premium, premiumBadge: e.target.value })} />
          </Field>
          <Field label="Locked message BN">
            <Textarea className={inputCls} rows={4} value={premium.lockedMessageBn} onChange={(e) => setPremium({ ...premium, lockedMessageBn: e.target.value })} />
          </Field>
          <Field label="Locked message EN">
            <Textarea className={inputCls} rows={4} value={premium.lockedMessageEn} onChange={(e) => setPremium({ ...premium, lockedMessageEn: e.target.value })} />
          </Field>
        </div>
      </Card>
      <Button disabled={busy} onClick={save} className="bg-sky-500 text-slate-950">
        Save Booster + Premium
      </Button>
    </div>
  );
}

function AiPanel({
  data,
  password,
  onSaved,
}: {
  data: TelegramBotData;
  password: string;
  onSaved: (d: TelegramBotData) => void;
}) {
  const [ai, setAi] = useState(data.ai);
  const [busy, setBusy] = useState(false);
  useEffect(() => setAi(data.ai), [data.ai]);

  return (
    <div className="space-y-4">
      <Card
        title="Omni AI Brain"
        subtitle="Intent বুঝে স্মার্ট রিপ্লাই — keywords এর সাথে মিলিয়ে কাজ করে"
        action={
          <Button
            disabled={busy}
            className="bg-sky-500 text-slate-950"
            onClick={async () => {
              setBusy(true);
              try {
                onSaved(await tgAdminSaveAi({ data: { password, ai } }));
              } finally {
                setBusy(false);
              }
            }}
          >
            Save AI
          </Button>
        }
      >
        <div className="mb-3 flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={ai.enabled} onChange={(e) => setAi({ ...ai, enabled: e.target.checked })} />
            AI enabled
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={ai.smartMode} onChange={(e) => setAi({ ...ai, smartMode: e.target.checked })} />
            Smart mode
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Persona name">
            <Input className={inputCls} value={ai.personaName} onChange={(e) => setAi({ ...ai, personaName: e.target.value })} />
          </Field>
          <div />
          <Field label="Fallback BN">
            <Textarea className={inputCls} rows={3} value={ai.fallbackBn} onChange={(e) => setAi({ ...ai, fallbackBn: e.target.value })} />
          </Field>
          <Field label="Fallback EN">
            <Textarea className={inputCls} rows={3} value={ai.fallbackEn} onChange={(e) => setAi({ ...ai, fallbackEn: e.target.value })} />
          </Field>
        </div>
      </Card>
      <Card
        title="Intents"
        subtitle="patterns → reply + action"
        action={
          <Button
            variant="outline"
            className="border-white/15"
            onClick={() => {
              const blank: TgAiIntent = {
                id: newId("intent"),
                name: "New intent",
                patterns: ["pattern"],
                replyBn: "রিপ্লাই",
                replyEn: "Reply",
                action: "none",
                isActive: true,
                priority: 5,
              };
              setAi({ ...ai, intents: [blank, ...ai.intents] });
            }}
          >
            + Intent
          </Button>
        }
      >
        <div className="space-y-3">
          {ai.intents.map((intent, idx) => (
            <div key={intent.id} className="rounded-xl border border-white/10 bg-black/20 p-3 space-y-2">
              <div className="flex flex-wrap gap-2">
                <Input
                  className={`${inputCls} max-w-xs`}
                  value={intent.name}
                  onChange={(e) => {
                    const intents = [...ai.intents];
                    intents[idx] = { ...intent, name: e.target.value };
                    setAi({ ...ai, intents });
                  }}
                />
                <select
                  className={`h-10 rounded-md border px-2 text-sm ${inputCls}`}
                  value={intent.action}
                  onChange={(e) => {
                    const intents = [...ai.intents];
                    intents[idx] = { ...intent, action: e.target.value as TgAiIntent["action"] };
                    setAi({ ...ai, intents });
                  }}
                >
                  {["none", "shop", "vip", "boost", "support", "tools", "course"].map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={intent.isActive}
                    onChange={(e) => {
                      const intents = [...ai.intents];
                      intents[idx] = { ...intent, isActive: e.target.checked };
                      setAi({ ...ai, intents });
                    }}
                  />
                  On
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-rose-500/40 text-rose-300"
                  onClick={() => setAi({ ...ai, intents: ai.intents.filter((x) => x.id !== intent.id) })}
                >
                  Del
                </Button>
              </div>
              <Input
                className={inputCls}
                value={intent.patterns.join(", ")}
                onChange={(e) => {
                  const intents = [...ai.intents];
                  intents[idx] = {
                    ...intent,
                    patterns: e.target.value.split(",").map((x) => x.trim()).filter(Boolean),
                  };
                  setAi({ ...ai, intents });
                }}
              />
              <div className="grid gap-2 md:grid-cols-2">
                <Textarea
                  className={inputCls}
                  rows={2}
                  value={intent.replyBn}
                  onChange={(e) => {
                    const intents = [...ai.intents];
                    intents[idx] = { ...intent, replyBn: e.target.value };
                    setAi({ ...ai, intents });
                  }}
                />
                <Textarea
                  className={inputCls}
                  rows={2}
                  value={intent.replyEn}
                  onChange={(e) => {
                    const intents = [...ai.intents];
                    intents[idx] = { ...intent, replyEn: e.target.value };
                    setAi({ ...ai, intents });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function GroupsPanel({
  data,
  password,
  onSaved,
  onMsg,
  onErr,
}: {
  data: TelegramBotData;
  password: string;
  onSaved: (d: TelegramBotData) => void;
  onMsg: (s: string) => void;
  onErr: (s: string) => void;
}) {
  const [link, setLink] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const groups = data.managedGroups;

  return (
    <div className="space-y-4">
      <Card
        title="Add group / channel"
        subtitle="লিংক বা @username পেস্ট করুন — পাবলিক চ্যানেল সরাসরি অ্যাড, প্রাইভেট ইনভাইটে বট অ্যাড করতে হবে"
      >
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <Field label="Paste link / @username / chat id" hint="https://t.me/mychannel · @mychannel · https://t.me/+xxxx · -100…">
            <Input
              className={inputCls}
              placeholder="https://t.me/yourgroup or @channel"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </Field>
          <Field label="Title (optional)">
            <Input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Display name" />
          </Field>
          <div className="flex items-end gap-2">
            <Button
              className="bg-sky-500 text-slate-950"
              disabled={busy || !link.trim()}
              onClick={async () => {
                setBusy(true);
                try {
                  const res = await tgAdminAddGroup({
                    data: { password, link: link.trim(), title: title.trim() || undefined },
                  });
                  onSaved(res.store);
                  onMsg(res.message);
                  setLink("");
                  setTitle("");
                } catch (e) {
                  onErr(e instanceof Error ? e.message : "add failed");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Add
            </Button>
            <Button
              variant="outline"
              className="border-white/15"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const res = await tgAdminSyncGroups({ data: { password } });
                  onSaved(res.store);
                  onMsg(`Synced ${res.updated} group(s)`);
                } catch (e) {
                  onErr(e instanceof Error ? e.message : "sync failed");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Sync
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Managed groups & channels" subtitle={`${groups.filter((g) => g.isActive).length} active · ${groups.length} total`}>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-white/5 text-xs text-slate-400">
              <tr>
                <th className="px-3 py-2 text-left">Title</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Chat ID</th>
                <th className="px-3 py-2 text-left">Link</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.chatId} className="border-t border-white/5">
                  <td className="px-3 py-2 text-white">{g.title}</td>
                  <td className="px-3 py-2 text-xs text-slate-400">{g.type}</td>
                  <td className="px-3 py-2 font-mono text-xs">{g.chatId}</td>
                  <td className="px-3 py-2 text-xs">
                    {g.inviteLink || (g.username ? `https://t.me/${g.username}` : "—")}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {g.pending ? (
                      <span className="text-amber-300">Pending — add bot</span>
                    ) : g.isActive ? (
                      <span className="text-emerald-300">Active</span>
                    ) : (
                      <span className="text-slate-500">Off</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      {!g.pending && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/15"
                          onClick={async () =>
                            onSaved(
                              await tgAdminToggleGroup({
                                data: { password, chatId: g.chatId, isActive: !g.isActive },
                              }),
                            )
                          }
                        >
                          {g.isActive ? "Disable" : "Enable"}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-rose-500/40 text-rose-300"
                        onClick={async () =>
                          onSaved(await tgAdminRemoveGroup({ data: { password, chatId: g.chatId } }))
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!groups.length && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                    No groups yet — paste a link above
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function PostsPanel({
  data,
  password,
  onSaved,
  onMsg,
  onErr,
}: {
  data: TelegramBotData;
  password: string;
  onSaved: (d: TelegramBotData) => void;
  onMsg: (s: string) => void;
  onErr: (s: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [buttonText, setButtonText] = useState("Open");
  const [buttonUrl, setButtonUrl] = useState("");
  const [target, setTarget] = useState<"all" | "selected">("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const groups = data.managedGroups.filter((g) => g.isActive);

  return (
    <div className="space-y-4">
      <Card title="Group Post System" subtitle="সব ম্যানেজড গ্রুপে ব্রডকাস্ট">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Title">
            <Input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Target">
            <select
              className={`h-10 w-full rounded-md border px-3 text-sm ${inputCls}`}
              value={target}
              onChange={(e) => setTarget(e.target.value as "all" | "selected")}
            >
              <option value="all">All active groups ({groups.length})</option>
              <option value="selected">Selected groups</option>
            </select>
          </Field>
          <Field label="Body">
            <Textarea className={inputCls} rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
          </Field>
          <div className="space-y-3">
            <Field label="Button text">
              <Input className={inputCls} value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
            </Field>
            <Field label="Button URL">
              <Input className={inputCls} value={buttonUrl} onChange={(e) => setButtonUrl(e.target.value)} />
            </Field>
          </div>
        </div>
        {target === "selected" && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {groups.map((g) => (
              <label key={g.chatId} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs">
                <input
                  type="checkbox"
                  checked={selected.includes(g.chatId)}
                  onChange={(e) =>
                    setSelected((prev) =>
                      e.target.checked ? [...prev, g.chatId] : prev.filter((id) => id !== g.chatId),
                    )
                  }
                />
                {g.title} <span className="text-slate-500">{g.chatId}</span>
              </label>
            ))}
            {!groups.length && <p className="text-xs text-slate-500">No groups yet — add bot to groups first</p>}
          </div>
        )}
        <Button
          className="mt-4 bg-sky-500 text-slate-950"
          disabled={busy || !title || !body}
          onClick={async () => {
            setBusy(true);
            try {
              const store = await tgAdminCreatePost({
                data: {
                  password,
                  title,
                  body,
                  buttonText,
                  buttonUrl,
                  target,
                  selectedChatIds: selected,
                },
              });
              onSaved(store);
              setTitle("");
              setBody("");
              onMsg("Draft created — Send দিয়ে ব্রডকাস্ট করুন");
            } catch (e) {
              onErr(e instanceof Error ? e.message : "fail");
            } finally {
              setBusy(false);
            }
          }}
        >
          Create draft
        </Button>
      </Card>
      <Card title="Managed groups" subtitle="যেসব গ্রুপে বট আছে">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-white/5 text-xs text-slate-400">
              <tr>
                <th className="px-3 py-2 text-left">Title</th>
                <th className="px-3 py-2 text-left">Chat ID</th>
                <th className="px-3 py-2 text-left">Added by</th>
                <th className="px-3 py-2 text-left">Last post</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.chatId} className="border-t border-white/5">
                  <td className="px-3 py-2">{g.title}</td>
                  <td className="px-3 py-2 font-mono text-xs">{g.chatId}</td>
                  <td className="px-3 py-2 text-xs">{g.addedByUserId || "—"}</td>
                  <td className="px-3 py-2 text-xs">{g.lastPostAt ? new Date(g.lastPostAt).toLocaleString() : "—"}</td>
                </tr>
              ))}
              {!groups.length && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                    Empty — users must add bot to their groups
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="Post history">
        <div className="space-y-2">
          {data.posts.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
              <div>
                <p className="font-medium text-white">{p.title}</p>
                <p className="text-xs text-slate-400">
                  {p.status} · sent {p.sentCount} · {new Date(p.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                {p.status === "draft" && (
                  <Button
                    size="sm"
                    className="bg-emerald-500 text-slate-950"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        const res = await tgAdminBroadcastPost({ data: { password, postId: p.id } });
                        onSaved(res.store);
                        onMsg(`Broadcast sent to ${res.sent}/${res.total}`);
                      } catch (e) {
                        onErr(e instanceof Error ? e.message : "broadcast fail");
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Send now
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="border-rose-500/40 text-rose-300"
                  onClick={async () => onSaved(await tgAdminDeletePost({ data: { password, postId: p.id } }))}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {!data.posts.length && <p className="text-sm text-slate-500">No posts yet</p>}
        </div>
      </Card>
    </div>
  );
}

function SecurityPanel({
  data,
  password,
  onSaved,
}: {
  data: TelegramBotData;
  password: string;
  onSaved: (d: TelegramBotData) => void;
}) {
  const [sec, setSec] = useState(data.security);
  const [busy, setBusy] = useState(false);
  useEffect(() => setSec(data.security), [data.security]);

  return (
    <Card
      title="Basictrick Security Assistant"
      subtitle="Songmata name-watch · Rose locks · Flood · Captcha — branded security"
      action={
        <Button
          disabled={busy}
          className="bg-sky-500 text-slate-950"
          onClick={async () => {
            setBusy(true);
            try {
              onSaved(await tgAdminSaveSecurity({ data: { password, security: sec } }));
            } finally {
              setBusy(false);
            }
          }}
        >
          Save
        </Button>
      }
    >
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 mb-4">
        {(
          [
            ["antiFlood", "Anti-flood"],
            ["captchaOnJoin", "Captcha"],
            ["antiRaid", "Anti-raid"],
            ["approvalMode", "Approval"],
            ["welcomeEnabled", "Welcome"],
            ["goodbyeEnabled", "Goodbye"],
            ["nameWatchEnabled", "Name/Username watch"],
            ["nightMode", "Night mode"],
            ["blockInvitelinks", "Block invites"],
            ["blockLinks", "Block links"],
            ["cleanService", "Clean service"],
          ] as const
        ).map(([k, label]) => (
          <label key={k} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!sec[k]} onChange={(e) => setSec({ ...sec, [k]: e.target.checked })} />
            {label}
          </label>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-4 mb-4">
        <Field label="Flood max">
          <Input className={inputCls} type="number" value={sec.floodMaxMessages} onChange={(e) => setSec({ ...sec, floodMaxMessages: Number(e.target.value) })} />
        </Field>
        <Field label="Window sec">
          <Input className={inputCls} type="number" value={sec.floodWindowSec} onChange={(e) => setSec({ ...sec, floodWindowSec: Number(e.target.value) })} />
        </Field>
        <Field label="Flood mode">
          <select className={`h-10 w-full rounded-md border px-3 text-sm ${inputCls}`} value={sec.floodMode} onChange={(e) => setSec({ ...sec, floodMode: e.target.value as PunishMode })}>
            {PUNISH_MODES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </Field>
        <Field label="Max warns">
          <Input className={inputCls} type="number" value={sec.maxWarns} onChange={(e) => setSec({ ...sec, maxWarns: Number(e.target.value) })} />
        </Field>
      </div>
      <h3 className="mb-2 text-xs font-semibold text-sky-400 uppercase">Locks</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-4">
        {(Object.keys(DEFAULT_LOCKS) as (keyof TgLocks)[]).map((k) => (
          <label key={k} className="flex items-center gap-2 rounded-lg bg-black/20 px-2 py-1.5 text-xs">
            <input
              type="checkbox"
              checked={!!sec.locks?.[k]}
              onChange={() => setSec({ ...sec, locks: { ...sec.locks, [k]: !sec.locks[k] } })}
            />
            {k}
          </label>
        ))}
      </div>
      <Field label="Blacklist words">
        <Input
          className={inputCls}
          value={sec.blacklistWords.join(", ")}
          onChange={(e) =>
            setSec({
              ...sec,
              blacklistWords: e.target.value.split(",").map((x) => x.trim()).filter(Boolean),
            })
          }
        />
      </Field>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Field label="Welcome BN">
          <Textarea className={inputCls} rows={3} value={sec.welcomeMessageBn} onChange={(e) => setSec({ ...sec, welcomeMessageBn: e.target.value })} />
        </Field>
        <Field label="Rules">
          <Textarea className={inputCls} rows={3} value={sec.rulesText} onChange={(e) => setSec({ ...sec, rulesText: e.target.value })} />
        </Field>
        <Field label="Goodbye message">
          <Textarea className={inputCls} rows={2} value={sec.goodbyeMessage} onChange={(e) => setSec({ ...sec, goodbyeMessage: e.target.value })} />
        </Field>
        <Field label="Name change BN (Songmata)">
          <Textarea className={inputCls} rows={2} value={sec.nameChangeMessageBn || ""} onChange={(e) => setSec({ ...sec, nameChangeMessageBn: e.target.value })} />
        </Field>
        <Field label="Username change BN">
          <Textarea className={inputCls} rows={2} value={sec.usernameChangeMessageBn || ""} onChange={(e) => setSec({ ...sec, usernameChangeMessageBn: e.target.value })} />
        </Field>
        <Field label="Log channel ID">
          <Input className={inputCls} value={sec.logChannelId} onChange={(e) => setSec({ ...sec, logChannelId: e.target.value })} />
        </Field>
      </div>
    </Card>
  );
}

function KeywordsPanel({
  data,
  password,
  onSaved,
}: {
  data: TelegramBotData;
  password: string;
  onSaved: (d: TelegramBotData) => void;
}) {
  const [rules, setRules] = useState(data.keywords);
  useEffect(() => setRules(data.keywords), [data.keywords]);
  return (
    <Card
      title="Keyword detect"
      subtitle="facebook id → sell bot"
      action={
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-white/15"
            onClick={() => {
              const blank: TgKeywordRule = {
                id: newId("kw"),
                keywords: ["keyword"],
                title: "New",
                replyBn: "রিপ্লাই",
                replyEn: "Reply",
                suggestBotUsername: data.config.salesBotUsername,
                isActive: true,
                priority: 5,
              };
              setRules([blank, ...rules]);
            }}
          >
            + Rule
          </Button>
          <Button
            className="bg-sky-500 text-slate-950"
            onClick={async () => onSaved(await tgAdminSaveKeywords({ data: { password, keywords: rules } }))}
          >
            Save
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {rules.map((r, idx) => (
          <div key={r.id} className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
            <Input className={inputCls} value={r.title} onChange={(e) => { const n = [...rules]; n[idx] = { ...r, title: e.target.value }; setRules(n); }} />
            <Input className={inputCls} value={r.keywords.join(", ")} onChange={(e) => { const n = [...rules]; n[idx] = { ...r, keywords: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) }; setRules(n); }} />
            <div className="grid gap-2 md:grid-cols-2">
              <Textarea className={inputCls} rows={2} value={r.replyBn} onChange={(e) => { const n = [...rules]; n[idx] = { ...r, replyBn: e.target.value }; setRules(n); }} />
              <Textarea className={inputCls} rows={2} value={r.replyEn} onChange={(e) => { const n = [...rules]; n[idx] = { ...r, replyEn: e.target.value }; setRules(n); }} />
            </div>
            <Button size="sm" variant="outline" className="border-rose-500/40 text-rose-300" onClick={() => setRules(rules.filter((x) => x.id !== r.id))}>
              Delete
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function NotesPanel({
  data,
  password,
  onSaved,
}: {
  data: TelegramBotData;
  password: string;
  onSaved: (d: TelegramBotData) => void;
}) {
  const [notes, setNotes] = useState(data.notes || []);
  useEffect(() => setNotes(data.notes || []), [data.notes]);
  return (
    <Card
      title="Notes"
      action={
        <Button
          className="bg-sky-500 text-slate-950"
          onClick={async () => onSaved(await tgAdminSaveNotes({ data: { password, notes } }))}
        >
          Save
        </Button>
      }
    >
      {notes.map((n, idx) => (
        <div key={n.id} className="mb-2 grid gap-2 md:grid-cols-[120px_1fr]">
          <Input className={inputCls} value={n.name} onChange={(e) => { const next = [...notes]; next[idx] = { ...n, name: e.target.value }; setNotes(next); }} />
          <Textarea className={inputCls} rows={2} value={n.content} onChange={(e) => { const next = [...notes]; next[idx] = { ...n, content: e.target.value }; setNotes(next); }} />
        </div>
      ))}
      <Button
        variant="outline"
        className="border-white/15"
        onClick={() => setNotes([{ id: newId("note"), name: "new", content: "", isActive: true }, ...notes])}
      >
        + Note
      </Button>
    </Card>
  );
}

function StorePanel({
  data,
  password,
  onSaved,
}: {
  data: TelegramBotData;
  password: string;
  onSaved: (d: TelegramBotData) => void;
}) {
  const [products, setProducts] = useState(data.products);
  useEffect(() => setProducts(data.products), [data.products]);
  return (
    <Card
      title="Store"
      action={
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-white/15"
            onClick={() => {
              const p: TgStoreProduct = {
                id: newId("bot-prod"),
                name: "New",
                slug: `p-${Date.now()}`,
                description: "",
                priceBdt: 500,
                priceUsd: 5,
                type: "tool",
                deliveryNote: "",
                isActive: true,
                sortOrder: 1,
              };
              setProducts([p, ...products]);
            }}
          >
            +
          </Button>
          <Button
            className="bg-sky-500 text-slate-950"
            onClick={async () => onSaved(await tgAdminSaveProducts({ data: { password, products } }))}
          >
            Save
          </Button>
        </div>
      }
    >
      {products.map((p, idx) => (
        <div key={p.id} className="mb-3 grid gap-2 rounded-xl border border-white/10 p-3 md:grid-cols-2">
          <Input className={inputCls} value={p.name} onChange={(e) => { const n = [...products]; n[idx] = { ...p, name: e.target.value }; setProducts(n); }} />
          <select className={`h-10 rounded-md border px-3 text-sm ${inputCls}`} value={p.type} onChange={(e) => { const n = [...products]; n[idx] = { ...p, type: e.target.value as BotProductType }; setProducts(n); }}>
            {PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <Input className={inputCls} type="number" value={p.priceBdt} onChange={(e) => { const n = [...products]; n[idx] = { ...p, priceBdt: Number(e.target.value) }; setProducts(n); }} />
          <Input className={inputCls} type="number" value={p.priceUsd} onChange={(e) => { const n = [...products]; n[idx] = { ...p, priceUsd: Number(e.target.value) }; setProducts(n); }} />
        </div>
      ))}
    </Card>
  );
}

function LinksPanel({
  data,
  password,
  onSaved,
}: {
  data: TelegramBotData;
  password: string;
  onSaved: (d: TelegramBotData) => void;
}) {
  const [links, setLinks] = useState<TgLinkButton[]>(data.linkButtons || []);
  useEffect(() => setLinks(data.linkButtons || []), [data.linkButtons]);

  return (
    <Card
      title="Link buttons"
      subtitle="Method · Tools · Shortner · Card · Site list — বাটনে ক্লিক করলে ওয়েবসাইট খুলবে"
      action={
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-white/15"
            onClick={() => {
              const row: TgLinkButton = {
                id: newId("link"),
                category: "method",
                title: "New link",
                buttonText: "Open",
                url: "https://basictrickhub.com",
                isActive: true,
                sortOrder: links.length + 1,
              };
              setLinks([row, ...links]);
            }}
          >
            + Add button
          </Button>
          <Button
            className="bg-sky-500 text-slate-950"
            onClick={async () => onSaved(await tgAdminSaveLinks({ data: { password, linkButtons: links } }))}
          >
            Save
          </Button>
        </div>
      }
    >
      <p className="mb-3 text-xs text-slate-400">
        Bot commands: /method · /tools · /shortner · /card · /sites
      </p>
      {links.map((l, idx) => (
        <div key={l.id} className="mb-3 grid gap-2 rounded-xl border border-white/10 p-3 md:grid-cols-2">
          <Field label="Title">
            <Input
              className={inputCls}
              value={l.title}
              onChange={(e) => {
                const n = [...links];
                n[idx] = { ...l, title: e.target.value };
                setLinks(n);
              }}
            />
          </Field>
          <Field label="Category">
            <select
              className={`h-10 w-full rounded-md border px-3 text-sm ${inputCls}`}
              value={l.category}
              onChange={(e) => {
                const n = [...links];
                n[idx] = { ...l, category: e.target.value as TgLinkButton["category"] };
                setLinks(n);
              }}
            >
              {LINK_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Button text">
            <Input
              className={inputCls}
              value={l.buttonText}
              onChange={(e) => {
                const n = [...links];
                n[idx] = { ...l, buttonText: e.target.value };
                setLinks(n);
              }}
            />
          </Field>
          <Field label="URL (https://…)">
            <Input
              className={inputCls}
              value={l.url}
              onChange={(e) => {
                const n = [...links];
                n[idx] = { ...l, url: e.target.value };
                setLinks(n);
              }}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={l.isActive}
              onChange={(e) => {
                const n = [...links];
                n[idx] = { ...l, isActive: e.target.checked };
                setLinks(n);
              }}
            />
            Active
          </label>
          <Button
            variant="outline"
            className="border-rose-500/40 text-rose-300"
            onClick={() => setLinks(links.filter((x) => x.id !== l.id))}
          >
            Remove
          </Button>
        </div>
      ))}
      {!links.length && <p className="text-sm text-slate-500">No link buttons yet</p>}
    </Card>
  );
}

function OrdersPanel({
  data,
  password,
  onRefresh,
  onMsg,
}: {
  data: TelegramBotData;
  password: string;
  onRefresh: () => void;
  onMsg: (s: string) => void;
}) {
  return (
    <Card title="Orders">
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-white/5 text-xs text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">Order</th>
              <th className="px-3 py-2 text-left">Product</th>
              <th className="px-3 py-2 text-left">Amount</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {data.orders.map((o) => (
              <tr key={o.id} className="border-t border-white/5">
                <td className="px-3 py-2 font-mono text-xs">{o.id}</td>
                <td className="px-3 py-2">{o.productName}</td>
                <td className="px-3 py-2">
                  {o.amount} {o.currency}
                </td>
                <td className="px-3 py-2">{o.status}</td>
                <td className="px-3 py-2">
                  {o.status === "pending" && (
                    <Button
                      size="sm"
                      className="bg-sky-500 text-slate-950"
                      onClick={async () => {
                        await tgAdminMarkPaid({ data: { password, orderId: o.id } });
                        onMsg(`Paid ${o.id}`);
                        onRefresh();
                      }}
                    >
                      Mark paid
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function MembersPanel({
  data,
  password,
  onRefresh,
  onMsg,
}: {
  data: TelegramBotData;
  password: string;
  onRefresh: () => void;
  onMsg: (s: string) => void;
}) {
  async function act(
    userId: string,
    action: "ban" | "unban" | "mute" | "unmute" | "resetwarns" | "approve",
  ) {
    await tgAdminMemberAction({ data: { password, userId, action } });
    onMsg(`${action} → ${userId}`);
    onRefresh();
  }
  return (
    <Card title={`Members (${data.members.length})`}>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-white/5 text-xs text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">User</th>
              <th className="px-3 py-2 text-left">Groups</th>
              <th className="px-3 py-2 text-left">Free</th>
              <th className="px-3 py-2 text-left">AI</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.members.map((m) => (
              <tr key={m.telegramUserId} className="border-t border-white/5">
                <td className="px-3 py-2">
                  {m.firstName} @{m.username || m.telegramUserId}
                </td>
                <td className="px-3 py-2">{m.addedGroupIds?.length || 0}</td>
                <td className="px-3 py-2">{m.joinedFreeGroup ? "✅" : "❌"}</td>
                <td className="px-3 py-2">{m.aiUnlocked ? "✦" : "🔒"}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {(["mute", "unmute", "ban", "unban", "approve"] as const).map((a) => (
                      <Button
                        key={a}
                        size="sm"
                        variant="outline"
                        className="h-7 border-white/15 px-2 text-[10px]"
                        onClick={() => act(m.telegramUserId, a)}
                      >
                        {a}
                      </Button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function LogsPanel({ data }: { data: TelegramBotData }) {
  const logs = [...data.logs].reverse().slice(0, 120);
  return (
    <Card title="Logs">
      <div className="max-h-[70vh] space-y-1 overflow-y-auto font-mono text-xs">
        {logs.map((l) => (
          <div key={l.id} className="flex gap-2 border-b border-white/5 py-1">
            <span className="shrink-0 text-slate-500">{new Date(l.at).toLocaleString()}</span>
            <span className={l.level === "error" ? "text-rose-400" : l.level === "warn" ? "text-amber-400" : "text-sky-400"}>
              [{l.level}]
            </span>
            <span>{l.message}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
