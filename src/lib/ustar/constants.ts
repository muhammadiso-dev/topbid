// TopBid — platformaning umumiy konstantalari, narx darajalari va aksiya mantiqi

/* ==================== BREND ==================== */

export const BRAND = {
  name: "TopBid",
  domain: "topbid.uz",
  bot: "@TopBidBot",
};

/* ==================== NARX DARAJALARI ==================== */

export type Pool = "education" | "it";
export type EducationSubType = "center" | "individual";


/* ==================== OCHILISH AKSIYASI ==================== */

/** Platforma ishga tushgan sana (Toshkent vaqti bilan) */
export const LAUNCH_DATE = new Date("2026-08-23T00:00:00+05:00");
/** Aksiya davomiyligi — kunlarda */
export const PROMO_DAYS = 14;
/** Chegirma miqdori (50%) */
export const PROMO_MULTIPLIER = 0.5;

export interface PromoInfo {
  active: boolean;
  endsAt: string; // ISO
  msLeft: number;
}

/** Aksiya holatini hisoblash — 2 hafta davomida barcha narxlarga 50% */
export function promoInfo(now: Date = new Date()): PromoInfo {
  const endsAtMs = LAUNCH_DATE.getTime() + PROMO_DAYS * 86_400_000;
  const msLeft = endsAtMs - now.getTime();
  return {
    active: msLeft > 0,
    endsAt: new Date(endsAtMs).toISOString(),
    msLeft: Math.max(0, msLeft),
  };
}

/* ==================== TAB NOMLARI ==================== */

export const POOL_LABELS: Record<Pool, string> = {
  education: "O'rganish",
  it: "Yollash",
};

export const POOL_SUBTITLES: Record<Pool, string> = {
  education: "Repetitor, markaz va kurs qidirayotganlar uchun",
  it: "Tayyor mutaxassis va frilanser qidirayotganlar uchun",
};

export const EDUCATION_SUBTYPES: { value: EducationSubType; label: string; short: string }[] = [
  { value: "center", label: "Ta'lim markazlari", short: "Markaz" },
  { value: "individual", label: "Individual repetitorlar", short: "Repetitor" },
];

/* ==================== KATEGORIYALAR ==================== */

export interface CategoryGroupDef {
  pool: Pool;
  group: string;
  items: string[];
}

/** Kategoriya daraxti — guruhlar bilan */
// Guruhlar tartibi: ASOSIY (til, sertifikat) birinchi → maktab → IT → qo'shimcha kurslar → bolalar (eng pastda)
export const CATEGORY_GROUP_ORDER = [
  "Chet tillari",
  "Test tayyorlov",
  "Maktab fanlari",
  "Dasturlash",
  "Dizayn",
  "Marketing",
  "Boshqa",
  "IT kurslar",
  "Bolalar rivojlantirish",
];

