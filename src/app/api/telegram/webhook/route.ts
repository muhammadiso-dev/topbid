import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifyAdmin } from "@/lib/ustar/telegram";

export const dynamic = "force-dynamic";

/**
 * POST /api/telegram/webhook — Telegram bot webhook.
 *
 * SOZLASH (bir marta):
 *   1. @BotFather'da bot yarating → token oling
 *   2. .env ga qo'shing: TELEGRAM_BOT_TOKEN=...
 *   3. Botni webhook'ga ulang (bir marta brauzerda oching):
 *      https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://topbid.uz/api/telegram/webhook
 *
 * QO'LLANADI:
 *   /start       — salomlashish + menyular
 *   /stat        — umumiy statistika (daromad, xayriya, profillar)
 *   /help        — yordam
 *   To'lov xabarlari — admin guruhga yo'naltiriladi
 */
export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;

    // Webhook maxfiy kaliti bilan tekshirish (xavfsizlik)
    const secret = req.headers.get("x-telegram-bot-api-secret-token");
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json({ ok: true }); // jim o'tkazib yuborish
    }

    const msg = update?.message;
    if (!msg || !token) return NextResponse.json({ ok: true });

    const chatId = msg.chat?.id;
    const text = String(msg.text || "").trim();

    const send = (text: string) =>
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      }).catch(() => null);

    if (text === "/start") {
      await send(
        "👋 <b>TopBid Bot</b>ga xush kelibsiz!\n\n" +
          " Reyting: https://topbid.uz\n Profilingizni qo'shing: https://topbid.uz\n\n" +
          "/stat — umumiy statistika\n/help — yordam"
      );
    } else if (text === "/stat") {
      const [bidAgg, verAgg, count] = await Promise.all([
        db.bid.aggregate({ where: { status: "paid" }, _sum: { amount: true } }),
        db.verificationRequest.aggregate({ where: { status: "approved" }, _sum: { fee: true } }),
        db.profile.count(),
      ]);
      const bids = bidAgg._sum.amount ?? 0;
      const ver = verAgg._sum.fee ?? 0;
      const charity = Math.floor((bids * 0.1 + ver * 0.5) / 500) * 500;
      await send(
        `📊 <b>TopBid statistikasi</b>\n\n` +
          `Profillar: <b>${count}</b>\n` +
          `To'lovlar: <b>${bids.toLocaleString("ru-RU")} so'm</b>\n` +
          `Verifikatsiyalar: <b>${ver.toLocaleString("ru-RU")} so'm</b>\n` +
          `Xayriya fondida: <b>${charity.toLocaleString("ru-RU")} so'm</b> ❤️`
      );
    } else if (text === "/help") {
      await send(
        "ℹ️ <b>Yordam</b>\n\n" +
          "Reytingga profil qo'shish: topbid.uz → «O'rin olish»\n" +
          "To'lov: karta (Humo/Uzcard) yoki bot orqali\n" +
          "Verifikatsiya: profilingiz sahifasidan\n\n" +
          "Savollar: @TopBidSupport"
      );
    } else if (text) {
      // Boshqa xabarlar — admin guruhga yo'naltirish
      await notifyAdmin(
        "info",
        `📩 Bot xabari (${msg.from?.username || msg.chat?.id}):\n${text.slice(0, 500)}`
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Telegram webhook xatosi:", e);
    return NextResponse.json({ ok: true }); // Telegram retry qilmasligi uchun har doim 200
  }
}
