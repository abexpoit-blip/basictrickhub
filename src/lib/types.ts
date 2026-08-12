export type Lang = "en" | "bn";

export type ToolType = "download" | "bookmark" | "online" | "generator";

export interface ToolCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  isPublished: boolean;
  /** accent used in premium sidebar: sky | cyan | indigo | amber | rose | emerald */
  accent?: string;
}

export interface CommunityTool {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  releaseNotes: string;
  version: string;
  toolType: ToolType;
  downloadUrl?: string;
  downloadPath?: string;
  bookmarkCode?: string;
  onlineRoute?: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceLabel: string;
  imageUrl?: string;
  telegramUrl?: string;
  isPublished: boolean;
  sortOrder: number;
}

export interface MethodGuide {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  /** Show as NEW METHOD DROP badge */
  isNewDrop?: boolean;
  /** Tag chip e.g. Autopay / Boost / Threshold */
  tag?: string;
  /** Difficulty: Beginner | Pro | Advanced */
  level?: string;
  /** When posted to Telegram group */
  telegramPostedAt?: string;
  /** Accent color key */
  accent?: string;
}

export interface SiteSettings {
  siteName: string;
  telegramUrl: string;
  telegramSupport: string;
  tagline: string;
  contactEmail: string;
  /** Bot token for auto method-drop posts */
  telegramBotToken?: string;
  /** Group/channel chat id for auto posts */
  telegramChatId?: string;
  sitePublicUrl?: string;
}

export interface AccessKey {
  id: string;
  key: string;
  label: string;
  telegramUserId?: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface StoreData {
  categories: ToolCategory[];
  tools: CommunityTool[];
  products: Product[];
  methods: MethodGuide[];
  settings: SiteSettings;
  accessKeys: AccessKey[];
}
