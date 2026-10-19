import { Router } from "express";
import { prisma } from "../lib/prisma";
import { telegramAuth } from "../middleware/auth";
import { getOwnDogProfile } from "../lib/ownDog";

const router = Router();
const REMINDER_OFFSET_MS = 60 * 60 * 1000;

function computeNextReminderAt(startAt: Date, frequencyHours: number): Date {
  const stepMs = frequencyHours * 60 * 60 * 1000;
  let next = new Date(startAt.getTime() - REMINDER_OFFSET_MS);
  const now = new Date();
  while (next.getTime() <= now.getTime()) {
    next = new Date(next.getTime() + stepMs);
  }
  return next;
}

router.get("/", telegramAuth, async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  if (!dog) return res.status(400).json({ error: "no_profile" });

  const medications = await prisma.medication.findMany({
    where: { dogProfileId: dog.id },
    orderBy: { createdAt: "desc" },
  });
  res.json({ medications });
});

router.post("/", telegramAuth, async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  if (!dog) return res.status(400).json({ error: "no_profile" });

  const { name, dosageAmount, dosageUnit, frequencyHours, startAt, reminderEnabled } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "invalid_name" });
  }
  if (typeof dosageAmount !== "number" || !(dosageAmount > 0)) {
    return res.status(400).json({ error: "invalid_dosage" });
  }
  if (dosageUnit !== "GRAMS" && dosageUnit !== "TABLETS") {
    return res.status(400).json({ error: "invalid_unit" });
  }

  const freq =
    typeof frequencyHours === "number" && frequencyHours > 0 ? Math.round(frequencyHours) : null;
  const start = freq && typeof startAt === "string" && startAt ? new Date(startAt) : null;
  const reminder = Boolean(reminderEnabled) && Boolean(freq) && Boolean(start);

  const medication = await prisma.medication.create({
    data: {
      dogProfileId: dog.id,
      name: name.trim(),
      dosageAmount,
      dosageUnit,
      frequencyHours: freq,
      startAt: start,
      reminderEnabled: reminder,
      nextReminderAt: reminder && start && freq ? computeNextReminderAt(start, freq) : null,
    },
  });

  res.json({ medication });
});

router.delete("/:id", telegramAuth, async (req, res) => {
  const dog = await getOwnDogProfile(req.telegramUser!.id);
  if (!dog) return res.status(400).json({ error: "no_profile" });

  await prisma.medication.deleteMany({ where: { id: req.params.id, dogProfileId: dog.id } });
  res.json({ ok: true });
});

export default router;
