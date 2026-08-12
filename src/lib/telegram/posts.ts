import { tgApi } from "./moderation";
import { getTelegramData, pushTgLog, updateTelegramData } from "./store";
import type { TgGroupPost } from "./types";
import { newId } from "../utils";

export async function broadcastGroupPost(postId: string) {
  const data = await getTelegramData();
  const token = data.config.botToken;
  if (!token) throw new Error("Bot token required");
  const post = data.posts.find((p) => p.id === postId);
  if (!post) throw new Error("Post not found");

  const targets =
    post.target === "all"
      ? data.managedGroups.filter((g) => g.isActive).map((g) => g.chatId)
      : post.selectedChatIds;

  let sent = 0;
  for (const chatId of targets) {
    try {
      await tgApi(token, "sendMessage", {
        chat_id: chatId,
        text: `📢 *${post.title}*\n\n${post.body}`,
        parse_mode: "Markdown",
        reply_markup:
          post.buttonUrl && post.buttonText
            ? {
                inline_keyboard: [[{ text: post.buttonText, url: post.buttonUrl }]],
              }
            : undefined,
      });
      sent += 1;
      await updateTelegramData((d) => {
        const g = d.managedGroups.find((x) => x.chatId === chatId);
        if (g) g.lastPostAt = new Date().toISOString();
        return d;
      });
    } catch {
      await pushTgLog("warn", `Post failed to ${chatId}`);
    }
  }

  await updateTelegramData((d) => {
    const p = d.posts.find((x) => x.id === postId);
    if (p) {
      p.status = sent > 0 ? "sent" : "failed";
      p.sentAt = new Date().toISOString();
      p.sentCount = sent;
    }
    return d;
  });
  await pushTgLog("info", `Broadcast ${postId} → ${sent} groups`);
  return { sent, total: targets.length };
}

export async function createDraftPost(input: {
  title: string;
  body: string;
  buttonText?: string;
  buttonUrl?: string;
  target: "all" | "selected";
  selectedChatIds: string[];
}): Promise<TgGroupPost> {
  const post: TgGroupPost = {
    id: newId("post"),
    title: input.title,
    body: input.body,
    buttonText: input.buttonText,
    buttonUrl: input.buttonUrl,
    target: input.target,
    selectedChatIds: input.selectedChatIds,
    status: "draft",
    sentCount: 0,
    createdAt: new Date().toISOString(),
  };
  await updateTelegramData((d) => {
    d.posts.unshift(post);
    return d;
  });
  return post;
}
