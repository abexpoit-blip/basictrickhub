export type CommandDoc = {
  command: string;
  category: "User" | "Store" | "AI" | "Booster" | "Admin" | "Rose";
  descriptionBn: string;
  descriptionEn: string;
  exampleResponse: string;
  adminOnly?: boolean;
};

export const BOT_COMMAND_DOCS: CommandDoc[] = [
  {
    command: "/start",
    category: "User",
    descriptionBn: "বট চালু + মেইন মেনু",
    descriptionEn: "Start bot + main menu",
    exampleResponse: "🤖 Basictrick AI + Rose… Shop / VIP buttons",
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
    command: "/shop",
    category: "Store",
    descriptionBn: "স্টোর ক্যাটালগ + পেমেন্ট বাটন",
    descriptionEn: "Store catalog + pay buttons",
    exampleResponse: "🛍️ Basictrick Store + ZiniPay/Plisio",
  },
  {
    command: "/vip",
    category: "Store",
    descriptionBn: "শুধু VIP প্যাক",
    descriptionEn: "VIP products only",
    exampleResponse: "VIP 30 days…",
  },
  {
    command: "/course",
    category: "Store",
    descriptionBn: "পেইড কোর্স",
    descriptionEn: "Paid courses",
    exampleResponse: "Autopay Threshold Course…",
  },
  {
    command: "/tools",
    category: "Store",
    descriptionBn: "টুলস প্যাক",
    descriptionEn: "Tools packs",
    exampleResponse: "Premium Tools Pack…",
  },
  {
    command: "/boost",
    category: "Booster",
    descriptionBn: "ফ্রি গ্রুপ ইনভাইট পাঠায় (Group Booster)",
    descriptionEn: "Sends free group invite (booster)",
    exampleResponse: "🚀 Join Free Group button",
  },
  {
    command: "/aistatus",
    category: "AI",
    descriptionBn: "Premium AI আনলক স্ট্যাটাস",
    descriptionEn: "Premium AI unlock status",
    exampleResponse: "Groups added: 1/1 · Free group: ✅",
  },
  {
    command: "/get <note>",
    category: "User",
    descriptionBn: "সেভ করা নোট দেখায়",
    descriptionEn: "Show saved note",
    exampleResponse: "Note content…",
  },
  {
    command: "#shop / #rules",
    category: "User",
    descriptionBn: "নোট শর্টকাট",
    descriptionEn: "Note shortcut",
    exampleResponse: "Saved note text",
  },
  {
    command: "facebook id (keyword)",
    category: "AI",
    descriptionBn: "কীওয়ার্ড ডিটেক্ট → সেল বট সাজেস্ট",
    descriptionEn: "Keyword → official sell bot",
    exampleResponse: "🔥 Buy from official sell bot…",
  },
  {
    command: "hi / দাম / কিনব (AI intent)",
    category: "AI",
    descriptionBn: "স্মার্ট ইনটেন্ট বুঝে রিপ্লাই",
    descriptionEn: "Smart intent reply",
    exampleResponse: "Hey! I'm Basictrick Omni…",
  },
  {
    command: "/ban /mute /warn /kick…",
    category: "Rose",
    descriptionBn: "মডারেশন (Admin ID লাগবে)",
    descriptionEn: "Moderation (admin IDs only)",
    exampleResponse: "✅ /mute applied…",
    adminOnly: true,
  },
  {
    command: "/lock url · /locks · /flood",
    category: "Rose",
    descriptionBn: "লক ও ফ্লাড সেটিংস",
    descriptionEn: "Locks & flood settings",
    exampleResponse: "🔒 Locked: url",
    adminOnly: true,
  },
  {
    command: "/post (admin broadcast hint)",
    category: "Admin",
    descriptionBn: "গ্রুপ পোস্ট ওয়েব Admin → Posts থেকে",
    descriptionEn: "Group posts from web Admin → Posts",
    exampleResponse: "📢 Campaign sent to N groups",
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
