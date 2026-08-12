export type CommandDoc = {
  command: string;
  category: "User" | "Store" | "AI" | "Booster" | "Admin" | "Security";
  descriptionBn: string;
  descriptionEn: string;
  exampleResponse: string;
  adminOnly?: boolean;
};

/** Telegram setMyCommands payload (max 100, description ≤ 256 chars) */
export const TELEGRAM_BOT_COMMANDS: { command: string; description: string }[] = [
  { command: "start", description: "Start / main menu" },
  { command: "help", description: "All commands help" },
  { command: "shop", description: "Store catalog" },
  { command: "vip", description: "VIP packs" },
  { command: "course", description: "Paid courses" },
  { command: "tools", description: "Tools links + packs" },
  { command: "method", description: "Method links" },
  { command: "shortner", description: "Shortner links" },
  { command: "card", description: "Card site links" },
  { command: "sites", description: "Site list links" },
  { command: "boost", description: "Free / AI group invite" },
  { command: "aistatus", description: "AI unlock status" },
  { command: "forceaddstatus", description: "Your force-add count" },
  { command: "rules", description: "Group rules" },
  { command: "id", description: "Your Telegram ID" },
];

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
    command: "/setcommands",
    category: "Admin",
    descriptionBn: "বট মেনু কমান্ড সিঙ্ক",
    descriptionEn: "Sync bot command menu",
    exampleResponse: "Bot command menu updated ✅",
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
