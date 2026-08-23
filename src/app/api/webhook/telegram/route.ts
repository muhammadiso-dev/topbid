import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { matchPayment } from "@/lib/ustar/payment-match";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const expected = process.env.INTERNAL_PAYMENT_SECRET || "topbid_internal_2026_x7k";
  if (secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const update = await req.json();

    // Telegram yuborgan xabarni aniqlaymiz (business_message yoki message)
    const msg = update.business_message || update.message;
    if (!msg || !msg.text) {
      return NextResponse.json({ ok: true });
    }

    const text = msg.text as string;

    // Admin panelda ko'rinishi uchun log qilib qo'yamiz
    await db.adminLog.create({
      data: {
        type: "info",
        message: `Telegram xabari kirdi: ${text.slice(0, 100)}...`,
      },
    });

    // Summani ajratib olish (masalan: "➕ 15.000,00 UZS" yoki "Kirim: 30 000 UZS")
    const amountMatch = text.match(/(?:➕|Kirim|Tushum|\+)\s*([0-9\.\, ]+)\s*(?:UZS|so'm)/i) || text.match(/([0-9\.\, ]+)\s*(?:UZS|so'm)/i);

    if (amountMatch && amountMatch[1]) {
      let amountStr = amountMatch[1].replace(/\s/g, ""); // "15.000,00"

      if (amountStr.includes(",")) {
        // O'zbekiston banklarida tiyin odatda vergul bilan ajratiladi
        amountStr = amountStr.split(",")[0];
      } else if (amountStr.includes(".")) {
        // Nuqta bilan ajratilgan tiyin bo'lsa
        const parts = amountStr.split(".");
        if (parts[parts.length - 1].length === 2) {
          amountStr = parts.slice(0, -1).join("");
        }
      }

      const amount = parseInt(amountStr.replace(/[^0-9]/g, ""), 10);
      
      if (amount && amount > 0) {
        // Kartaning oxirgi raqamini qidirish (*3608 yoki 3608)
        const cardMatch = text.match(/(?:HUMOCARD|UZCARD|Karta|Visa)[^\d]+(\d{4})/i);
        const cardLast4 = cardMatch ? cardMatch[1] : "TG";

        // To'lovni bazaga log qilamiz
        const payLog = await db.paymentLog.create({
          data: {
            amount,
            cardLast4,
            rawMessage: text,
            matched: false,
          },
        });

        // O'sha vaqtda "Pul kutilmoqda" holatidagi profillar bilan solishtiramiz
        const result = await matchPayment({
          paymentId: payLog.id,
          amount,
          cardLast4,
        });

        if (result.matched && result.profileId) {
          await db.adminLog.create({
            data: {
              type: "topup",
              message: `✅ Telegram orqali ${amount} so'm to'lov avtomatik tasdiqlandi! Profil reytingga chiqdi!`,
              profileId: result.profileId,
            },
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Webhook xatosi:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
