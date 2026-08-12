import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  checkBmLinks,
  checkBmNames,
  checkBmVerified,
  checkLiveBms,
  checkLiveUids,
  findFacebookIds,
} from "./facebook/checkers";
import {
  deleteCategory,
  deleteMethod,
  deleteProduct,
  deleteTool,
  getMethodBySlug,
  getPublishedCatalog,
  getSettings,
  getStore,
  getToolBySlug,
  listMethods,
  listProducts,
  saveSettings,
  upsertAccessKey,
  upsertCategory,
  upsertMethod,
  upsertProduct,
  upsertTool,
  validateAccessKey,
} from "./db";
import { newId } from "./utils";
import { postMethodDropToTelegram } from "./telegram";
import type { AccessKey, CommunityTool, MethodGuide, Product, ToolCategory } from "./types";

const adminPassword = () => process.env.ADMIN_PASSWORD || "basictrick-admin";

export const verifyAdminPassword = createServerFn({ method: "POST" })
  .validator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    return { ok: data.password === adminPassword() };
  });

function assertAdmin(password: string) {
  if (password !== adminPassword()) {
    throw new Error("Unauthorized");
  }
}

export const fetchCatalog = createServerFn({ method: "GET" }).handler(async () => {
  return getPublishedCatalog();
});

export const fetchTool = createServerFn({ method: "GET" })
  .validator((d: { slug: string }) => d)
  .handler(async ({ data }) => getToolBySlug(data.slug));

export const fetchProducts = createServerFn({ method: "GET" }).handler(async () => listProducts());

export const fetchMethods = createServerFn({ method: "GET" }).handler(async () => listMethods());

export const fetchMethod = createServerFn({ method: "GET" })
  .validator((d: { slug: string }) => d)
  .handler(async ({ data }) => getMethodBySlug(data.slug));

export const fetchSettings = createServerFn({ method: "GET" }).handler(async () => getSettings());

export const runUidCheck = createServerFn({ method: "POST" })
  .validator((d: { text: string }) => d)
  .handler(async ({ data }) => checkLiveUids(data.text));

export const runBmLiveCheck = createServerFn({ method: "POST" })
  .validator((d: { text: string }) => d)
  .handler(async ({ data }) => checkLiveBms(data.text));

export const runBmVerifiedCheck = createServerFn({ method: "POST" })
  .validator((d: { text: string }) => d)
  .handler(async ({ data }) => checkBmVerified(data.text));

export const runBmLinkCheck = createServerFn({ method: "POST" })
  .validator((d: { text: string }) => d)
  .handler(async ({ data }) => checkBmLinks(data.text));

export const runBmNameCheck = createServerFn({ method: "POST" })
  .validator((d: { text: string }) => d)
  .handler(async ({ data }) => checkBmNames(data.text));

export const runFindId = createServerFn({ method: "POST" })
  .validator((d: { text: string }) => d)
  .handler(async ({ data }) => findFacebookIds(data.text));

export const adminGetStore = createServerFn({ method: "POST" })
  .validator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return getStore();
  });

export const adminSaveCategory = createServerFn({ method: "POST" })
  .validator((d: { password: string; category: ToolCategory }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return upsertCategory(data.category);
  });

export const adminDeleteCategory = createServerFn({ method: "POST" })
  .validator((d: { password: string; id: string }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return deleteCategory(data.id);
  });

export const adminSaveTool = createServerFn({ method: "POST" })
  .validator((d: { password: string; tool: CommunityTool }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const tool = {
      ...data.tool,
      updatedAt: new Date().toISOString(),
      createdAt: data.tool.createdAt || new Date().toISOString(),
    };
    return upsertTool(tool);
  });

export const adminDeleteTool = createServerFn({ method: "POST" })
  .validator((d: { password: string; id: string }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return deleteTool(data.id);
  });

export const adminSaveProduct = createServerFn({ method: "POST" })
  .validator((d: { password: string; product: Product }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return upsertProduct(data.product);
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .validator((d: { password: string; id: string }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return deleteProduct(data.id);
  });

export const adminSaveMethod = createServerFn({ method: "POST" })
  .validator(
    (d: { password: string; method: MethodGuide; notifyTelegram?: boolean }) => d,
  )
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    let method = { ...data.method };
    const settings = await getSettings();

    const shouldNotify =
      data.notifyTelegram !== false &&
      method.isPublished &&
      (method.isNewDrop || data.notifyTelegram === true);

    if (shouldNotify && settings.telegramBotToken && settings.telegramChatId) {
      const posted = await postMethodDropToTelegram({
        botToken: settings.telegramBotToken,
        chatId: settings.telegramChatId,
        title: method.title,
        summary: method.summary,
        slug: method.slug,
        sitePublicUrl: settings.sitePublicUrl,
        tag: method.tag,
      });
      if (posted.ok) {
        method = { ...method, telegramPostedAt: new Date().toISOString(), isNewDrop: true };
      }
    }

    await upsertMethod(method);
    return { store: await getStore(), method };
  });

export const shareMethodToTelegram = createServerFn({ method: "POST" })
  .validator((d: { password: string; methodId: string }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const store = await getStore();
    const method = store.methods.find((m) => m.id === data.methodId);
    if (!method) throw new Error("Method not found");
    const settings = store.settings;
    const posted = await postMethodDropToTelegram({
      botToken: settings.telegramBotToken,
      chatId: settings.telegramChatId,
      title: method.title,
      summary: method.summary,
      slug: method.slug,
      sitePublicUrl: settings.sitePublicUrl,
      tag: method.tag,
    });
    if (posted.ok) {
      await upsertMethod({
        ...method,
        isNewDrop: true,
        telegramPostedAt: new Date().toISOString(),
      });
    }
    return posted;
  });

export const adminDeleteMethod = createServerFn({ method: "POST" })
  .validator((d: { password: string; id: string }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return deleteMethod(data.id);
  });

export const adminSaveSettings = createServerFn({ method: "POST" })
  .validator((d: { password: string; settings: Awaited<ReturnType<typeof getSettings>> }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return saveSettings(data.settings);
  });

export const adminCreateAccessKey = createServerFn({ method: "POST" })
  .validator((d: { password: string; label: string; telegramUserId?: string }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const key: AccessKey = {
      id: newId("key"),
      key: `bt_${crypto.randomUUID().replace(/-/g, "")}`,
      label: data.label,
      telegramUserId: data.telegramUserId,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    await upsertAccessKey(key);
    return key;
  });

export const apiValidateAccess = createServerFn({ method: "POST" })
  .validator((d: { key: string }) => z.object({ key: z.string().min(8) }).parse(d))
  .handler(async ({ data }) => {
    const found = await validateAccessKey(data.key);
    return { valid: !!found, key: found };
  });

