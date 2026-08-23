import { db } from "@/lib/db";

/**
 * Admin uchun bildirishnoma yuborish.
 *
 * Real integratsiya: .env faylida TELEGRAM_BOT_TOKEN va TELEGRAM_ADMIN_CHAT_ID
 * bo'lsa, xabar Telegram guruhga ham yuboriladi. Aks holda xabar AdminLog
 * jurnaliga yoziladi va admin panelida ko'rinadi (simulyatsiya rejimi).
 */
export async function notifyAdmin(
  type: string,
  message: string,
  profileId?: string
): Promise<void> {
  // 1) Har doim jurnalga yozamiz (admin panelda ko'rinadi)
  try {
    await db.adminLog.create({
      data: { type, message, profileId: profileId ?? null },
    });
  } catch (e) {
    console.error("AdminLog yozishda xato:", e);
  }

  // 2) Agar real Telegram bot sozlangan bo'lsa — guruhga yuborish
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (token && chatId) {
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🔔 USTAR\n${message}`,
          parse_mode: "HTML",
        }),
      });
    } catch (e) {
      console.error("Telegram xabar yuborishda xato:", e);
    }
  }
}
