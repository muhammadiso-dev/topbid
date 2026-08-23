/**
 * TopBid — toza ishga tushirish (demo ma'lumotlarsiz).
 * Deploy'dan OLDIN bir marta ishga tushiring: bun run scripts/reset.ts
 *
 * Nima qiladi:
 *  - Barcha profillar, bidlar, sharhlar, to'lov loglari, verifikatsiyalar O'CHIRILADI
 *  - Kategoriyalar qoladi (foydalanuvchi kerak)
 *  - Statistika 0 dan boshlanadi
 *  - Aksiya sozlamalari saqlanadi
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🧹 Demo ma'lumotlar tozalanmoqda...");

  const counts = {
    reviews: await db.review.deleteMany(),
    bids: await db.bid.deleteMany(),
    paymentLogs: await db.paymentLog.deleteMany(),
    verifications: await db.verificationRequest.deleteMany(),
    views: await db.profileView.deleteMany(),
    adminLogs: await db.adminLog.deleteMany(),
    profiles: await db.profile.deleteMany(),
    stats: await db.siteStats.deleteMany(),
  };

  console.log("✅ Tozalandi:");
  for (const [k, v] of Object.entries(counts)) {
    console.log(`   ${k}: ${v.count}`);
  }

  // Statistika 0 dan
  await db.siteStats.create({ data: { id: "main", visits: 0 } });

  // Boshlang'ich admin log
  await db.adminLog.create({
    data: {
      type: "info",
      message: "🏁 TopBid toza ishga tushirildi. Yangi davr boshlandi!",
    },
  });

  const cats = await db.category.count();
  console.log(`\n📦 Kategoriyalar saqlandi: ${cats}`);
  console.log("🎉 Sayt bo'sh va tayyor!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
