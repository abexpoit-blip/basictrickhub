import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { createTelegramSeed, migrateTelegramData, type TelegramBotData } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const TG_PATH = path.join(DATA_DIR, "telegram-bot.json");

async function ensure(): Promise<TelegramBotData> {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await access(TG_PATH);
    const raw = await readFile(TG_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<TelegramBotData>;
    const migrated = migrateTelegramData(parsed);
    // persist migration once if notes/locks missing
    if (
      !parsed.notes ||
      !parsed.security?.locks ||
      !parsed.security?.floodMode ||
      !parsed.booster ||
      !parsed.ai ||
      !parsed.premium
    ) {
      await writeFile(TG_PATH, JSON.stringify(migrated, null, 2), "utf8");
    }
    return migrated;
  } catch {
    const seed = createTelegramSeed();
    await writeFile(TG_PATH, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
}

async function save(data: TelegramBotData) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(TG_PATH, JSON.stringify(data, null, 2), "utf8");
}

export async function getTelegramData() {
  return ensure();
}

export async function updateTelegramData(
  updater: (d: TelegramBotData) => TelegramBotData | Promise<TelegramBotData>,
) {
  const cur = await ensure();
  const next = await updater(structuredClone(cur));
  next.logs = next.logs.slice(-200);
  next.members = next.members.slice(-2000);
  next.orders = next.orders.slice(0, 500);
  await save(next);
  return next;
}

export async function pushTgLog(level: string, message: string) {
  return updateTelegramData((d) => {
    d.logs.push({
      id: `log-${Date.now()}`,
      at: new Date().toISOString(),
      level,
      message,
    });
    return d;
  });
}
