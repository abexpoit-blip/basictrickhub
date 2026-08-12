import { createServerFn } from "@tanstack/react-start";
import {
  deleteTelegramWebhook,
  getTelegramBotInfo,
  setTelegramWebhook,
} from "./bot-engine";
import { markOrderPaid } from "./payments";
import { broadcastGroupPost, createDraftPost } from "./posts";
import { getTelegramData, updateTelegramData } from "./store";
import type {
  TgAiBrain,
  TgBoosterConfig,
  TgBotConfig,
  TgKeywordRule,
  TgNote,
  TgPremiumGate,
  TgSecurityConfig,
  TgStoreProduct,
  TelegramBotData,
} from "./types";

const adminPassword = () => process.env.ADMIN_PASSWORD || "basictrick-admin";

function assertAdmin(password: string) {
  if (password !== adminPassword()) throw new Error("Unauthorized");
}

export const tgAdminGet = createServerFn({ method: "POST" })
  .validator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return getTelegramData();
  });

export const tgAdminSaveConfig = createServerFn({ method: "POST" })
  .validator((d: { password: string; config: TgBotConfig }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return updateTelegramData((s) => {
      s.config = data.config;
      return s;
    });
  });

export const tgAdminSaveSecurity = createServerFn({ method: "POST" })
  .validator((d: { password: string; security: TgSecurityConfig }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return updateTelegramData((s) => {
      s.security = data.security;
      return s;
    });
  });

export const tgAdminSaveBooster = createServerFn({ method: "POST" })
  .validator((d: { password: string; booster: TgBoosterConfig }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return updateTelegramData((s) => {
      s.booster = data.booster;
      return s;
    });
  });

export const tgAdminSavePremium = createServerFn({ method: "POST" })
  .validator((d: { password: string; premium: TgPremiumGate }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return updateTelegramData((s) => {
      s.premium = data.premium;
      return s;
    });
  });

export const tgAdminSaveAi = createServerFn({ method: "POST" })
  .validator((d: { password: string; ai: TgAiBrain }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return updateTelegramData((s) => {
      s.ai = data.ai;
      return s;
    });
  });

export const tgAdminSaveKeywords = createServerFn({ method: "POST" })
  .validator((d: { password: string; keywords: TgKeywordRule[] }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return updateTelegramData((s) => {
      s.keywords = data.keywords;
      return s;
    });
  });

export const tgAdminSaveNotes = createServerFn({ method: "POST" })
  .validator((d: { password: string; notes: TgNote[] }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return updateTelegramData((s) => {
      s.notes = data.notes;
      return s;
    });
  });

export const tgAdminSaveProducts = createServerFn({ method: "POST" })
  .validator((d: { password: string; products: TgStoreProduct[] }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return updateTelegramData((s) => {
      s.products = data.products;
      return s;
    });
  });

export const tgAdminSaveLinks = createServerFn({ method: "POST" })
  .validator((d: { password: string; linkButtons: import("./types").TgLinkButton[] }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return updateTelegramData((s) => {
      s.linkButtons = data.linkButtons;
      return s;
    });
  });

export const tgAdminCreatePost = createServerFn({ method: "POST" })
  .validator(
    (d: {
      password: string;
      title: string;
      body: string;
      buttonText?: string;
      buttonUrl?: string;
      target: "all" | "selected";
      selectedChatIds: string[];
    }) => d,
  )
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const { password: _, ...rest } = data;
    await createDraftPost(rest);
    return getTelegramData();
  });

export const tgAdminBroadcastPost = createServerFn({ method: "POST" })
  .validator((d: { password: string; postId: string }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const result = await broadcastGroupPost(data.postId);
    const store = await getTelegramData();
    return { ...result, store };
  });

export const tgAdminDeletePost = createServerFn({ method: "POST" })
  .validator((d: { password: string; postId: string }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return updateTelegramData((s) => {
      s.posts = s.posts.filter((p) => p.id !== data.postId);
      return s;
    });
  });

export const tgAdminSetWebhook = createServerFn({ method: "POST" })
  .validator((d: { password: string; publicUrl?: string }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const store = await getTelegramData();
    const url = data.publicUrl || store.config.sitePublicUrl;
    return setTelegramWebhook(url);
  });

export const tgAdminBotStatus = createServerFn({ method: "POST" })
  .validator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return getTelegramBotInfo();
  });

export const tgAdminDeleteWebhook = createServerFn({ method: "POST" })
  .validator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return deleteTelegramWebhook();
  });

export const tgAdminMarkPaid = createServerFn({ method: "POST" })
  .validator((d: { password: string; orderId: string }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return markOrderPaid(data.orderId);
  });

export const tgAdminAddGroup = createServerFn({ method: "POST" })
  .validator((d: { password: string; link: string; title?: string }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const { addGroupByLink } = await import("./groups");
    return addGroupByLink(data.link, data.title);
  });

export const tgAdminSyncGroups = createServerFn({ method: "POST" })
  .validator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const { syncManagedGroups } = await import("./groups");
    return syncManagedGroups();
  });

export const tgAdminRemoveGroup = createServerFn({ method: "POST" })
  .validator((d: { password: string; chatId: string }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const { removeManagedGroup } = await import("./groups");
    return removeManagedGroup(data.chatId);
  });

export const tgAdminToggleGroup = createServerFn({ method: "POST" })
  .validator((d: { password: string; chatId: string; isActive: boolean }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const { setManagedGroupActive } = await import("./groups");
    return setManagedGroupActive(data.chatId, data.isActive);
  });


export const tgAdminMemberAction = createServerFn({ method: "POST" })
  .validator(
    (d: {
      password: string;
      userId: string;
      action: "ban" | "unban" | "mute" | "unmute" | "resetwarns" | "approve";
    }) => d,
  )
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return updateTelegramData((s) => {
      let m = s.members.find((x) => x.telegramUserId === data.userId);
      if (!m) {
        m = {
          telegramUserId: data.userId,
          warns: 0,
          banned: false,
          addedGroupIds: [],
          purchasedProductIds: [],
          createdAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
        };
        s.members.push(m);
      }
      m.addedGroupIds = m.addedGroupIds || [];
      if (data.action === "ban") m.banned = true;
      if (data.action === "unban") {
        m.banned = false;
        m.banUntil = undefined;
      }
      if (data.action === "mute") {
        m.mutedUntil = new Date(Date.now() + 60 * 60_000).toISOString();
      }
      if (data.action === "unmute") m.mutedUntil = undefined;
      if (data.action === "resetwarns") m.warns = 0;
      if (data.action === "approve") {
        m.approved = true;
        m.captchaPending = false;
      }
      return s;
    });
  });

export const tgAdminReplace = createServerFn({ method: "POST" })
  .validator((d: { password: string; data: TelegramBotData }) => d)
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    return updateTelegramData(() => data.data);
  });
