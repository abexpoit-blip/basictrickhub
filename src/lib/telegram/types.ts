export type BotProductType = "tool" | "course" | "vip" | "group" | "method" | "account" | "other";

export type PunishMode = "warn" | "mute" | "tmute" | "kick" | "ban" | "tban" | "delete";

export type LockKey =
  | "url"
  | "invitelink"
  | "forward"
  | "sticker"
  | "gif"
  | "photo"
  | "video"
  | "audio"
  | "voice"
  | "document"
  | "contact"
  | "location"
  | "poll"
  | "game"
  | "inline"
  | "bot"
  | "media"
  | "rtl"
  | "button";

export type AiAction = "none" | "shop" | "vip" | "boost" | "support" | "tools" | "course";

export interface TgKeywordRule {
  id: string;
  keywords: string[];
  title: string;
  replyBn: string;
  replyEn: string;
  suggestProductId?: string;
  suggestBotUsername?: string;
  buttonText?: string;
  buttonUrl?: string;
  isActive: boolean;
  priority: number;
}

export interface TgNote {
  id: string;
  name: string;
  content: string;
  isActive: boolean;
}

export interface TgAiIntent {
  id: string;
  name: string;
  patterns: string[];
  replyBn: string;
  replyEn: string;
  action: AiAction;
  isActive: boolean;
  priority: number;
}

export interface TgAiBrain {
  enabled: boolean;
  personaName: string;
  fallbackBn: string;
  fallbackEn: string;
  smartMode: boolean;
  intents: TgAiIntent[];
}

export interface TgBoosterConfig {
  enabled: boolean;
  freeGroupId: string;
  freeGroupInvite: string;
  freeGroupTitle: string;
  requireJoinFreeGroup: boolean;
  autoSendInviteOnStart: boolean;
  autoSendInviteOnJoin: boolean;
  boostMessageBn: string;
  boostMessageEn: string;
  targetDailyJoins: number;
  invitesSent: number;
  joinsTracked: number;
}

export interface TgPremiumGate {
  enabled: boolean;
  minGroupsToUnlockAi: number;
  requireFreeGroupJoin: boolean;
  premiumBadge: string;
  lockedMessageBn: string;
  lockedMessageEn: string;
  unlockedMessageBn: string;
  unlockedMessageEn: string;
}

export interface TgManagedGroup {
  chatId: string;
  title: string;
  type: string;
  username?: string;
  inviteLink?: string;
  addedByUserId?: string;
  isActive: boolean;
  pending?: boolean;
  memberCount?: number;
  lastPostAt?: string;
  createdAt: string;
}

export interface TgGroupPost {
  id: string;
  title: string;
  body: string;
  buttonText?: string;
  buttonUrl?: string;
  target: "all" | "selected";
  selectedChatIds: string[];
  status: "draft" | "sent" | "failed";
  sentAt?: string;
  sentCount: number;
  createdAt: string;
}

export interface TgStoreProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceBdt: number;
  priceUsd: number;
  type: BotProductType;
  deliveryNote: string;
  telegramInvite?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface TgOrder {
  id: string;
  productId: string;
  productName: string;
  telegramUserId: string;
  telegramUsername?: string;
  amount: number;
  currency: "BDT" | "USD";
  gateway: "zinipay" | "plisio";
  status: "pending" | "paid" | "failed" | "cancelled" | "delivered";
  gatewayRef?: string;
  paymentUrl?: string;
  createdAt: string;
  paidAt?: string;
  deliveredAt?: string;
}

export interface TgMember {
  telegramUserId: string;
  username?: string;
  firstName?: string;
  warns: number;
  mutedUntil?: string;
  banned: boolean;
  banUntil?: string;
  vipUntil?: string;
  captchaPending?: boolean;
  captchaJoinedAt?: string;
  approved?: boolean;
  joinedFreeGroup?: boolean;
  addedGroupIds: string[];
  aiUnlocked?: boolean;
  boostInvitesSent?: number;
  purchasedProductIds: string[];
  createdAt: string;
  lastSeenAt: string;
}

