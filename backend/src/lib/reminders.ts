import { prisma } from "./prisma";
import { sendMedicationReminder } from "../bot";

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

async function checkReminders() {
  const now = new Date();
  const due = await prisma.medication.findMany({
    where: { reminderEnabled: true, nextReminderAt: { lte: now } },
    include: { dogProfile: { include: { user: true } } },
  });

  for (const med of due) {
    if (!med.frequencyHours || !med.nextReminderAt) continue;

    try {
      await sendMedicationReminder(
        med.dogProfile.user.telegramId,
        med.dogProfile.name,
        med.name,
        med.dosageAmount,
        med.dosageUnit,
      );
    } catch (err) {
      console.error("[reminders] не удалось отправить напоминание:", err);
    }

    const next = new Date(med.nextReminderAt.getTime() + med.frequencyHours * 60 * 60 * 1000);
    await prisma.medication.update({ where: { id: med.id }, data: { nextReminderAt: next } });
  }
}

export function startMedicationReminders() {
  checkReminders().catch((err) => console.error("[reminders] ошибка проверки:", err));
  setInterval(() => {
    checkReminders().catch((err) => console.error("[reminders] ошибка проверки:", err));
  }, CHECK_INTERVAL_MS);
}