export const CATEGORY_GROUPS: CategoryGroupDef[] = [
  // ===== 1. ASOSIY: Chet tillari =====
  {
    pool: "education",
    group: "Chet tillari",
    items: [
      "Ingliz tili (IELTS)",
      "Ingliz tili (umumiy/bolalar)",
      "SAT/TOEFL",
      "Rus tili",
      "Koreys tili",
      "Xitoy tili",
      "Turk tili",
      "Arab tili",
      "Nemis/Fransuz tili",
    ],
  },
  // ===== 2. ASOSIY: Sertifikat/test tayyorlov =====
  {
    pool: "education",
    group: "Test tayyorlov",
    items: [
      "Milliy sertifikat / DTM",
      "IELTS/TOEFL intensiv",
      "Chet el universitetlariga tayyorlov",
    ],
  },
  // ===== 3. Maktab fanlari =====
  {
    pool: "education",
    group: "Maktab fanlari",
    items: [
      "Matematika",
      "Fizika",
      "Kimyo",
      "Biologiya",
      "Tarix",
      "Ona tili va adabiyot",
      "Iqtisodiyot/Huquq",
    ],
  },
  // ===== 4-7. IT mutaxassislar =====
  {
    pool: "it",
    group: "Dasturlash",
    items: ["Frontend", "Backend", "Full-stack", "Mobil (iOS/Android)", "Game dev"],
  },
  {
    pool: "it",
    group: "Dizayn",
    items: ["UI/UX dizayn", "Grafik dizayn", "Motion dizayn"],
  },
  {
    pool: "it",
    group: "Marketing",
    items: ["SMM", "Target reklama", "SEO"],
  },
  {
    pool: "it",
    group: "Boshqa",
    items: [
      "Data analyst / Data science",
      "DevOps",
      "QA/Testing",
      "Kiberxavfsizlik",
      "Copywriting/Kontent",
    ],
  },
  // ===== 8. Qo'shimcha: IT kurslar =====
  {
    pool: "education",
    group: "IT kurslar",
    items: [
      "Python/dasturlash kursi",
      "Frontend kursi",
      "Dizayn kursi",
      "SMM/marketing kursi",
    ],
  },
  // ===== 9. Eng pastda: Bolalar rivojlantirish =====
  {
    pool: "education",
    group: "Bolalar rivojlantirish",
    items: ["Robototexnika", "Shaxmat", "Rasm/San'at", "Musiqa"],
  },
];

/** Barcha kategoriyalar (seed uchun yassi ro'yxat) */
export const CATEGORY_SEED = CATEGORY_GROUPS.flatMap((g) =>
  g.items.map((name) => ({ name, pool: g.pool, group: g.group }))
);

/* ==================== SHAHARLAR ==================== */

export const CITIES = [
  "Toshkent",
  "Samarqand",
  "Buxoro",
  "Andijon",
  "Namangan",
  "Farg'ona",
  "Navoiy",
  "Qarshi",
  "Termiz",
  "Jizzax",
  "Guliston",
  "Urganch",
  "Nukus",
  "Xiva",
  "Qo'qon",
  "Onlayn",
] as const;

/* ==================== FORMATLASH ==================== */

import type { Lang } from "./i18n/constants-lang";

const SOM_WORD: Record<Lang, string> = {
  uz: "so'm",
  ru: "сум",
  en: "UZS",
  kk: "сом",
};
const SOM_MLN: Record<Lang, string> = {
  uz: "mln so'm",
  ru: "млн сум",
  en: "M UZS",
  kk: "млн сом",
};
const SOM_MING: Record<Lang, string> = {
  uz: "ming so'm",
  ru: "тыс сум",
  en: "k UZS",
  kk: "мың сом",
};

/** Summani formatda: 1 250 000 so'm (til parametri ixtiyoriy) */
export function formatSom(amount: number, lang: Lang = "uz"): string {
  return amount.toLocaleString("ru-RU").replace(/\u00a0/g, " ") + " " + SOM_WORD[lang];
}

/** Qisqa format: 1.2 mln / 245 ming / 15 000 */
export function formatCompactSom(amount: number, lang: Lang = "uz"): string {
  if (amount >= 1_000_000) {
    const v = amount / 1_000_000;
    return `${v % 1 === 0 ? v : v.toFixed(1)} ${SOM_MLN[lang]}`;
  }
  if (amount >= 100_000) {
    const v = amount / 1_000;
    return `${Math.round(v)} ${SOM_MING[lang]}`;
  }
  return `${amount.toLocaleString("ru-RU").replace(/\u00a0/g, " ")} ${SOM_WORD[lang]}`;
}

/** Raqam uchun qisqa format: 12.4k */
export function formatCompactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}