export interface TgLocks {
  url: boolean;
  invitelink: boolean;
  forward: boolean;
  sticker: boolean;
  gif: boolean;
  photo: boolean;
  video: boolean;
  audio: boolean;
  voice: boolean;
  document: boolean;
  contact: boolean;
  location: boolean;
  poll: boolean;
  game: boolean;
  inline: boolean;
  bot: boolean;
  media: boolean;
  rtl: boolean;
  button: boolean;
}

export interface TgSecurityConfig {
  antiSpam: boolean;
  antiFlood: boolean;
  floodMaxMessages: number;
  floodWindowSec: number;
  floodMode: PunishMode;
  floodMuteMinutes: number;
  clearFlood: boolean;
  locks: TgLocks;
  blockLinks: boolean;
  blockForwards: boolean;
  blockInvitelinks: boolean;
  allowlistedDomains: string[];
  captchaOnJoin: boolean;
  captchaKickMinutes: number;
  captchaMuteUntilPass: boolean;
  approvalMode: boolean;
  antiRaid: boolean;
  antiRaidJoinLimit: number;
  antiRaidWindowSec: number;
  maxWarns: number;
  warnMode: PunishMode;
  warnMuteMinutes: number;
  deleteBlacklistHits: boolean;
  blacklistWords: string[];
  blacklistMode: PunishMode;
  welcomeEnabled: boolean;
  welcomeMessageBn: string;
  welcomeMessageEn: string;
  goodbyeEnabled: boolean;
  goodbyeMessage: string;
  cleanService: boolean;
  rulesText: string;
  reportEnabled: boolean;
  logChannelId: string;
  nightMode: boolean;
  nightMuteAll: boolean;
}

export interface TgBotConfig {
  botToken: string;
  botUsername: string;
  webhookSecret: string;
  adminIds: string[];
  salesBotUsername: string;
  supportUrl: string;
  defaultLang: "bn" | "en";
  zinipayApiKey: string;
  plisioApiKey: string;
  sitePublicUrl: string;
  enabled: boolean;
}

export interface TelegramBotData {
  schemaVersion?: number;
  config: TgBotConfig;
  security: TgSecurityConfig;
  booster: TgBoosterConfig;
  premium: TgPremiumGate;
  ai: TgAiBrain;
  keywords: TgKeywordRule[];
  notes: TgNote[];
  products: TgStoreProduct[];
  orders: TgOrder[];
  members: TgMember[];
  managedGroups: TgManagedGroup[];
  posts: TgGroupPost[];
  logs: { id: string; at: string; level: string; message: string }[];
}

/** Bump to force-apply community defaults (keywords, locks, free group) on existing VPS data. */
export const TELEGRAM_SCHEMA_VERSION = 2;

export const DEFAULT_LOCKS: TgLocks = {
  url: false,
  invitelink: false,
  forward: false,
  sticker: false,
  gif: false,
  photo: false,
  video: false,
  audio: false,
  voice: false,
  document: false,
  contact: false,
  location: false,
  poll: false,
  game: false,
  inline: false,
  bot: false,
  media: false,
  rtl: false,
  button: false,
};

