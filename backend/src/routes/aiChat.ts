import { Router } from "express";
import { prisma } from "../lib/prisma";
import { telegramAuth } from "../middleware/auth";
import { getOwnDogProfile } from "../lib/ownDog";
import { chatCompletion, openaiEnabled, type ChatRole } from "../lib/openai";
import type { DogProfile, Medication } from "@prisma/client";

const router = Router();
const HISTORY_LIMIT = 20;

function buildSystemPrompt(dog: DogProfile, medications: Medication[]): string {
  const lines = [
    "Ты — дружелюбный ИИ-консультант по уходу за собаками в приложении Tyau-Tyau.",
    "Отвечай на русском языке, кратко и по делу, проявляй заботу.",
    "Обязательно учитывай контекст питомца при ответе:",
    `Кличка: ${dog.name}`,
    `Порода: ${dog.breed}`,
    `Пол: ${dog.gender === "MALE" ? "мальчик" : "девочка"}`,
    `Возрастная группа: ${dog.ageGroup === "PUPPY" ? "щенок" : "взрослый"}`,
  ];
  if (dog.weightKg) lines.push(`Вес: ${dog.weightKg} кг`);
  if (dog.heightCm) lines.push(`Рост в холке: ${dog.heightCm} см`);
  if (dog.medicalNotes) lines.push(`Доп. заметки владельца: ${dog.medicalNotes}`);

  if (medications.length > 0) {
    lines.push("Текущие препараты:");
    for (const m of medications) {
      const unit = m.dosageUnit === "GRAMS" ? "г" : "таб.";
      const freq = m.frequencyHours ? `, каждые ${m.frequencyHours} ч` : "";
      lines.push(`- ${m.name}: ${m.dosageAmount} ${unit}${freq}`);
    }
  } else {
    lines.push("Препараты сейчас не принимает.");
  }

  lines.push(
    "Если вопрос касается серьёзных симптомов или требует точного диагноза — рекомендуй очно обратиться к ветеринару, не заменяй его.",
  );
  return lines.join("\n");
}

router.get("/", telegramAuth, async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  if (!dog) return res.status(400).json({ error: "no_profile" });

  const messages = await prisma.aiChatMessage.findMany({
    where: { dogProfileId: dog.id },
    orderBy: { createdAt: "asc" },
  });
  res.json({ messages, enabled: openaiEnabled });
});

router.post("/", telegramAuth, async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  if (!dog) return res.status(400).json({ error: "no_profile" });

  const { message } = req.body;
  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "invalid_message" });
  }
  if (!openaiEnabled) {
    return res.status(503).json({ error: "ai_disabled" });
  }

  await prisma.aiChatMessage.create({
    data: { dogProfileId: dog.id, role: "user", content: message.trim() },
  });

  const medications = await prisma.medication.findMany({
    where: { dogProfileId: dog.id },
    orderBy: { createdAt: "desc" },
  });

  const history = await prisma.aiChatMessage.findMany({
    where: { dogProfileId: dog.id },
    orderBy: { createdAt: "desc" },
    take: HISTORY_LIMIT,
  });
  history.reverse();

  const openaiMessages: { role: ChatRole; content: string }[] = [
    { role: "system", content: buildSystemPrompt(dog, medications) },
    ...history.map((h) => ({ role: h.role as ChatRole, content: h.content })),
  ];

  let reply: string;
  try {
    reply = await chatCompletion(openaiMessages);
  } catch (err) {
    console.error("[ai-chat] ошибка OpenAI:", err);
    return res.status(502).json({ error: "openai_failed" });
  }

  const saved = await prisma.aiChatMessage.create({
    data: { dogProfileId: dog.id, role: "assistant", content: reply },
  });

  res.json({ message: saved });
});

export default router;
