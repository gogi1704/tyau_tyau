import crypto from "crypto";
import { NextFunction, Request, Response } from "express";

export interface TelegramUser {
  id: string;
  username?: string;
  firstName?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      telegramUser?: TelegramUser;
    }
  }
}

const DEV_USER: TelegramUser = {
  id: "0",
  username: "dev_user",
  firstName: "Тестовый хозяин",
};

function verifyInitData(initData: string, botToken: string): TelegramUser | null {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  if (computedHash !== hash) return null;

  const userRaw = params.get("user");
  if (!userRaw) return null;
  const user = JSON.parse(userRaw);
  return {
    id: String(user.id),
    username: user.username,
    firstName: user.first_name,
  };
}

export function telegramAuth(req: Request, res: Response, next: NextFunction) {
  const initData = req.header("X-Telegram-Init-Data");
  const botToken = process.env.BOT_TOKEN;

  if (initData && botToken) {
    const user = verifyInitData(initData, botToken);
    if (!user) {
      return res.status(401).json({ error: "invalid_init_data" });
    }
    req.telegramUser = user;
    return next();
  }

  if (process.env.NODE_ENV !== "production") {
    req.telegramUser = DEV_USER;
    return next();
  }

  return res.status(401).json({ error: "missing_init_data" });
}