export function defaultSecurity(): TgSecurityConfig {
  return {
    antiSpam: true,
    antiFlood: true,
    floodMaxMessages: 5,
    floodWindowSec: 8,
    floodMode: "tmute",
    floodMuteMinutes: 10,
    clearFlood: false,
    locks: {
      ...DEFAULT_LOCKS,
      url: true,
      invitelink: true,
      forward: true,
    },
    blockLinks: true,
    blockForwards: true,
    blockInvitelinks: true,
    allowlistedDomains: [
      "t.me/basictrick",
      "t.me/btidsellerbot",
      "t.me/basictrickadmin",
      "basictrickhub.com",
      "basictrick.com",
    ],
    captchaOnJoin: true,
    captchaKickMinutes: 5,
    captchaMuteUntilPass: true,
    approvalMode: false,
    antiRaid: true,
    antiRaidJoinLimit: 8,
    antiRaidWindowSec: 20,
    maxWarns: 3,
    warnMode: "tmute",
    warnMuteMinutes: 60,
    deleteBlacklistHits: true,
    blacklistWords: ["scam link", "free nitro", "xxx", "crypto airdrop"],
    blacklistMode: "warn",
    welcomeEnabled: true,
    welcomeMessageBn:
      "স্বাগতম {name}! 👋\nBasictrick অফিসিয়াল কমিউনিটিতে আপনাকে স্বাগতম।\n\n✅ ID / VPN কিনতে অফিসিয়াল সেলার বট: https://t.me/btidsellerbot\n⚡ অটো পেমেন্ট · ইনস্ট্যান্ট ডেলিভারি\n👥 ফ্রি/AI গ্রুপ: https://t.me/basictrick\n🛡 অ্যাডমিন: https://t.me/Basictrickadmin\n\n📌 রুলস: লিংক/অন্য গ্রুপ শেয়ার নিষেধ · /rules",
    welcomeMessageEn:
      "Welcome {name}! 👋\nBuy ID/VPN from official seller: https://t.me/btidsellerbot\nFree/AI group: https://t.me/basictrick\nAdmin: https://t.me/Basictrickadmin\nNo link / other-group sharing. /rules",
    goodbyeEnabled: true,
    goodbyeMessage: "👋 {name} গ্রুপ ছেড়ে চলে গেছেন। আবার স্বাগতম — https://t.me/basictrick",
    cleanService: true,
    rulesText:
      "1) লিংক শেয়ার নিষেধ (অফিসিয়াল ছাড়া)\n2) অন্য গ্রুপ/চ্যানেল ইনভাইট শেয়ার নিষেধ\n3) স্প্যাম/ফ্লাড নিষেধ\n4) ID/VPN শুধু অফিসিয়াল বট থেকে: https://t.me/btidsellerbot\n5) AI ব্যবহার করতে ফ্রি গ্রুপে জয়েন: https://t.me/basictrick\n6) অ্যাডমিন: https://t.me/Basictrickadmin",
    reportEnabled: true,
    logChannelId: "",
    nightMode: false,
    nightMuteAll: false,
  };
}

export function defaultBooster(): TgBoosterConfig {
  return {
    enabled: true,
    freeGroupId: "@basictrick",
    freeGroupInvite: "https://t.me/basictrick",
    freeGroupTitle: "Basictrick Free / AI Community",
    requireJoinFreeGroup: true,
    autoSendInviteOnStart: true,
    autoSendInviteOnJoin: true,
    boostMessageBn:
      "🚀 Basictrick ফ্রি/AI গ্রুপ\nAI ও কমিউনিটি আপডেট পেতে অবশ্যই জয়েন করুন:\n\n👉 {invite}\nগ্রুপ: {group}",
    boostMessageEn:
      "🚀 Join Basictrick Free/AI group to unlock community AI:\n\n👉 {invite}\nGroup: {group}",
    targetDailyJoins: 100,
    invitesSent: 0,
    joinsTracked: 0,
  };
}

export function defaultPremium(): TgPremiumGate {
  return {
    enabled: true,
    minGroupsToUnlockAi: 0,
    requireFreeGroupJoin: true,
    premiumBadge: "✦ Basictrick AI",
    lockedMessageBn:
      "✦ AI লক করা আছে\nAI বট ব্যবহার করতে অবশ্যই আমাদের অফিসিয়াল গ্রুপে জয়েন করতে হবে:\n\n👉 {invite}\n\nজয়েন করার পর আবার মেসেজ দিন বা /aistatus চাপুন।\nঅ্যাডমিন: https://t.me/Basictrickadmin",
    lockedMessageEn:
      "✦ AI locked\nJoin our official group to use AI:\n\n👉 {invite}\n\nThen message again or /aistatus.\nAdmin: https://t.me/Basictrickadmin",
    unlockedMessageBn: "✦ AI আনলকড! এখন জিজ্ঞাসা করুন — ID, VPN, VIP, Method।",
    unlockedMessageEn: "✦ AI unlocked! Ask about ID, VPN, VIP, Method.",
  };
}

