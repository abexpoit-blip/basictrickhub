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
  addedByUserId?: string;
  isActive: boolean;
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
    locks: { ...DEFAULT_LOCKS },
    blockLinks: false,
    blockForwards: false,
    blockInvitelinks: true,
    allowlistedDomains: ["t.me", "basictrick.com", "localhost"],
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
      "স্বাগতম {name}! Basictrick কমিউনিটিতে। /shop দিয়ে টুলস কিনুন, /vip দিয়ে VIP নিন।\nরুলস: /rules\nসাপোর্ট: {support}",
    welcomeMessageEn:
      "Welcome {name}! Use /shop for tools, /vip for VIP.\nRules: /rules\nSupport: {support}",
    goodbyeEnabled: false,
    goodbyeMessage: "👋 {name} left the chat.",
    cleanService: true,
    rulesText:
      "1) No spam / flood\n2) No scam links\n3) Respect admins\n4) Buy only from official bots\n5) No NSFW",
    reportEnabled: true,
    logChannelId: "",
    nightMode: false,
    nightMuteAll: false,
  };
}

export function defaultBooster(): TgBoosterConfig {
  return {
    enabled: true,
    freeGroupId: "",
    freeGroupInvite: "https://t.me/+YOUR_FREE_GROUP",
    freeGroupTitle: "Basictrick Free Community",
    requireJoinFreeGroup: true,
    autoSendInviteOnStart: true,
    autoSendInviteOnJoin: true,
    boostMessageBn:
      "🚀 Group Booster\nআমাদের ফ্রি গ্রুপে জয়েন করুন — ডেইলি মেথড ও আপডেট পাবেন।\n\n👉 {invite}\nগ্রুপ: {group}",
    boostMessageEn:
      "🚀 Group Booster\nJoin our free community for daily drops.\n\n👉 {invite}\nGroup: {group}",
    targetDailyJoins: 100,
    invitesSent: 0,
    joinsTracked: 0,
  };
}

export function defaultPremium(): TgPremiumGate {
  return {
    enabled: true,
    minGroupsToUnlockAi: 1,
    requireFreeGroupJoin: true,
    premiumBadge: "✦ PREMIUM AI",
    lockedMessageBn:
      "✦ Premium AI লক করা\nAI বট ফুল পাওয়ার আনলক করতে:\n1️⃣ আমাদের ফ্রি গ্রুপে জয়েন করুন\n2️⃣ আপনার গ্রুপগুলোতে এই বট অ্যাড করুন (Admin)\n\nস্ট্যাটাস: /aistatus\nফ্রি গ্রুপ: {invite}",
    lockedMessageEn:
      "✦ Premium AI locked\nTo unlock full AI power:\n1) Join our free group\n2) Add this bot to your groups as Admin\n\nStatus: /aistatus\nFree group: {invite}",
    unlockedMessageBn: "✦ Premium AI আনলকড! এখন স্মার্ট রিপ্লাই চালু। কিছু জিজ্ঞাসা করুন।",
    unlockedMessageEn: "✦ Premium AI unlocked! Ask me anything about shop, VIP, IDs, methods.",
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
        patterns: ["support", "admin", "সাপোর্ট", "হেল্পলাইন", "contact"],
        replyBn: "সাপোর্ট: {support}\nঅফিসিয়াল সেল বট: @{salesBot}",
        replyEn: "Support: {support}\nOfficial sell bot: @{salesBot}",
        action: "support",
        isActive: true,
        priority: 14,
      },
    ],
  };
}

