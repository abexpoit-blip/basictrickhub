export type CommandDoc = {
  command: string;
  category: "User" | "Store" | "AI" | "Booster" | "Admin" | "Security";
  descriptionBn: string;
  descriptionEn: string;
  exampleResponse: string;
  adminOnly?: boolean;
};

/** Telegram setMyCommands — normal users only (no admin cmds) */
export const TELEGRAM_USER_COMMANDS: { command: string; description: string }[] = [
  { command: "start", description: "Start / main menu" },
  { command: "help", description: "User help" },
  { command: "shop", description: "Store catalog" },
  { command: "vip", description: "VIP packs" },
  { command: "course", description: "Paid courses" },
  { command: "tools", description: "Tools links + packs" },
  { command: "method", description: "Method links" },
  { command: "shortner", description: "Shortner links" },
  { command: "card", description: "Card site links" },
  { command: "sites", description: "Site list links" },
  { command: "license", description: "FB Boost / Reset Tools license" },
  { command: "verify", description: "Verify @basictrick join" },
  { command: "boost", description: "Free / AI group invite" },
  { command: "aistatus", description: "AI unlock status" },
  { command: "forceaddstatus", description: "Your add count" },
  { command: "rules", description: "Group rules" },
  { command: "id", description: "Your Telegram ID" },
];

/** Extra commands shown only in admin private chat scopes */
export const TELEGRAM_ADMIN_COMMANDS: { command: string; description: string }[] = [
  { command: "admin", description: "Admin control panel" },
  { command: "forceadd", description: "Force-add on|off|N" },
  { command: "namewatch", description: "Name watch on|off" },
  { command: "locks", description: "Show locks" },
  { command: "setcommands", description: "Sync bot command menus" },
  { command: "resetlicense", description: "Clear FB Tools browser slots (admin)" },
];

/** @deprecated use TELEGRAM_USER_COMMANDS */
export const TELEGRAM_BOT_COMMANDS = TELEGRAM_USER_COMMANDS;

export const BOT_COMMAND_DOCS: CommandDoc[] = [
  {
    command: "/start",
    category: "User",
    descriptionBn: "বট চালু + মেইন মেনু",
    descriptionEn: "Start bot + main menu",
    exampleResponse: "🤖 Basictrick Omni + Security Assistant…",
  },
  {
    command: "/help",
    category: "User",
    descriptionBn: "সব কমান্ড হেল্প",
    descriptionEn: "Help menu",
    exampleResponse: "Command list + admin cmds if admin",
  },
  {
    command: "/id",
    category: "User",
    descriptionBn: "নিজের Telegram ID দেখায়",
    descriptionEn: "Shows your Telegram user + chat ID",
    exampleResponse: "🪪 Your Telegram ID: 123456",
  },
  {
    command: "/rules",
    category: "User",
    descriptionBn: "গ্রুপ রুলস",
    descriptionEn: "Group rules",
    exampleResponse: "1) No spam…",
  },
  {
    command: "/shop · /vip · /course · /tools",
    category: "Store",
    descriptionBn: "স্টোর / VIP / কোর্স / টুলস",
    descriptionEn: "Store / VIP / Course / Tools",
    exampleResponse: "🛍️ Catalog + pay buttons",
  },
  {
    command: "/method · /shortner · /card · /sites",
    category: "Store",
    descriptionBn: "লিংক বাটন ক্যাটাগরি (Admin থেকে URL)",
    descriptionEn: "Link button categories (URLs from Admin)",
    exampleResponse: "📘 Methods + Open website buttons",
  },
  {
    command: "/license",
    category: "Booster",
    descriptionBn: "FB Boost / Reset Tools লাইসেন্স — গ্রুপ ভেরিফাই করে ১ কি, ১০ ব্রাউজার",
    descriptionEn: "FB Boost / Reset license after group verify. 1 key, 10 browsers",
    exampleResponse: "🔑 BT-XXXX · 7 days · 10 browsers",
  },
  {
    command: "/boost",
    category: "Booster",
    descriptionBn: "ফ্রি গ্রুপ ইনভাইট",
    descriptionEn: "Free group invite",
    exampleResponse: "🚀 Join Free Group",
  },
  {
    command: "/forceaddstatus",
    category: "Booster",
    descriptionBn: "কতজন অ্যাড করেছেন দেখায়",
    descriptionEn: "Shows how many members you added",
    exampleResponse: "Added: 2/5",
  },
  {
    command: "/forceadd on|off|5",
    category: "Booster",
    descriptionBn: "টেক্সট আগে N জন অ্যাড করতে বাধ্য (Admin)",
    descriptionEn: "Require add N members before text (Admin)",
    exampleResponse: "Force-add required set to 5",
    adminOnly: true,
  },
  {
    command: "/aistatus",
    category: "AI",
    descriptionBn: "AI আনলক স্ট্যাটাস",
    descriptionEn: "AI unlock status",
    exampleResponse: "Free group: ✅",
  },
  {
    command: "facebook id / vpn (keyword)",
    category: "AI",
    descriptionBn: "কীওয়ার্ড → btidsellerbot",
    descriptionEn: "Keyword → seller bot",
    exampleResponse: "🔥 Official seller…",
  },
  {
    command: "/namewatch on|off",
    category: "Security",
    descriptionBn: "নাম/ইউজারনেম চেঞ্জ অ্যালার্ট (Songmata)",
    descriptionEn: "Name/username change alerts",
    exampleResponse: "Name/username watch ON",
    adminOnly: true,
  },
  {
    command: "/ban /mute /warn /lock…",
    category: "Security",
    descriptionBn: "Basictrick Security Assistant মডারেশন",
    descriptionEn: "Security Assistant moderation",
    exampleResponse: "✅ /mute applied…",
    adminOnly: true,
  },
  {
    command: "/resetlicense <id>",
    category: "Admin",
    descriptionBn: "FB Tools ব্রাউজার স্লট ক্লিয়ার (Admin)",
    descriptionEn: "Clear FB Tools browser slots (Admin)",
    exampleResponse: "Device unbound for 123…",
    adminOnly: true,
  },
  {
    command: "/admin",
    category: "Admin",
    descriptionBn: "Admin প্যানেল (শুধু admin ID)",
    descriptionEn: "Admin panel (admin IDs only)",
    exampleResponse: "⚙️ Admin Panel — moderation + security cmds",
    adminOnly: true,
  },
  {
    command: "/setcommands",
    category: "Admin",
    descriptionBn: "বট মেনু কমান্ড সিঙ্ক",
    descriptionEn: "Sync bot command menu",
    exampleResponse: "Users → user cmds · Admins → + admin cmds",
    adminOnly: true,
  },
  {
    command: "/report",
    category: "User",
    descriptionBn: "মেসেজে রিপ্লাই করে রিপোর্ট",
    descriptionEn: "Report by replying to a message",
    exampleResponse: "🚨 Report filed…",
  },
];
