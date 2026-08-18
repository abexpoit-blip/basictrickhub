import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { createSeedData } from "./seed";
import type {
  AccessKey,
  CommunityTool,
  MethodGuide,
  Product,
  StoreData,
  ToolCategory,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

async function ensureStore(): Promise<StoreData> {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(UPLOADS_DIR, { recursive: true });
  try {
    await access(STORE_PATH);
    const raw = await readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as StoreData;
  } catch {
    const seed = createSeedData();
    await writeFile(STORE_PATH, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
}

async function saveStore(data: StoreData): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
}

export function getUploadsDir() {
  return UPLOADS_DIR;
}

export async function getStore(): Promise<StoreData> {
  const store = await ensureStore();
  const seed = createSeedData();
  let dirty = false;

  // Soft-migrate methods
  for (const m of store.methods) {
    if (m.isNewDrop === undefined) {
      m.isNewDrop = true;
      dirty = true;
    }
  }
  for (const sm of seed.methods) {
    if (!store.methods.some((m) => m.id === sm.id || m.slug === sm.slug)) {
      store.methods.push(sm);
      dirty = true;
    }
  }

  if (!store.settings.sitePublicUrl) {
    store.settings.sitePublicUrl = "http://localhost:8080";
    dirty = true;
  }
  if (store.settings.telegramBotToken === undefined) {
    store.settings.telegramBotToken = "";
    dirty = true;
  }
  if (store.settings.telegramChatId === undefined) {
    store.settings.telegramChatId = "";
    dirty = true;
  }

  const accents = ["rose", "indigo", "amber", "emerald", "sky", "cyan"];
  store.categories.forEach((c, i) => {
    const seedCat = seed.categories.find((x) => x.id === c.id);
    if (!c.accent) {
      c.accent = seedCat?.accent || accents[i % accents.length];
      dirty = true;
    }
  });

  for (const st of seed.tools) {
    const idx = store.tools.findIndex((t) => t.id === st.id || t.slug === st.slug);
    if (idx < 0) {
      store.tools.push(st);
      dirty = true;
    } else if (st.id === "tool-post-booster" || st.id === "tool-fb-reset") {
      const cur = store.tools[idx];
      if (cur.downloadUrl !== st.downloadUrl || cur.name !== st.name || cur.slug !== st.slug) {
        store.tools[idx] = { ...cur, ...st, createdAt: cur.createdAt };
        dirty = true;
      }
    }
  }

  if (dirty) await saveStore(store);
  return store;
}

export async function updateStore(
  updater: (data: StoreData) => StoreData | Promise<StoreData>,
): Promise<StoreData> {
  const current = await ensureStore();
  const next = await updater(structuredClone(current));
  await saveStore(next);
  return next;
}

export async function getPublishedCatalog() {
  const store = await getStore();
  const categories = store.categories
    .filter((c) => c.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const tools = store.tools
    .filter((t) => t.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return { categories, tools, settings: store.settings };
}

export async function getToolBySlug(slug: string): Promise<CommunityTool | undefined> {
  const store = await getStore();
  return store.tools.find((t) => t.slug === slug && t.isPublished);
}

export async function listProducts(): Promise<Product[]> {
  const store = await getStore();
  return store.products.filter((p) => p.isPublished).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function listMethods(): Promise<MethodGuide[]> {
  const store = await getStore();
  return store.methods.filter((m) => m.isPublished).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getMethodBySlug(slug: string): Promise<MethodGuide | undefined> {
  const store = await getStore();
  return store.methods.find((m) => m.slug === slug && m.isPublished);
}

export async function getSettings() {
  const store = await getStore();
  return store.settings;
}

export async function upsertCategory(cat: ToolCategory) {
  return updateStore((data) => {
    const idx = data.categories.findIndex((c) => c.id === cat.id);
    if (idx >= 0) data.categories[idx] = cat;
    else data.categories.push(cat);
    return data;
  });
}

export async function deleteCategory(id: string) {
  return updateStore((data) => {
    data.categories = data.categories.filter((c) => c.id !== id);
    data.tools = data.tools.filter((t) => t.categoryId !== id);
    return data;
  });
}

export async function upsertTool(tool: CommunityTool) {
  return updateStore((data) => {
    const idx = data.tools.findIndex((t) => t.id === tool.id);
    if (idx >= 0) data.tools[idx] = tool;
    else data.tools.push(tool);
    return data;
  });
}

export async function deleteTool(id: string) {
  return updateStore((data) => {
    data.tools = data.tools.filter((t) => t.id !== id);
    return data;
  });
}

export async function upsertProduct(product: Product) {
  return updateStore((data) => {
    const idx = data.products.findIndex((p) => p.id === product.id);
    if (idx >= 0) data.products[idx] = product;
    else data.products.push(product);
    return data;
  });
}

export async function deleteProduct(id: string) {
  return updateStore((data) => {
    data.products = data.products.filter((p) => p.id !== id);
    return data;
  });
}

export async function upsertMethod(method: MethodGuide) {
  return updateStore((data) => {
    const idx = data.methods.findIndex((m) => m.id === method.id);
    if (idx >= 0) data.methods[idx] = method;
    else data.methods.push(method);
    return data;
  });
}

export async function deleteMethod(id: string) {
  return updateStore((data) => {
    data.methods = data.methods.filter((m) => m.id !== id);
    return data;
  });
}

export async function saveSettings(settings: StoreData["settings"]) {
  return updateStore((data) => {
    data.settings = settings;
    return data;
  });
}

export async function upsertAccessKey(key: AccessKey) {
  return updateStore((data) => {
    const idx = data.accessKeys.findIndex((k) => k.id === key.id);
    if (idx >= 0) data.accessKeys[idx] = key;
    else data.accessKeys.push(key);
    return data;
  });
}

export async function validateAccessKey(key: string) {
  const store = await getStore();
  const found = store.accessKeys.find((k) => k.key === key && k.isActive);
  if (!found) return null;
  if (found.expiresAt && new Date(found.expiresAt).getTime() < Date.now()) return null;
  return found;
}

export { newId } from "./utils";
