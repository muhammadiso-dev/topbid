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

/** Telegram: bio (t.me/x), postlar (t.me/s/x), profil */
async function searchTelegram(handle: string, code: string): Promise<boolean> {
  const h = handle.replace("@", "");
  for (const u of [`https://t.me/${h}`, `https://t.me/s/${h}`, `https://t.me/${h}?profile`]) {
    const html = await fetchText(u);
    if (html && html.toUpperCase().includes(code.toUpperCase())) return true;
  }
  return false;
}

/** Instagram: bio tekshirish (public profil sahifasi HTML'ida bio matni bor) */
async function searchInstagram(profileId: string, code: string): Promise<boolean> {
  const html = await fetchText(`https://www.instagram.com/${profileId}/`);
  if (!html) return false;
  // Bio matni meta description yoki og:description ichida bo'ladi
  return html.toUpperCase().includes(code.toUpperCase());
}

/** TikTok: bio (profil sahifa HTML + oEmbed title) */
async function searchTikTok(handle: string, code: string): Promise<boolean> {
  const html = await fetchText(`https://www.tiktok.com/@${handle}`);
  if (html && html.toUpperCase().includes(code.toUpperCase())) return true;
  // oEmbed'da title'da bio bo'lishi mumkin
  try {
    const res = await fetch(
      `https://www.tiktok.com/oembed?url=https://www.tiktok.com/@${handle}`,
      { signal: AbortSignal.timeout(6000), headers: { "User-Agent": UA } }
    );
    if (res.ok) {
      const d = await res.json();
      const text = JSON.stringify(d);
      if (text.toUpperCase().includes(code.toUpperCase())) return true;
    }
  } catch {
    /* noop */
  }
  return false;
}

/** Boshqa ijtimoiy tarmoq yoki sayt: HTML'da kod izlash */
async function searchGeneric(url: string, code: string): Promise<boolean> {
  const html = await fetchText(url);
  if (!html) return false;
  return html.toUpperCase().includes(code.toUpperCase());
}

/** Platforma turini aniqlash */
function detectPlatform(contactUrl: string): {
  kind: "telegram" | "instagram" | "tiktok" | "site";
  id: string;
} {
  const u = contactUrl.toLowerCase();
  const seg = contactUrl.split("/").pop()?.replace("@", "") || "";
  if (u.startsWith("@") || u.includes("t.me")) return { kind: "telegram", id: seg || u.replace("@", "") };
  if (u.includes("instagram.com")) return { kind: "instagram", id: seg };
  if (u.includes("tiktok.com")) return { kind: "tiktok", id: seg };
  return { kind: "site", id: contactUrl };
}

/** Har platforma uchun instruksiyalar */
function instructionsFor(kind: string, code: string, id: string): { method: string; instructions: string } {
  switch (kind) {
    case "telegram":
      return {
        method: "telegram",
        instructions: `«${id}» kanalingizga quyidagi xabarni yuboring YOKI kanal bio'siga (tavsifiga) qo'shing:\n\n${code}\n\nKeyin «Tekshirish» tugmasini bosing.`,
      };
    case "instagram":
      return {
        method: "instagram",
        instructions: `Instagram profilingiz (@${id}) bio'siga (tavsifiga) quyidagi kodni qo'shing:\n\n${code}\n\nSozlamalar → Profil → Tahrirlash → Bio. Saqlagach «Tekshirish» tugmasini bosing.`,
      };
    case "tiktok":
      return {
        method: "tiktok",
        instructions: `TikTok profilingiz (@${id}) bio'siga quyidagi kodni qo'shing:\n\n${code}\n\nProfil → Tahrirlash → Bio. Saqlagach «Tekshirish» tugmasini bosing.`,
      };
    default:
      return {
        method: "site",
        instructions: `Saytingiz asosiy sahifasining <head> qismiga quyidagi meta tegini qo'shing:\n\n<meta name="topbid" content="${code}">\n\nYoki istalgan sahifaga ko'rinadigan qilib yozing: ${code}. Keyin «Tekshirish» tugmasini bosing.`,
      };
  }
}

/**
 * POST /api/profiles/[id]/claim — egalik da'vosini boshlash.
 * Platformaga mos instruksiya + kod qaytaradi.
 */
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const profile = await db.profile.findUnique({ where: { id } });
  if (!profile) {
    return NextResponse.json({ error: "Profil topilmadi" }, { status: 404 });
  }

  const code = "TB-" + crypto.randomBytes(3).toString("hex").toUpperCase(); // TB-A1B2C3
  await db.profile.update({
    where: { id },
    data: { claimCode: code, claimExpiresAt: new Date(Date.now() + 48 * 3600_000) },
  });

  const platform = detectPlatform(profile.contactUrl);
  const instr = instructionsFor(platform.kind, code, platform.id);

  return NextResponse.json({ ok: true, code, ...instr });
}

/**
 * PUT /api/profiles/[id]/claim — kodni tekshirish (platforma bo'yicha).
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

    const platform = detectPlatform(profile.contactUrl);
    const code = profile.claimCode;
    const contact = contactInfo(profile.contactUrl);
    let found = false;

    switch (platform.kind) {
      case "telegram":
        found = await searchTelegram(platform.id, code);
        break;
      case "instagram":
        found = await searchInstagram(platform.id, code);
        break;
      case "tiktok":
        found = await searchTikTok(platform.id, code);
        break;
      default:
        found = await searchGeneric(contact.href, code);
    }

    if (!found) {
      // Platforma tekshirib bo'lmasa (masalan shaxsiy Instagram) — admin qo'lda tasdiqlay oladi
      const fallbackHint =
        platform.kind === "instagram" || platform.kind === "tiktok"
          ? " Bio xususiy profilarda avtomatik tekshirilmaydi — kod bio'da turgan holda @TopBidSupport'ga yozing, admin 24 soat ichida qo'lda tasdiqlaydi."
          : "";
      return NextResponse.json({
        ok: false,
        error: `Kod hali topilmadi. Bio/meta saqlangach 1-2 daqiqa kutib, qayta tekshiring.${fallbackHint}`,
      });
    }

    let editToken = profile.editToken;
    if (!editToken) {
      editToken = crypto.randomUUID();
      await db.profile.update({ where: { id }, data: { editToken } });
    }

    await notifyAdminSafe(`🔑 Profil egaligi tasdiqlandi: ${profile.name} (${profile.contactUrl})`);
    return NextResponse.json({ ok: true, editToken });
  } catch (e) {
    console.error("Claim tekshiruvida xato:", e);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

/**
 * PATCH /api/profiles/[id]/claim — admin qo'lda tasdiqlash (maxfiy profillar uchun).
 * Body: { adminPassword }
 */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const expected = process.env.ADMIN_PASSWORD || "ustar2024";
    if (String(body?.adminPassword || "") !== expected) {
      return NextResponse.json({ error: "Admin paroli noto'g'ri" }, { status: 401 });
    }
    const profile = await db.profile.findUnique({ where: { id } });
    if (!profile) {
      return NextResponse.json({ error: "Profil topilmadi" }, { status: 404 });
    }
    let editToken = profile.editToken;
    if (!editToken) {
      editToken = crypto.randomUUID();
      await db.profile.update({ where: { id }, data: { editToken } });
    }
    await notifyAdminSafe(`🔑 Admin qo'lda tasdiqladi: ${profile.name} (${profile.contactUrl})`);
    return NextResponse.json({ ok: true, editToken });
  } catch {
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
