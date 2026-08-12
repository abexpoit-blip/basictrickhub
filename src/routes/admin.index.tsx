import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  adminCreateAccessKey,
  adminDeleteCategory,
  adminDeleteMethod,
  adminDeleteProduct,
  adminDeleteTool,
  adminGetStore,
  adminSaveCategory,
  adminSaveMethod,
  adminSaveProduct,
  adminSaveSettings,
  adminSaveTool,
  shareMethodToTelegram,
  verifyAdminPassword,
} from "../lib/server-fns";
import type {
  CommunityTool,
  MethodGuide,
  Product,
  StoreData,
  ToolCategory,
  ToolType,
} from "../lib/types";
import { newId } from "../lib/utils";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — Basictrick" }] }),
  component: AdminPage,
});

const TABS = ["Categories", "Tools", "Products", "Methods", "Settings", "Access Keys"] as const;

function AdminPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [store, setStore] = useState<StoreData | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Tools");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("bt-admin-pass");
    if (saved) {
      setPassword(saved);
      void load(saved);
    }
  }, []);

  async function load(pass: string) {
    setBusy(true);
    setError("");
    try {
      const data = await adminGetStore({ data: { password: pass } });
      setStore(data);
      setAuthed(true);
      sessionStorage.setItem("bt-admin-pass", pass);
    } catch {
      setError("Invalid password or failed to load store");
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

  if (!authed || !store) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <form onSubmit={login} className="w-full max-w-sm space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Basictrick Admin</h1>
          <Input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={busy} className="w-full bg-sky-600 hover:bg-sky-700">
            {busy ? "…" : "Sign in"}
          </Button>
          <button type="button" className="text-xs text-slate-400 hover:underline" onClick={() => navigate({ to: "/" })}>
            ← Back to site
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="font-bold text-slate-900">Basictrick Admin</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="border-sky-300 text-sky-700">
              <Link to="/admin/telegram">Telegram Admin</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sessionStorage.removeItem("bt-admin-pass");
                setAuthed(false);
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                tab === t ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {tab === "Categories" && (
          <CategoriesAdmin
            store={store}
            password={password}
            onRefresh={() => load(password)}
          />
        )}
        {tab === "Tools" && <ToolsAdmin store={store} password={password} onRefresh={() => load(password)} />}
        {tab === "Products" && (
          <ProductsAdmin store={store} password={password} onRefresh={() => load(password)} />
        )}
        {tab === "Methods" && (
          <MethodsAdmin store={store} password={password} onRefresh={() => load(password)} />
        )}
        {tab === "Settings" && (
          <SettingsAdmin store={store} password={password} onRefresh={() => load(password)} />
        )}
        {tab === "Access Keys" && (
          <AccessKeysAdmin store={store} password={password} onRefresh={() => load(password)} />
        )}
      </div>
    </div>
  );
}

function CategoriesAdmin({
  store,
  password,
  onRefresh,
}: {
  store: StoreData;
  password: string;
  onRefresh: () => void;
}) {
  const blank = (): ToolCategory => ({
    id: newId("cat"),
    name: "",
    slug: "",
    description: "",
    sortOrder: store.categories.length + 1,
    isPublished: true,
  });
  const [form, setForm] = useState<ToolCategory>(blank());

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        {store.categories.map((c) => (
          <div key={c.id} className="flex items-start justify-between gap-3 rounded-xl border bg-white p-4">
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-xs text-slate-500">{c.slug}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setForm(c)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={async () => {
                  await adminDeleteCategory({ data: { password, id: c.id } });
                  onRefresh();
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
      <form
        className="space-y-3 rounded-xl border bg-white p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await adminSaveCategory({ data: { password, category: form } });
          setForm(blank());
          onRefresh();
        }}
      >
        <h2 className="font-semibold">{store.categories.some((c) => c.id === form.id) ? "Edit" : "Add"} category</h2>
        <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input
          placeholder="slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          required
        />
        <Textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Sort"
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
          />
          Published
        </label>
        <Button type="submit" className="bg-sky-600 hover:bg-sky-700">
          Save category
        </Button>
      </form>
    </div>
  );
}