export function defaultAiBrain(): TgAiBrain {
  return {
    enabled: true,
    personaName: "Basictrick Omni",
    smartMode: true,
    fallbackBn:
      "আমি Basictrick Omni AI 🤖\nবুঝতে পারছি আপনি সাহায্য চাইছেন।\nট্রাই করুন: /shop · /vip · facebook id · method · /boost\nঅথবা স্পষ্ট করে লিখুন কী লাগবে।",
    fallbackEn:
      "I'm Basictrick Omni AI 🤖\nTry: /shop · /vip · facebook id · method · /boost\nOr tell me what you need clearly.",
    intents: [
      {
        id: "intent-hi",
        name: "Greeting",
        patterns: ["hi", "hello", "salam", "assalam", "হ্যালো", "হাই", "কেমন আছ"],
        replyBn: "হ্যালো! আমি {persona} 👋\nকী লাগবে — ID, VIP, Tools, Method? /shop দেখুন।",
        replyEn: "Hey! I'm {persona} 👋\nNeed ID, VIP, Tools or Method? Try /shop.",
        action: "none",
        isActive: true,
        priority: 20,
      },
      {
        id: "intent-price",
        name: "Pricing",
        patterns: ["price", "কত", "দাম", "rate", "cost", "কতো টাকা"],
        replyBn: "💰 প্রাইস লিস্ট /shop এ। VIP, Course, Tools আলাদা প্যাক আছে। ZiniPay + Plisio সাপোর্ট।",
        replyEn: "💰 See prices in /shop. VIP, Course, Tools packs. ZiniPay + Plisio supported.",
        action: "shop",
        isActive: true,
        priority: 18,
      },
      {
        id: "intent-buy",
        name: "Buy intent",
        patterns: ["kinbo", "কিনব", "buy", "purchase", "order", "পেমেন্ট"],
        replyBn: "অর্ডার করতে /shop খুলুন → ZiniPay বা Plisio সিলেক্ট করুন। পেমেন্ট হলে অটো ডেলিভারি।",
        replyEn: "Open /shop → pick ZiniPay or Plisio. Access unlocks after payment.",
        action: "shop",
        isActive: true,
        priority: 17,
      },
      {
        id: "intent-help",
        name: "Help",
        patterns: ["help", "সাহায্য", "কিভাবে", "how to", "guide"],
        replyBn: "হেল্প মেনু: /help\nস্টোর /shop · VIP /vip · বুস্ট /boost · AI স্ট্যাটাস /aistatus",
        replyEn: "Help: /help · Store /shop · VIP /vip · Boost /boost · AI /aistatus",
        action: "none",
        isActive: true,
        priority: 15,
      },
      {
        id: "intent-support",
        name: "Support",
        patterns: ["support", "admin", "সাপোর্ট", "হেল্পলাইন", "contact", "যোগাযোগ", "কমিউনিটি অ্যাডমিন"],
        replyBn:
          "🛡 কমিউনিটি অ্যাডমিনের সাথে যোগাযোগ:\n👉 https://t.me/Basictrickadmin\n\nID/VPN কিনতে অফিসিয়াল সেলার:\n👉 https://t.me/btidsellerbot\n(অটো পেমেন্ট · ইনস্ট্যান্ট ডেলিভারি)\n\nAI গ্রুপ: https://t.me/basictrick",
        replyEn:
          "🛡 Community admin: https://t.me/Basictrickadmin\nOfficial ID/VPN seller: https://t.me/btidsellerbot\nAI group: https://t.me/basictrick",
        action: "support",
        isActive: true,
        priority: 14,
      },
    ],
  };
}

