import { Bot, InlineKeyboard } from "grammy";

const BOT_TOKEN = process.env.BOT_TOKEN;
const MINI_APP_URL = process.env.MINI_APP_URL ?? "http://localhost:5173";

export const bot = BOT_TOKEN ? new Bot(BOT_TOKEN) : null;

const WELCOME_TEXT =
  "Привет! 🐾 Tyau-Tyau — приложение для собачников Ростова: смотри, кто гуляет рядом, находи компанию для прогулок или пару для вязки, ходи на встречи, читай ленту друзей и групп.";

const HELP_TEXT =
  "Что умеет Tyau-Tyau:\n\n" +
  "🐕 Анкета питомца — ваша «визитка» в приложении\n" +
  "🗺 Карта — кто гуляет рядом прямо сейчас\n" +
  "🔥 Поиск — находите компанию для прогулок или пару\n" +
  "📅 Встречи — локальная афиша сборов собачников\n" +
  "👥 Группы и лента — подписывайтесь, публикуйте посты\n\n" +
  "Откройте приложение кнопкой ниже или через меню рядом со строкой ввода.";

function openAppKeyboard(label = "🐾 Открыть Tyau-Tyau") {
  return new InlineKeyboard().webApp(label, MINI_APP_URL);
}

export function startBot() {
  if (!bot) {
    console.log("[bot] BOT_TOKEN не задан — бот отключён, работаем только через API/браузер.");
    return;
  }

  bot.command("start", async (ctx) => {
    await ctx.reply(WELCOME_TEXT, { reply_markup: openAppKeyboard() });
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(HELP_TEXT, { reply_markup: openAppKeyboard() });
  });

  bot.on("message:text", async (ctx) => {
    await ctx.reply("Я просто бот-проводник в приложение 🐾 Жмите кнопку, чтобы открыть Tyau-Tyau.", {
      reply_markup: openAppKeyboard(),
    });
  });

  bot.catch((err) => {
    console.error("[bot] ошибка:", err.message);
  });

  bot
    .api
    .setMyCommands([
      { command: "start", description: "Открыть Tyau-Tyau" },
      { command: "help", description: "Что умеет приложение" },
    ])
    .catch((err) => console.error("[bot] не удалось задать команды:", err));

  bot
    .api
    .setChatMenuButton({
      menu_button: { type: "web_app", text: "Открыть", web_app: { url: MINI_APP_URL } },
    })
    .catch((err) => console.error("[bot] не удалось задать кнопку меню:", err));

  bot.start();
  console.log("[bot] запущен (long polling)");
}

export async function sendMatchNotification(telegramId: string, dogName: string, otherDogName: string) {
  if (!bot) return;
  try {
    await bot.api.sendMessage(
      telegramId,
      `🎉 У вас совпадение! ${dogName} и ${otherDogName} понравились друг другу. Пора на прогулку!`,
      { reply_markup: openAppKeyboard("Перейти в приложение") },
    );
  } catch (err) {
    console.error("[bot] не удалось отправить уведомление о мэтче:", err);
  }
}