/** "3 kun oldin" — til bo'yicha */
export function timeAgo(date: string | Date, lang: Lang = "uz"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  const W = {
    uz: { now: "hozir", min: "daqiqa oldin", h: "soat oldin", d: "kun oldin", m: "oy oldin", y: "yil oldin" },
    ru: { now: "сейчас", min: "мин назад", h: "ч назад", d: "дн назад", m: "мес назад", y: "г назад" },
    en: { now: "now", min: "min ago", h: "h ago", d: "d ago", m: "mo ago", y: "y ago" },
    kk: { now: "қазір", min: "мин бұрын", h: "сағ бұрын", d: "күн бұрын", m: "ай бұрын", y: "жыл бұрын" },
  }[lang];

  if (minutes < 1) return W.now;
  if (minutes < 60) return `${minutes} ${W.min}`;
  if (hours < 24) return `${hours} ${W.h}`;
  if (days < 30) return `${days} ${W.d}`;
  if (months < 12) return `${months} ${W.m}`;
  return `${years} ${W.y}`;
}

/* ==================== KONTAKT ==================== */

/** Kontakt havolasini normalizatsiya qilish (dubl aniqlash uchun) */
export function normalizeContactUrl(url: string): string {
  const u = url.trim().toLowerCase();
  if (!u) return "";

  // 1) @handle
  if (u.startsWith("@")) {
    const h = u.split(/[/?#]/)[0].replace(/^@+/, "");
    return "@" + h;
  }

  try {
    const withProto = /^https?:\/\//.test(u) ? u : `https://${u}`;
    const parsed = new URL(withProto);
    const host = parsed.hostname.replace(/^www\./, "");
    const seg = parsed.pathname.split("/").filter(Boolean)[0] || "";

    // 2) Telegram: t.me/channel (post havolalari ham kanalga)
    if (host === "t.me" || host === "telegram.me") {
      return seg ? "@" + seg.replace("@", "") : host;
    }

    // 3) Ijtimoiy tarmoqlar: profil identifikatori bo'yicha
    const SOCIAL = ["instagram.com", "tiktok.com", "facebook.com", "youtube.com", "vk.com", "twitter.com", "x.com", "linkedin.com"];
    if (SOCIAL.some((s) => host === s || host.endsWith("." + s))) {
      return seg ? `${host}/${seg.replace("@", "")}` : host;
    }

    // 4) Veb-saytlar: asosiy domen bo'yicha (path va tracking paramlar tashlanadi)
    return host;
  } catch {
    return u.split(/[/?#]/)[0].replace(/\/+$/, "");
  }
}

/** Kontakt havolasi to'g'ri formatda ekanini tekshirish */
export function isValidContactUrl(url: string): boolean {
  const u = url.trim();
  if (u.length < 3) return false;
  return /^(@[\w_]{3,}|https?:\/\/[\w.-]+\.[a-z]{2,}.*|[\w.-]+\.[a-z]{2,}.*)$/i.test(u);
}

/** Kontakt turi va ko'rsatiladigan matn */
export function contactInfo(url: string): {
  label: string;
  href: string;
  kind: "telegram" | "instagram" | "site";
} {
  const u = url.trim();
  const lower = u.toLowerCase();
  if (lower.startsWith("@") || lower.includes("t.me") || lower.includes("telegram")) {
    const handle = lower.startsWith("@")
      ? lower
      : "@" + (lower.split("t.me/").pop() || lower.split("telegram.me/").pop() || "").replace(/\/+$/, "");
    return { label: handle, href: `https://t.me/${handle.replace("@", "")}`, kind: "telegram" };
  }
  if (lower.includes("instagram")) {
    const handle = "@" + (lower.split("instagram.com/").pop() || "").replace(/\/+$/, "");
    return { label: handle || u, href: u.startsWith("http") ? u : `https://${u}`, kind: "instagram" };
  }
  return { label: u.replace(/^https?:\/\//, ""), href: u.startsWith("http") ? u : `https://${u}`, kind: "site" };
}

/* ==================== AVATAR ==================== */

const AVATAR_COLORS = [
  "#d97b29",
  "#b45f14",
  "#8a6a4f",
  "#c98a5b",
  "#a0622d",
  "#d9914f",
  "#87573a",
  "#c97b4f",
];

/** Ismdan deterministik avatar rangi */
export function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

/** Ismdan initsiallar */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/** Admin demo paroli (.env ADMIN_PASSWORD bilan almashtiriladi) */
export const ADMIN_PASSWORD_DEFAULT = "ustar2024";