function ToolsAdmin({
  store,
  password,
  onRefresh,
}: {
  store: StoreData;
  password: string;
  onRefresh: () => void;
}) {
  const blank = (): CommunityTool => ({
    id: newId("tool"),
    categoryId: store.categories[0]?.id || "",
    name: "",
    slug: "",
    shortDescription: "",
    fullDescription: "",
    releaseNotes: "",
    version: "1.0.0",
    toolType: "download",
    isPublished: true,
    sortOrder: store.tools.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [form, setForm] = useState<CommunityTool>(blank());
  const catName = useMemo(
    () => Object.fromEntries(store.categories.map((c) => [c.id, c.name])),
    [store.categories],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="max-h-[70vh] space-y-3 overflow-auto">
        {store.tools.map((t) => (
          <div key={t.id} className="rounded-xl border bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="text-xs text-slate-500">
                  {catName[t.categoryId]} · {t.toolType} · v{t.version}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setForm(t)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={async () => {
                    await adminDeleteTool({ data: { password, id: t.id } });
                    onRefresh();
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <form
        className="space-y-3 rounded-xl border bg-white p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await adminSaveTool({ data: { password, tool: form } });
          setForm(blank());
          onRefresh();
        }}
      >
        <h2 className="font-semibold">Add / edit tool</h2>
        <select
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
        >
          {store.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input placeholder="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        <Input
          placeholder="Short description"
          value={form.shortDescription}
          onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
        />
        <Textarea
          placeholder="Full description"
          value={form.fullDescription}
          onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
        />
        <Textarea
          placeholder="Release notes"
          value={form.releaseNotes}
          onChange={(e) => setForm({ ...form, releaseNotes: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Version"
            value={form.version}
            onChange={(e) => setForm({ ...form, version: e.target.value })}
          />
          <select
            className="rounded-md border px-3 py-2 text-sm"
            value={form.toolType}
            onChange={(e) => setForm({ ...form, toolType: e.target.value as ToolType })}
          >
            <option value="download">download</option>
            <option value="bookmark">bookmark</option>
            <option value="online">online</option>
            <option value="generator">generator</option>
          </select>
        </div>
        <Input
          placeholder="Download URL (or upload path later)"
          value={form.downloadUrl || ""}
          onChange={(e) => setForm({ ...form, downloadUrl: e.target.value })}
        />
        <Input
          placeholder="Online route e.g. /tools/check-live-uid"
          value={form.onlineRoute || ""}
          onChange={(e) => setForm({ ...form, onlineRoute: e.target.value })}
        />
        <Textarea
          placeholder="Bookmark javascript: code"
          value={form.bookmarkCode || ""}
          onChange={(e) => setForm({ ...form, bookmarkCode: e.target.value })}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
          />
          Published
        </label>
        <Button type="submit" className="bg-sky-600 hover:bg-sky-700">
          Save tool
        </Button>
      </form>
    </div>
  );
}

function ProductsAdmin({
  store,
  password,
  onRefresh,
}: {
  store: StoreData;
  password: string;
  onRefresh: () => void;
}) {
  const blank = (): Product => ({
    id: newId("prod"),
    name: "",
    slug: "",
    description: "",
    priceLabel: "Contact on Telegram",
    isPublished: true,
    sortOrder: store.products.length + 1,
  });
  const [form, setForm] = useState<Product>(blank());

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        {store.products.map((p) => (
          <div key={p.id} className="flex justify-between rounded-xl border bg-white p-4">
            <div>
              <p className="font-semibold">{p.name}</p>
              <p className="text-xs text-slate-500">{p.priceLabel}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setForm(p)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={async () => {
                  await adminDeleteProduct({ data: { password, id: p.id } });
                  onRefresh();
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
      <form
        className="space-y-3 rounded-xl border bg-white p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await adminSaveProduct({ data: { password, product: form } });
          setForm(blank());
          onRefresh();
        }}
      >
        <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input placeholder="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        <Textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <Input
          placeholder="Price label"
          value={form.priceLabel}
          onChange={(e) => setForm({ ...form, priceLabel: e.target.value })}
        />
        <Button type="submit" className="bg-sky-600 hover:bg-sky-700">
          Save product
        </Button>
      </form>
    </div>
  );
}

function MethodsAdmin({
  store,
  password,
  onRefresh,
}: {
  store: StoreData;
  password: string;
  onRefresh: () => void;
}) {
  const blank = (): MethodGuide => ({
    id: newId("method"),
    title: "",
    slug: "",
    summary: "",
    content: "",
    isPublished: true,
    sortOrder: store.methods.length + 1,
    createdAt: new Date().toISOString(),
    isNewDrop: true,
    tag: "Autopay",
    level: "Beginner",
    accent: "sky",
  });
  const [form, setForm] = useState<MethodGuide>(blank());
  const [notifyTelegram, setNotifyTelegram] = useState(true);
  const [msg, setMsg] = useState("");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        {store.methods.map((m) => (
          <div key={m.id} className="rounded-xl border bg-white p-4">
            <div className="flex justify-between gap-2">
              <div>
                <p className="font-semibold">{m.title}</p>
                <p className="text-xs text-slate-500">
                  {m.tag || "—"} · {m.isNewDrop ? "NEW DROP" : "archive"}{" "}
                  {m.telegramPostedAt ? "· posted TG" : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setForm(m)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  className="bg-sky-600 hover:bg-sky-700"
                  onClick={async () => {
                    const res = await shareMethodToTelegram({ data: { password, methodId: m.id } });
                    setMsg(res.ok ? `Posted: ${m.title}` : `TG failed: ${res.detail}`);
                    onRefresh();
                  }}
                >
                  Post TG
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={async () => {
                    await adminDeleteMethod({ data: { password, id: m.id } });
                    onRefresh();
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
        {msg && <p className="text-xs text-slate-500">{msg}</p>}
      </div>
      <form
        className="space-y-3 rounded-xl border bg-white p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await adminSaveMethod({ data: { password, method: form, notifyTelegram } });
          setForm(blank());
          setMsg(notifyTelegram ? "Saved (Telegram notify attempted if configured)" : "Saved");
          onRefresh();
        }}
      >
        <h2 className="font-semibold">Add / edit method drop</h2>
        <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <Input placeholder="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        <Input
          placeholder="Summary"
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
        />
        <Textarea
          className="min-h-32"
          placeholder="Content (markdown/text)"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Tag (Autopay/Boost)"
            value={form.tag || ""}
            onChange={(e) => setForm({ ...form, tag: e.target.value })}
          />
          <Input
            placeholder="Level (Beginner/Pro)"
            value={form.level || ""}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
          />
        </div>
        <select
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={form.accent || "sky"}
          onChange={(e) => setForm({ ...form, accent: e.target.value })}
        >
          {["sky", "rose", "emerald", "indigo", "amber", "cyan"].map((a) => (
            <option key={a} value={a}>
              Accent: {a}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!form.isNewDrop}
            onChange={(e) => setForm({ ...form, isNewDrop: e.target.checked })}
          />
          Mark as NEW METHOD DROP
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={notifyTelegram}
            onChange={(e) => setNotifyTelegram(e.target.checked)}
          />
          Auto-post to Telegram group on save
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
          />
          Published
        </label>
        <Button type="submit" className="bg-sky-600 hover:bg-sky-700">
          Save method drop
        </Button>
      </form>
    </div>
  );
}

function SettingsAdmin({
  store,
  password,
  onRefresh,
}: {
  store: StoreData;
  password: string;
  onRefresh: () => void;
}) {
  const [form, setForm] = useState(store.settings);
  return (
    <form
      className="max-w-lg space-y-3 rounded-xl border bg-white p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        await adminSaveSettings({ data: { password, settings: form } });
        onRefresh();
      }}
    >
      <Input
        placeholder="Site name"
        value={form.siteName}
        onChange={(e) => setForm({ ...form, siteName: e.target.value })}
      />
      <Input
        placeholder="Tagline"
        value={form.tagline}
        onChange={(e) => setForm({ ...form, tagline: e.target.value })}
      />
      <Input
        placeholder="Telegram community URL"
        value={form.telegramUrl}
        onChange={(e) => setForm({ ...form, telegramUrl: e.target.value })}
      />
      <Input
        placeholder="Telegram support URL"
        value={form.telegramSupport}
        onChange={(e) => setForm({ ...form, telegramSupport: e.target.value })}
      />
      <Input
        placeholder="Contact email"
        value={form.contactEmail}
        onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
      />
      <Input
        placeholder="Public site URL (for TG links)"
        value={form.sitePublicUrl || ""}
        onChange={(e) => setForm({ ...form, sitePublicUrl: e.target.value })}
      />
      <Input
        placeholder="Telegram Bot Token (auto method drops)"
        value={form.telegramBotToken || ""}
        onChange={(e) => setForm({ ...form, telegramBotToken: e.target.value })}
      />
      <Input
        placeholder="Telegram Chat / Group ID"
        value={form.telegramChatId || ""}
        onChange={(e) => setForm({ ...form, telegramChatId: e.target.value })}
      />
      <p className="text-xs text-slate-500">
        When you save a NEW method drop, it auto-posts to the Telegram group if bot token + chat id are set.
      </p>
      <Button type="submit" className="bg-sky-600 hover:bg-sky-700">
        Save settings
      </Button>
    </form>
  );
}

function AccessKeysAdmin({
  store,
  password,
  onRefresh,
}: {
  store: StoreData;
  password: string;
  onRefresh: () => void;
}) {
  const [label, setLabel] = useState("");
  const [telegramUserId, setTelegramUserId] = useState("");
  const [created, setCreated] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <form
        className="max-w-lg space-y-3 rounded-xl border bg-white p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const key = await adminCreateAccessKey({
            data: { password, label, telegramUserId: telegramUserId || undefined },
          });
          setCreated(key.key);
          setLabel("");
          onRefresh();
        }}
      >
        <h2 className="font-semibold">Create access key (Telegram bot later)</h2>
        <Input placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} required />
        <Input
          placeholder="Telegram user id (optional)"
          value={telegramUserId}
          onChange={(e) => setTelegramUserId(e.target.value)}
        />
        <Button type="submit" className="bg-sky-600 hover:bg-sky-700">
          Generate key
        </Button>
        {created && (
          <p className="rounded-lg bg-emerald-50 p-3 font-mono text-xs text-emerald-800 break-all">
            Created: {created}
          </p>
        )}
      </form>
      <div className="space-y-2">
        {store.accessKeys.map((k) => (
          <div key={k.id} className="rounded-xl border bg-white p-3 text-sm">
            <p className="font-semibold">{k.label}</p>
            <p className="font-mono text-xs text-slate-500 break-all">{k.key}</p>
            <p className="text-xs text-slate-400">
              {k.isActive ? "Active" : "Inactive"} · {k.createdAt}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