export function communityKeywordRules(): TgKeywordRule[] {
  const sellerBn =
    "🔥 Basictrick অফিসিয়াল বট থেকে ID / VPN কিনুন\n\n✅ অটোমেটিক পেমেন্ট সিস্টেম\n⚡ ইনস্ট্যান্ট ডেলিভারি\n🛡 অফিসিয়াল ও সেফ\n\n👉 সেলার বট: https://t.me/btidsellerbot\n\nঅ্যাডমিন সাপোর্ট: https://t.me/Basictrickadmin\nAI/কমিউনিটি গ্রুপ: https://t.me/basictrick";
  const sellerEn =
    "🔥 Buy ID / VPN from Basictrick official seller\n\n✅ Automatic payment\n⚡ Instant delivery\n\n👉 https://t.me/btidsellerbot\nAdmin: https://t.me/Basictrickadmin\nGroup: https://t.me/basictrick";
  return [
    {
      id: "kw-id-vpn-seller",
      keywords: [
        "facebook id",
        "fb id",
        "ফেসবুক আইডি",
        "ফেসবুক id",
        "fb account",
        "facebook account",
        "আইডি কিনব",
        "id kinbo",
        "id chai",
        "id lagbe",
        "আইডি লাগবে",
        "pc clone",
        "pcclone",
        "clone id",
        "1000xxx",
        "1000x",
        "61xxx",
        "61xx",
        "vpn",
        "nord",
        "nordvpn",
        "ip vanish",
        "ipvanish",
        "ip",
        "id",
        "আইডি",
      ],
      title: "ID / VPN → Official Seller",
      replyBn: sellerBn,
      replyEn: sellerEn,
      suggestBotUsername: "btidsellerbot",
      buttonText: "🛒 Official ID Seller Bot",
      buttonUrl: "https://t.me/btidsellerbot",
      isActive: true,
      priority: 20,
    },
    {
      id: "kw-bm",
      keywords: ["business manager", "bm chai", "bm কিনব", "bm id", "বিএম"],
      title: "BM Tools",
      replyBn:
        "BM লাগলে Tools/Method দেখুন অথবা অফিসিয়াল সেলার:\n👉 https://t.me/btidsellerbot\nওয়েব: {site}/tools",
      replyEn:
        "Need BM? Check tools or official seller:\n👉 https://t.me/btidsellerbot\nWeb: {site}/tools",
      suggestBotUsername: "btidsellerbot",
      buttonText: "Open Seller Bot",
      buttonUrl: "https://t.me/btidsellerbot",
      isActive: true,
      priority: 8,
    },
    {
      id: "kw-autopay",
      keywords: ["autopay", "threshold", "অটোপে", "থ্রেশহোল্ড", "method"],
      title: "Autopay Method",
      replyBn:
        "📘 Autopay Threshold মেথড: /course বা /vip\nওয়েব: {site}/method\nঅ্যাডমিন: https://t.me/Basictrickadmin",
      replyEn:
        "📘 Autopay methods: /course or /vip\nWeb: {site}/method\nAdmin: https://t.me/Basictrickadmin",
      isActive: true,
      priority: 7,
    },
    {
      id: "kw-vip",
      keywords: ["vip", "paid group", "প্রাইভেট গ্রুপ", "ভিআইপি"],
      title: "VIP Access",
      replyBn: "⭐ VIP এক্সেস: /vip · অ্যাডমিন: https://t.me/Basictrickadmin",
      replyEn: "⭐ VIP: /vip · Admin: https://t.me/Basictrickadmin",
      isActive: true,
      priority: 9,
    },
    {
      id: "kw-admin",
      keywords: ["admin link", "অ্যাডমিন", "কমিউনিটি অ্যাডমিন", "admin chai"],
      title: "Community Admin",
      replyBn:
        "🛡 কমিউনিটি অ্যাডমিন:\n👉 https://t.me/Basictrickadmin\n\nযেকোনো প্রশ্ন/হেল্প এখানে।",
      replyEn: "🛡 Community admin: https://t.me/Basictrickadmin",
      buttonText: "Open Admin",
      buttonUrl: "https://t.me/Basictrickadmin",
      isActive: true,
      priority: 12,
    },
  ];
}