export function createTelegramSeed(): TelegramBotData {
  const now = new Date().toISOString();
  return {
    config: {
      botToken: "",
      botUsername: "BasictrickBot",
      webhookSecret: crypto.randomUUID().replace(/-/g, "").slice(0, 24),
      adminIds: [],
      salesBotUsername: "BasictrickSellBot",
      supportUrl: "https://t.me/basictrick",
      defaultLang: "bn",
      zinipayApiKey: "",
      plisioApiKey: "",
      sitePublicUrl: "http://localhost:8080",
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
        content: "Community rules: /rules — Buy only from official bots.",
        isActive: true,
      },
      {
        id: "note-shop",
        name: "shop",
        content: "Open store with /shop — VIP /course /tools available.",
        isActive: true,
      },
      {
        id: "note-support",
        name: "support",
        content: "Support: https://t.me/basictrick",
        isActive: true,
      },
    ],
    keywords: [
      {
        id: "kw-fb-id",
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
        ],
        title: "Facebook ID Sales",
        replyBn:
          "🔥 Facebook ID লাগবে?\nআমাদের অফিসিয়াল সেল বট থেকে কিনুন — সেফ ও ফাস্ট ডেলিভারি।\n\n👉 @{salesBot}\n\nঅথবা ওয়েব শপ: {site}/shop",
        replyEn:
          "🔥 Need Facebook IDs?\nBuy from our official sales bot — safe & fast delivery.\n\n👉 @{salesBot}\n\nOr web shop: {site}/shop",
        suggestBotUsername: "BasictrickSellBot",
        buttonText: "Open Official Sell Bot",
        buttonUrl: "",
        isActive: true,
        priority: 10,
      },
      {
        id: "kw-bm",
        keywords: ["business manager", "bm chai", "bm কিনব", "bm id", "বিএম"],
        title: "BM Tools",
        replyBn:
          "BM লাগলে আমাদের Tools ও Method দেখুন।\n/shop · /tools\nঅফিসিয়াল বট: @{salesBot}",
        replyEn:
          "Need BM? Check Tools & Methods.\n/shop · /tools\nOfficial bot: @{salesBot}",
        suggestBotUsername: "BasictrickSellBot",
        isActive: true,
        priority: 8,
      },
      {
        id: "kw-autopay",
        keywords: ["autopay", "threshold", "অটোপে", "থ্রেশহোল্ড", "method"],
        title: "Autopay Method",
        replyBn:
          "📘 Autopay Threshold মেথড পেতে /course বা /vip ব্যবহার করুন।\nওয়েব: {site}/method",
        replyEn:
          "📘 For Autopay Threshold methods use /course or /vip.\nWeb: {site}/method",
        isActive: true,
        priority: 7,
      },
      {
        id: "kw-vip",
        keywords: ["vip", "paid group", "প্রাইভেট গ্রুপ", "ভিআইপি"],
        title: "VIP Access",
        replyBn: "⭐ VIP এক্সেস নিতে /vip চাপুন। পেমেন্ট ZiniPay / Plisio সাপোর্টেড।",
        replyEn: "⭐ Get VIP with /vip. Payments via ZiniPay / Plisio.",
        isActive: true,
        priority: 9,
      },
    ],
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
  const sec = { ...defaultSecurity(), ...(raw.security || {}) };
  sec.locks = { ...DEFAULT_LOCKS, ...(raw.security?.locks || {}) };
  return {
    config: { ...seed.config, ...(raw.config || {}) },
    security: sec,
    booster: { ...defaultBooster(), ...(raw.booster || {}) },
    premium: { ...defaultPremium(), ...(raw.premium || {}) },
    ai: {
      ...defaultAiBrain(),
      ...(raw.ai || {}),
      intents: raw.ai?.intents?.length ? raw.ai.intents : seed.ai.intents,
    },
    keywords: raw.keywords?.length ? raw.keywords : seed.keywords,
    notes: raw.notes?.length ? raw.notes : seed.notes,
    products: raw.products?.length ? raw.products : seed.products,
    orders: raw.orders || [],
    members: (raw.members || []).map((m) => ({
      ...m,
      purchasedProductIds: m.purchasedProductIds || [],
      addedGroupIds: m.addedGroupIds || [],
      warns: m.warns ?? 0,
      banned: m.banned ?? false,
    })),
    managedGroups: raw.managedGroups || [],
    posts: raw.posts || [],
    logs: raw.logs?.length ? raw.logs : seed.logs,
  };
}
