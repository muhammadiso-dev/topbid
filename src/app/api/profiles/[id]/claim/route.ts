import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { contactInfo } from "@/lib/ustar/constants";

export const dynamic = "force-dynamic";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept-Language": "uz,ru,en;q=0.8" },
      redirect: "follow",
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) return null;
    return (await res.text()).slice(0, 500_000);
  } catch {
    return null;
  }
}

/** Telegram kanalida kod izlash: bio (t.me/x) va oxirgi postlar (t.me/s/x) */
async function searchTelegram(handle: string, code: string): Promise<boolean> {
  const h = handle.replace("@", "");
  const urls = [
    `https://t.me/${h}`,
    `https://t.me/s/${h}`,
    `https://t.me/${h}?profile`,
  ];
  for (const u of urls) {
    const html = await fetchText(u);
    if (html && html.toUpperCase().includes(code.toUpperCase())) return true;
  }
  return false;
}

/** Sayt HTML'ida kod izlash */
async function searchSite(url: string, code: string): Promise<boolean> {
  const html = await fetchText(url);
  if (!html) return false;
  return html.toUpperCase().includes(code.toUpperCase());
}

/**
 * POST /api/profiles/[id]/claim — egalik da'vosini boshlash.
 * Kod qaytaradi: foydalanuvchi kanaliga/bio'ga yozadi yoki saytiga meta qo'shadi.
 */
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const profile = await db.profile.findUnique({ where: { id }, include: { category: true } });
  if (!profile) {
    return NextResponse.json({ error: "Profil topilmadi" }, { status: 404 });
  }
  if (profile.editToken) {
    // Token allaqachon mavjud — eski da'vo kodini yangilash mumkin
  }

  const code = "TB-" + crypto.randomBytes(3).toString("hex").toUpperCase(); // TB-A1B2C3
  await db.profile.update({
    where: { id },
    data: { claimCode: code, claimExpiresAt: new Date(Date.now() + 48 * 3600_000) },
  });

  const contact = contactInfo(profile.contactUrl);
  const isTelegram = contact.kind === "telegram";

  return NextResponse.json({
    ok: true,
    code,
    method: isTelegram ? "telegram" : "site",
    instructions: isTelegram
      ? `«${profile.contactUrl.replace("@", "")}» kanaliga quyidagi xabarni yuboring yoki kanal bio'siga qo'shing:\n\n${code}\n\nKeyin "Tekshirish" tugmasini bosing.`
      : `${contact.href} saytining asosiy sahifasiga quyidagi meta tegini qo'shing:\n\n<meta name="topbid" content="${code}">\n\nKeyin "Tekshirish" tugmasini bosing.`,
  });
}

/**
 * PUT /api/profiles/[id]/claim — kodni tekshirish (kanal/sayt).
 * Muvaffaqiyatli bo'lsa editToken qaytaradi.
 */
export async function PUT(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const profile = await db.profile.findUnique({ where: { id } });
    if (!profile) {
      return NextResponse.json({ error: "Profil topilmadi" }, { status: 404 });
    }
    if (!profile.claimCode || !profile.claimExpiresAt || profile.claimExpiresAt < new Date()) {
      return NextResponse.json({ ok: false, error: "Da'vo kodi muddati o'tgan — qayta boshlang" }, { status: 400 });
    }

    const contact = contactInfo(profile.contactUrl);
    const code = profile.claimCode;
    let found = false;

    if (contact.kind === "telegram") {
      found = await searchTelegram(profile.contactUrl, code);
    } else {
      found = await searchSite(contact.href, code);
    }

    if (!found) {
      return NextResponse.json({
        ok: false,
        error: "Kod hali topilmadi. Xabar/meta qo'shilgach 1-2 daqiqa kutib, qayta tekshiring.",
      });
    }

    // Edit token berish (mavjud bo'lmasa)
    let editToken = profile.editToken;
    if (!editToken) {
      editToken = crypto.randomUUID();
      await db.profile.update({ where: { id }, data: { editToken } });
    }

    await notifyAdminSafe(
      `🔑 Profil egaligi tasdiqlandi: ${profile.name} (${profile.contactUrl})`
    );

    return NextResponse.json({ ok: true, editToken });
  } catch (e) {
    console.error("Claim tekshiruvida xato:", e);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

async function notifyAdminSafe(message: string) {
  try {
    const { notifyAdmin } = await import("@/lib/ustar/telegram");
    await notifyAdmin("info", message);
  } catch {
    /* noop */
  }
}
