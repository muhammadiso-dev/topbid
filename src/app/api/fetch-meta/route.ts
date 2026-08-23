import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

interface FetchedMeta {
  name: string;
  description: string;
  imageUrl: string | null;
  source: string;
}

/** URL ni normalizatsiya: @user → t.me/user, domain.uz → https://domain.uz */
function normalizeUrl(raw: string): string | null {
  let u = raw.trim();
  if (!u) return null;
  if (u.startsWith("@")) return `https://t.me/${u.slice(1)}`;
  if (!/^https?:\/\//i.test(u)) {
    if (/^[\w.-]+\.[a-z]{2,}/i.test(u)) u = `https://${u}`;
    else return null;
  }
  try {
    const parsed = new URL(u);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/\s+/g, " ")
    .trim();
}

function extractMeta(html: string): Partial<FetchedMeta> {
  const out: Partial<FetchedMeta> = {};
  const pick = (re: RegExp): string | null => {
    const m = html.match(re);
    return m && m[1] ? decodeEntities(m[1]) : null;
  };
  // og: yoki twitter: meta teglari
  const title =
    pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
    pick(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i) ||
    pick(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i) ||
    pick(/<title[^>]*>([^<]+)<\/title>/i);
  const description =
    pick(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
    pick(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i) ||
    pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
    pick(/<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i);
  const image =
    pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    pick(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
    pick(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
  if (title) out.name = title.slice(0, 60);
  if (description) out.description = description.slice(0, 300);
  if (image) out.imageUrl = image;
  return out;
}

/** Rasmni yuklab olib uploads papkasiga saqlash (hotlink muammolaridan himoya) */
async function saveImage(url: string): Promise<string | null> {
  try {
    if (!/^https?:\/\//i.test(url)) return null;
    
    // Vercel serverless muhitida fayl saqlash mumkin emas, shuning uchun aslini qaytaramiz
    if (process.env.VERCEL) {
      return url;
    }

    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "image/*" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "";
    let ext = "png";
    if (type.includes("jpeg") || type.includes("jpg")) ext = "jpg";
    else if (type.includes("webp")) ext = "webp";
    else if (type.includes("gif")) ext = "gif";
    else if (type.includes("svg")) ext = "svg";
    else if (type.includes("png")) ext = "png";
    else return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 5 * 1024 * 1024) return null;
    const name = `${crypto.randomUUID()}.${ext}`;
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, name), buf);
    return `/api/media/${name}`;
  } catch (err) {
    console.error("saveImage error:", err);
    return null;
  }
}

/** Google favicon xizmati orqali logotip olish (eng ishonchli fallback) */
async function googleFavicon(domain: string): Promise<string | null> {
  const url = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
  return saveImage(url);
}

/** HTML sahifani olish */
async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "uz,ru,en;q=0.8",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("html")) return null;
    const html = await res.text();
    return html.slice(0, 400_000);
  } catch {
    return null;
  }
}

/** @handle dan nom yasash: @topbid_uz → Topbid Uz (sodda) */
function handleToName(handle: string): string {
  return handle
    .replace(/^@+/, "")
    .split(/[_\-.]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
    .slice(0, 60);
}

/** TikTok oEmbed — ommaviy API */
async function fetchTikTokMeta(url: string): Promise<Partial<FetchedMeta> | null> {
  try {
    const res = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(8000), headers: { "User-Agent": UA } }
    );
    if (!res.ok) return null;
    const d = await res.json();
    return {
      name: d.title ? String(d.title).slice(0, 60) : undefined,
      description: d.title ? String(d.title).slice(0, 300) : undefined,
      imageUrl: d.thumbnail_url ? String(d.thumbnail_url) : undefined,
      source: "tiktok",
    };
  } catch {
    return null;
  }
}

/**
 * GET /api/fetch-meta?url=...
 * Havoladan avtomatik ma'lumot oladi: nom, tavsif, logo (favicon).
 * Telegram, saytlar (og: teglari), TikTok (oEmbed), Instagram/X (favicon fallback).
 */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url") || "";
  const url = normalizeUrl(raw);
  if (!url) {
    return NextResponse.json({ error: "Havola noto'g'ri" }, { status: 400 });
  }

  let host = "";
  let handle = "";
  try {
    const u = new URL(url);
    host = u.hostname.replace(/^www\./, "");
    // @handle yoki path'dan
    const seg = u.pathname.split("/").filter(Boolean)[0];
    if (seg) handle = seg.startsWith("@") ? seg : `@${seg}`;
  } catch {
    /* noop */
  }

  const isTelegram = host === "t.me" || host === "telegram.me";
  const isInstagram = host === "instagram.com" || host.endsWith(".instagram.com");
  const isTikTok = host === "tiktok.com" || host.endsWith(".tiktok.com");
  const isX = host === "x.com" || host === "twitter.com";

  let meta: Partial<FetchedMeta> = {};
  let source = "fallback";

  // 1) TikTok oEmbed
  if (isTikTok) {
    const tt = await fetchTikTokMeta(url);
    if (tt && (tt.name || tt.imageUrl)) {
      meta = tt;
      source = "tiktok";
    }
  }

  // 2) Umumiy HTML scrape (Telegram, oddiy saytlar, ba'zan Instagram)
  if (!meta.name || !meta.imageUrl) {
    const html = await fetchHtml(url);
    if (html) {
      const extracted = extractMeta(html);
      if (!meta.name && extracted.name) meta.name = extracted.name;
      if (!meta.description && extracted.description) meta.description = extracted.description;
      if (!meta.imageUrl && extracted.imageUrl) meta.imageUrl = extracted.imageUrl;
      if (extracted.name) source = source === "fallback" ? "og" : source;
      // sahifadagi favicon linki
      if (!meta.imageUrl) {
        const iconHref =
          html.match(/<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/i)?.[1] ||
          html.match(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/i)?.[1];
        if (iconHref) {
          try {
            const abs = new URL(iconHref, url).toString();
            meta.imageUrl = abs;
          } catch {
            /* noop */
          }
        }
      }
    }
  }

  // 3) Fallback nomi: @handle
  if (!meta.name && handle && (isTelegram || isInstagram || isX || isTikTok)) {
    meta.name = handleToName(handle);
    source = source === "fallback" ? "handle" : source;
  }

  // 3b) Umumiy (platforma) nomlarni handle bilan almashtirish
  const GENERIC = new Set([
    "tiktok",
    "instagram",
    "x",
    "twitter",
    "telegram",
    "facebook",
    "youtube",
    "share on facebook",
    "log in or sign up to view",
    "instagram photos and videos",
    "tiktok - make your day",
  ]);
  if (
    meta.name &&
    GENERIC.has(meta.name.toLowerCase().trim()) &&
    handle &&
    handle.length > 1
  ) {
    meta.name = handleToName(handle);
    source = "handle";
  }

  // 4) Rasmni o'z serverimizga saqlash
  let imageUrl: string | null = null;
  if (meta.imageUrl) {
    imageUrl = await saveImage(meta.imageUrl);
  }
  if (!imageUrl) {
    // Instagram/X: profil rasmini olib bo'lmaydi — favicon xizmatidan
    imageUrl = await googleFavicon(host || "t.me");
    if (imageUrl && source === "fallback") source = "favicon";
  }

  const result: FetchedMeta = {
    name: meta.name || handleToName(handle || host),
    description: meta.description || "",
    imageUrl,
    source: imageUrl ? source : "none",
  };

  return NextResponse.json(result);
}
