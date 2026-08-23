/** Eski kontakt URLlarini yangi kanonik formatga migratsiya qilish:
 * - https://site.uz → site.uz (asosiy domen)
 * - tracking paramlar olib tashlanadi
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function normalize(url: string): string {
  const u = url.trim().toLowerCase();
  if (!u) return "";
  if (u.startsWith("@")) return "@" + u.split(/[/?#]/)[0].replace(/^@+/, "");
  try {
    const withProto = /^https?:\/\//.test(u) ? u : `https://${u}`;
    const parsed = new URL(withProto);
    const host = parsed.hostname.replace(/^www\./, "");
    const seg = parsed.pathname.split("/").filter(Boolean)[0] || "";
    if (host === "t.me" || host === "telegram.me") return seg ? "@" + seg.replace("@", "") : host;
    const SOCIAL = ["instagram.com", "tiktok.com", "facebook.com", "youtube.com", "vk.com", "twitter.com", "x.com", "linkedin.com"];
    if (SOCIAL.some((s) => host === s || host.endsWith("." + s))) return seg ? `${host}/${seg.replace("@", "")}` : host;
    return host;
  } catch {
    return u.split(/[/?#]/)[0];
  }
}

async function main() {
  const profiles = await db.profile.findMany({ select: { id: true, contactUrl: true } });
  let updated = 0;
  for (const p of profiles) {
    const canonical = normalize(p.contactUrl);
    if (canonical && canonical !== p.contactUrl) {
      await db.profile.update({ where: { id: p.id }, data: { contactUrl: canonical } });
      updated++;
      console.log(`  ${p.contactUrl} → ${canonical}`);
    }
  }
  console.log(`✅ ${updated}/${profiles.length} profil URLsi yangilandi`);
}

main().catch(console.error).finally(() => db.$disconnect());
