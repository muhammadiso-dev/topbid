import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifyAdmin } from "@/lib/ustar/telegram";
import { matchPayment } from "@/lib/ustar/payment-match";

export const dynamic = "force-dynamic";

/**
 * POST /api/telegram/webhook — TopBid bot webhook (o'z botimiz — StarKerak KERAK EMAS).
 *
 * SOZLASH (bir marta):
 *   1. .env: TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID
 *   2. Brauzerda ochish:
 *      https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://topbid.uz/api/telegram/webhook
 *   3. BotFather → /setprivacy → @TopBiduzbot → Disable
 *      (guruhdagi BARCHA xabarlarni o'qishi uchun — HumoCardBot xabarlari ham)
 *   4. Telegram'da guruh yaratish → guruhga HumoCardBot va @TopBiduzbot'ni qo'shish
 *   5. Endi kartaga tushgan har bir pul: HumoCardBot guruhga yozadi →
 *      bizning bot o'qiydi → avtomatik profil aktiv/o'rin yangilanadi!
 *
 * BUYRUVLAR (shaxsiy chatda):
 *   /start — salomlashish, /stat — statistika, /help — yordam
 * GURUH: to'lov xabarlari avtomatik o'qiladi va match qilinadi.
 */
export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;

    const secret = req.headers.get("x-telegram-bot-api-secret-token");
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json({ ok: true });
    }

    const msg = update?.message;
    if (!msg || !token) return NextResponse.json({ ok: true });

    const chatId = msg.chat?.id;
    const text = String(msg.text || "");
    const fromBot = String(msg.from?.username || "").toLowerCase();

    const send = (t: string) =>
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: t, parse_mode: "HTML" }),
      }).catch(() => null);

    // ===== GURUHDAGI TO'LOV XABARLARI (HumoCardBot va boshqa karta botlari) =====
    // Har qanday guruhda "summa + so'm/сум/UZS" shaklidagi xabar to'lov sifatida o'qiladi.
    if (msg.chat?.type === "group" || msg.chat?.type === "supergroup") {
      // Faqat botlardan (HumoCardBot kabi) yoki forward qilingan to'lov xabarlari
      const looksLikePayment =
        msg.from?.is_bot ||
        (msg.forward_from && /humo|card|uzcard|bank/i.test(String(msg.forward_from.username || "")));
      const payment = parsePaymentMessage(text);
      if (looksLikePayment && payment) {
        const result = await matchPayment({
          amount: payment.amount,
          cardLast4: payment.cardLast4,
          externalId: `tg-${msg.message_id}-${chatId}`,
          raw: text,
        });
        if (result.matched && result.profileName !== "(dubl — o'tkazib yuborildi)") {
          await send(
            result.kind === "verification"
              ? `✅ <b>Verifikatsiya to'lovi qabul qilindi</b>\n👤 ${result.profileName}\n\nHujjatlar so'raladi — admin panel.`
              : `✅ <b>To'lov tasdiqlandi</b>\n👤 ${result.profileName}\n📍 ${result.position}-o'rin\n\nReyting avtomatik yangilandi.`
          );
        }
        return NextResponse.json({ ok: true });
      }
      // To'lovga o'xshamagan guruh xabarlari — javob bermaymiz (shovqin bo'lmasin)
      return NextResponse.json({ ok: true });
    }

    // ===== SHAXSIY CHAT BUYRUVLARI =====
    const trimmed = text.trim();
    if (trimmed === "/start") {
      await send(
        "👋 <b>TopBid Bot</b>ga xush kelibsiz!\n\n" +
          "🌐 Reyting: https://topbid.uz\n➕ Profil qo'shish: https://topbid.uz\n\n" +
          "<b>To'lovlarni avtomatik qabul qilish uchun:</b>\n" +
          "1. Guruh yarating\n2. Guruhga <b>HumoCardBot</b> va shu botni qo'shing\n" +
          "3. Karta hisoboti guruhga tushadi → to'lovlar avtomatik hisoblanadi\n\n" +
          "/stat — statistika\n/help — yordam"
      );
    } else if (trimmed === "/stat") {
      const [bidAgg, verAgg, count] = await Promise.all([
        db.bid.aggregate({ where: { status: "paid" }, _sum: { amount: true } }),
        db.verificationRequest.aggregate({ where: { status: "approved" }, _sum: { fee: true } }),
        db.profile.count({ where: { status: "active" } }),
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
    } else if (trimmed === "/help") {
      await send(
        "ℹ️ <b>Yordam</b>\n\n" +
          "Reytingga profil qo'shish: topbid.uz → «O'rin olish»\n" +
          "To'lov: Humo karta (topbid.uz'da ko'rsatilgan)\n" +
          "Verifikatsiya: profilingiz sahifasidan\n\n" +
          "<b>Avtomatik to'lov:</b> guruhga HumoCardBot + shu botni qo'shing\n\n" +
          "Savollar: @TopBidSupport"
      );
    } else if (trimmed) {
      // Shaxsiy chatdagi to'lov skrinshot/forward — parse qilib ko'ramiz
      const payment = parsePaymentMessage(trimmed);
      if (payment && msg.from?.id && String(msg.from.id) === process.env.TELEGRAM_ADMIN_CHAT_ID) {
        const result = await matchPayment({
          amount: payment.amount,
          cardLast4: payment.cardLast4,
          externalId: `tg-pm-${msg.message_id}`,
          raw: trimmed,
        });
        await send(
          result.matched
            ? `✅ To'lov match qilindi: ${result.profileName}${result.position ? ` (${result.position}-o'rin)` : ""}`
            : "⚠️ To'lov mos kelmadi — kutilayotgan to'lov topilmadi."
        );
      } else {
        await notifyAdmin(
          "info",
          `📩 Bot xabari (${msg.from?.username || chatId}):\n${trimmed.slice(0, 500)}`
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Telegram webhook xatosi:", e);
    return NextResponse.json({ ok: true });
  }
}

/**
 * To'lov xabarini o'qish — HumoCardBot/Karta botlari formatlari (moslashuvchan):
 * "15 000 so'm", "15000 сум", "+15 000.00 UZS", "Summa: 15 000 so'm" va h.k.
 * Kartaning oxirgi 4 raqami: "9860****3608", "*3608", "karta: 3608" va h.k.
 */
function parsePaymentMessage(text: string): { amount: number; cardLast4?: string } | null {
  // Karta oxiri
  let cardLast4: string | undefined;
  const cardMatch =
    text.match(/\*{2,}\s*(\d{4})/) ||
    text.match(/(\d{4})\s*\*{2,}/) ||
    text.match(/(?:karta|card|хисоб)\D{0,10}(\d{4})\b/i);
  if (cardMatch) cardLast4 = cardMatch[1];

  // Summa: "15 000 so'm" / "15 000,00 UZS" / "+15 000.00" / "15000 сум"
  const amountMatch =
    text.match(/[+≈]?\s*((?:\d{1,3}[ \u00a0.])+\d{3})(?:[.,]\d{2})?\s*(?:so['’]?m|сум|uzs|UZS)/i) ||
    text.match(/[+≈]?\s*(\d{5,7})(?:[.,]\d{2})?\s*(?:so['’]?m|сум|uzs|UZS)/i) ||
    text.match(/(?:summa|сумма|amount)\D{0,5}((?:\d{1,3}[ \u00a0.])+\d{3})/i);

  if (!amountMatch) return null;

  // "15 000" / "15.000" / "15 000.00" → 15000
  const raw = amountMatch[1].replace(/[ \u00a0.]/g, "");
  const amount = parseInt(raw, 10);
  if (!amount || amount < 1000 || amount > 100_000_000) return null;

  return { amount, cardLast4 };
}