export function createTelegramSeed(): TelegramBotData {
  const now = new Date().toISOString();
  return {
    schemaVersion: TELEGRAM_SCHEMA_VERSION,
    config: {
      botToken: "",
      botUsername: "basictrickbot",
      webhookSecret: crypto.randomUUID().replace(/-/g, "").slice(0, 24),
      adminIds: ["5311644406", "7967023275"],
      salesBotUsername: "btidsellerbot",
      supportUrl: "https://t.me/Basictrickadmin",
      defaultLang: "bn",
      zinipayApiKey: "",
      plisioApiKey: "",
      sitePublicUrl: "https://basictrickhub.com",
      enabled: true,
    },
    security: defaultSecurity(),
    booster: defaultBooster(),
    premium: defaultPremium(),
    ai: defaultAiBrain(),
    notes: [
      {
        id: "note-rules",
        name: "rules",
        content:
          "Community rules:\n1) No links / other group invites\n2) Buy ID/VPN only from https://t.me/btidsellerbot\n3) AI requires join https://t.me/basictrick\n4) Admin: https://t.me/Basictrickadmin",
        isActive: true,
      },
      {
        id: "note-shop",
        name: "shop",
        content:
          "ID / VPN → https://t.me/btidsellerbot (auto pay · instant delivery)\nWeb shop: https://basictrickhub.com/shop",
        isActive: true,
      },
      {
        id: "note-support",
        name: "support",
        content: "Admin: https://t.me/Basictrickadmin\nGroup: https://t.me/basictrick",
        isActive: true,
      },
    ],
    keywords: communityKeywordRules(),
    products: [
      {
        id: "bot-prod-vip",
        name: "VIP Telegram Access (30 days)",
        slug: "vip-30",
        description: "Private VIP group + daily method drops",
        priceBdt: 1500,
        priceUsd: 15,
        type: "vip",
        deliveryNote: "VIP invite sent after payment verify",
        telegramInvite: "",
        isActive: true,
        sortOrder: 1,
      },
      {
        id: "bot-prod-course",
        name: "Autopay Threshold Course",
        slug: "autopay-course",
        description: "Full paid course pack",
        priceBdt: 2500,
        priceUsd: 25,
        type: "course",
        deliveryNote: "Course link + Telegram channel access",
        isActive: true,
        sortOrder: 2,
      },
      {
        id: "bot-prod-tools",
        name: "Premium Tools Pack",
        slug: "tools-pack",
        description: "Paid community tools download pack",
        priceBdt: 999,
        priceUsd: 10,
        type: "tool",
        deliveryNote: "Download unlocked on website after payment",
        isActive: true,
        sortOrder: 3,
      },
    ],
    orders: [],
    members: [],
    managedGroups: [],
    posts: [],
    logs: [
      {
        id: "log-seed",
        at: now,
        level: "info",
        message: "Telegram Admin initialized — Rose + Omni AI + Group Booster",
      },
    ],
  };
}

