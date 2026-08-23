// Ustar platformasining umumiy konstantalari va sozlamalari

/** Minimal taklif (boshlang'ich narx) — so'mda */
export const MIN_BID = 20_000;

/** Har bir raqobat qadami (o'sish) — so'mda */
export const BID_INCREMENT = 10_000;

/** Admin paroli (demo; .env dagi ADMIN_PASSWORD bilan almashtiriladi) */
export const ADMIN_PASSWORD_DEFAULT = "ustar2024";

export type Pool = "education" | "it";

export type EducationSubType = "center" | "individual";

/** Ta'lim poolidagi kichik toifalar */
export const EDUCATION_SUBTYPES: { value: EducationSubType; label: string; short: string }[] = [
  { value: "center", label: "Ta'lim markazlari", short: "Markaz" },
  { value: "individual", label: "Individual repetitorlar", short: "Repetitor" },
];

/** O'zbekiston shaharlari */
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

/** Kategoriya (fan/soha) seed konfiguratsiyasi */
export const CATEGORY_SEED: { name: string; pool: Pool }[] = [
  // Ta'lim
  { name: "IELTS / CEFR", pool: "education" },
  { name: "Ingliz tili", pool: "education" },
  { name: "Matematika", pool: "education" },
  { name: "Fizika", pool: "education" },
  { name: "Kimyo", pool: "education" },
  { name: "Biologiya", pool: "education" },
  { name: "Rus tili", pool: "education" },
  { name: "Informatika", pool: "education" },
  { name: "Abituriyent tayyorlov", pool: "education" },
  { name: "Boshqa fan", pool: "education" },
  // IT
  { name: "Frontend", pool: "it" },
  { name: "Backend", pool: "it" },
  { name: "Fullstack", pool: "it" },
  { name: "Mobil dasturlash", pool: "it" },
  { name: "UI/UX Dizayn", pool: "it" },
  { name: "Grafik dizayn", pool: "it" },
  { name: "SMM", pool: "it" },
  { name: "Marketolog", pool: "it" },
  { name: "QA / Testlash", pool: "it" },
  { name: "DevOps", pool: "it" },
];

/** IT poolidagi kichik toifalar (subType qiymatlari) */
export const IT_SUBTYPES = [
  "Dasturchi",
  "Dizayner",
  "Marketolog",
  "SMM mutaxassis",
  "QA mutaxassis",
  "DevOps",
] as const;

export const POOL_LABELS: Record<Pool, string> = {
  education: "Ta'lim",
  it: "IT mutaxassislar",
};

/** Summani o'zbekcha formatda chiqarish: 1 250 000 so'm */
export function formatSom(amount: number): string {
  return amount.toLocaleString("ru-RU").replace(/\u00a0/g, " ") + " so'm";
}

/** Qisqa format: 1.2 mln / 245 ming / 1 234 */
export function formatCompactSom(amount: number): string {
  if (amount >= 1_000_000) {
    const v = amount / 1_000_000;
    return `${v % 1 === 0 ? v : v.toFixed(1)} mln so'm`;
  }
  if (amount >= 1_000) {
    const v = amount / 1_000;
    return `${v % 1 === 0 ? v : v.toFixed(0)} ming so'm`;
  }
  return `${amount} so'm`;
}

/** Raqam uchun qisqa format: 12.4k */
export function formatCompactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}

/** "3 kun oldin", "2 soat oldin" kabilar */
export function timeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "hozir";
  if (minutes < 60) return `${minutes} daqiqa oldin`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} kun oldin`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} oy oldin`;
  return `${Math.floor(months / 12)} yil oldin`;
}

/** Kontakt havolasini normalizatsiya qilish (dubl aniqlash uchun) */
export function normalizeContactUrl(url: string): string {
  let u = url.trim().toLowerCase();
  u = u.replace(/\/+$/, "");
  u = u.replace(/^https?:\/\/(t\.me|telegram\.me)\//, "@");
  return u;
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

/** Ismdan deterministik avatar rangi */
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
