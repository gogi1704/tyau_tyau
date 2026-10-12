import { Bot, InlineKeyboard } from "grammy";

const BOT_TOKEN = process.env.BOT_TOKEN;
const MINI_APP_URL = process.env.MINI_APP_URL ?? "http://localhost:5173";

export const bot = BOT_TOKEN ? new Bot(BOT_TOKEN) : null;

export function startBot() {
  if (!bot) {
    console.log("[bot] BOT_TOKEN не задан — бот отключён, работаем только через API/браузер.");
    return;
  }

  bot.command("start", async (ctx) => {
    const keyboard = new InlineKeyboard().webApp("🐾 Открыть Tyau-Tyau", MINI_APP_URL);
    await ctx.reply(
      "Привет! Tyau-Tyau — приложение для собачников Ростова: смотри, кто гуляет рядом, находи компанию для прогулок или пару для вязки, ходи на встречи.",
      { reply_markup: keyboard },
    );
  });

  bot.catch((err) => {
    console.error("[bot] ошибка:", err.message);
  });

  bot.start();
  console.log("[bot] запущен (long polling)");
}

export async function sendMatchNotification(telegramId: string, dogName: string, otherDogName: string) {
  if (!bot) return;
  try {
    const keyboard = new InlineKeyboard().webApp("Перейти в приложение", `${MINI_APP_URL}`);
    await bot.api.sendMessage(
      telegramId,
      `🎉 У вас совпадение! ${dogName} и ${otherDogName} понравились друг другу. Пора на прогулку!`,
      { reply_markup: keyboard },
    );
  } catch (err) {
    console.error("[bot] не удалось отправить уведомление о мэтче:", err);
  }
}