export function migrateTelegramData(raw: Partial<TelegramBotData>): TelegramBotData {
  const seed = createTelegramSeed();
  const fromVersion = Number(raw.schemaVersion || 0);
  const applyCommunityPack = fromVersion < TELEGRAM_SCHEMA_VERSION;

  const sec = applyCommunityPack
    ? { ...defaultSecurity(), ...(raw.security || {}), ...pickCommunitySecurity(raw.security) }
    : { ...defaultSecurity(), ...(raw.security || {}) };
  sec.locks = applyCommunityPack
    ? {
        ...DEFAULT_LOCKS,
        ...(raw.security?.locks || {}),
        url: true,
        invitelink: true,
        forward: true,
      }
    : { ...DEFAULT_LOCKS, ...(raw.security?.locks || {}) };

  const mergedConfig = { ...seed.config, ...(raw.config || {}) };
  if (!mergedConfig.adminIds?.length) {
    mergedConfig.adminIds = seed.config.adminIds;
  }
  if (!mergedConfig.sitePublicUrl?.trim()) {
    mergedConfig.sitePublicUrl = seed.config.sitePublicUrl;
  }
  mergedConfig.botToken = raw.config?.botToken || "";
  if (applyCommunityPack) {
    mergedConfig.salesBotUsername = "btidsellerbot";
    mergedConfig.supportUrl = "https://t.me/Basictrickadmin";
    mergedConfig.botUsername = mergedConfig.botUsername || "basictrickbot";
    mergedConfig.defaultLang = "bn";
  }

  const booster = applyCommunityPack
    ? {
        ...defaultBooster(),
        ...(raw.booster || {}),
        freeGroupId: "@basictrick",
        freeGroupInvite: "https://t.me/basictrick",
        freeGroupTitle: "Basictrick Free / AI Community",
        requireJoinFreeGroup: true,
        enabled: true,
      }
    : { ...defaultBooster(), ...(raw.booster || {}) };

  const premium = applyCommunityPack
    ? {
        ...defaultPremium(),
        ...(raw.premium || {}),
        minGroupsToUnlockAi: 0,
        requireFreeGroupJoin: true,
        enabled: true,
        lockedMessageBn: defaultPremium().lockedMessageBn,
        lockedMessageEn: defaultPremium().lockedMessageEn,
      }
    : { ...defaultPremium(), ...(raw.premium || {}) };

  return {
    schemaVersion: TELEGRAM_SCHEMA_VERSION,
    config: mergedConfig,
    security: sec,
    booster,
    premium,
    ai: {
      ...defaultAiBrain(),
      ...(raw.ai || {}),
      intents: applyCommunityPack
        ? defaultAiBrain().intents
        : raw.ai?.intents?.length
          ? raw.ai.intents
          : seed.ai.intents,
    },
    keywords: applyCommunityPack ? communityKeywordRules() : raw.keywords?.length ? raw.keywords : seed.keywords,
    notes: applyCommunityPack ? seed.notes : raw.notes?.length ? raw.notes : seed.notes,
    products: raw.products?.length ? raw.products : seed.products,
    orders: raw.orders || [],
    members: (raw.members || []).map((m) => ({
      ...m,
      purchasedProductIds: m.purchasedProductIds || [],
      addedGroupIds: m.addedGroupIds || [],
      warns: m.warns ?? 0,
      banned: m.banned ?? false,
    })),
    managedGroups: applyCommunityPack
      ? (() => {
          const existing = raw.managedGroups || [];
          const has = existing.some(
            (g) => g.username === "basictrick" || g.inviteLink === "https://t.me/basictrick" || g.chatId === "@basictrick",
          );
          if (has) return existing;
          return [
            {
              chatId: "@basictrick",
              title: "Basictrick Free / AI Community",
              type: "supergroup",
              username: "basictrick",
              inviteLink: "https://t.me/basictrick",
              isActive: true,
              pending: false,
              createdAt: new Date().toISOString(),
            },
            ...existing,
          ];
        })()
      : raw.managedGroups || [],
    posts: raw.posts || [],
    logs: raw.logs?.length ? raw.logs : seed.logs,
  };
}

function pickCommunitySecurity(raw?: Partial<TgSecurityConfig>): Partial<TgSecurityConfig> {
  const d = defaultSecurity();
  return {
    blockLinks: true,
    blockForwards: true,
    blockInvitelinks: true,
    allowlistedDomains: d.allowlistedDomains,
    welcomeEnabled: true,
    welcomeMessageBn: d.welcomeMessageBn,
    welcomeMessageEn: d.welcomeMessageEn,
    goodbyeEnabled: true,
    goodbyeMessage: d.goodbyeMessage,
    rulesText: d.rulesText,
    // keep operator-tuned values from disk when present
    logChannelId: raw?.logChannelId ?? d.logChannelId,
    floodMaxMessages: raw?.floodMaxMessages ?? d.floodMaxMessages,
    maxWarns: raw?.maxWarns ?? d.maxWarns,
  };
}
