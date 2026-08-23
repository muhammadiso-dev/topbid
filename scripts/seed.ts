/**
 * Ustar demo ma'lumotlari seed skripti.
 * Ishga tushirish: bun run scripts/seed.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const CATEGORIES: { name: string; pool: string }[] = [
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

interface SeedProfile {
  name: string;
  description: string;
  city: string;
  contactUrl: string;
  pool: string;
  subType: string;
  category: string;
  totalBid: number;
  verified?: boolean;
  clicks: number;
  views: number;
  daysAgo: number;
  reviews?: { authorName: string; rating: number; comment: string; sessionId: string }[];
}

const PROFILES: SeedProfile[] = [
  // ===== TA'LIM — MARKAZLAR =====
  {
    name: "Smart English Academy",
    description:
      "IELTS 7.0+ kafolatli kurslar. Tajribali ustozlar, haftalik mock testlar va individual yondashuv. 8 yillik tajriba, 2000+ bitiruvchi.",
    city: "Toshkent",
    contactUrl: "@smartenglish_uz",
    pool: "education",
    subType: "center",
    category: "IELTS / CEFR",
    totalBid: 180_000,
    verified: true,
    clicks: 412,
    views: 2830,
    daysAgo: 12,
    reviews: [
      { authorName: "Madina", rating: 5, comment: "6 oyda IELTS 7.5 oldim! Ustozlar juda e'tiborli.", sessionId: "seed-1" },
      { authorName: "Jasur", rating: 4, comment: "Mock testlar juda foydali. Narx arzonroq bo'lsa edi.", sessionId: "seed-2" },
      { authorName: "Zilola", rating: 5, comment: "Speaking club bepul, juda zo'r muhit.", sessionId: "seed-3" },
    ],
  },
  {
    name: "IELTS Zone",
    description:
      "Sertifikatli ustozlar bilan IELTS va CEFR tayyorlov. Kichik guruhlar (6-8 kishi), onlayn va oflayn darslar.",
    city: "Toshkent",
    contactUrl: "@ieltszone",
    pool: "education",
    subType: "center",
    category: "IELTS / CEFR",
    totalBid: 150_000,
    clicks: 298,
    views: 1954,
    daysAgo: 9,
    reviews: [
      { authorName: "Sardor", rating: 5, comment: "Listening bo'yicha juda kuchli darslar.", sessionId: "seed-4" },
      { authorName: "Nilufar", rating: 4, comment: "Juda yaxshi markaz, lekin guruhlar to'lib qoladi.", sessionId: "seed-5" },
    ],
  },
  {
    name: "Westminster Education",
    description:
      "Xalqaro standartlarda ta'lim: IELTS, matematika va abituriyent tayyorlov. Filiallar Toshkent va Samarqandda.",
    city: "Toshkent",
    contactUrl: "https://westminster-edu.uz",
    pool: "education",
    subType: "center",
    category: "Abituriyent tayyorlov",
    totalBid: 120_000,
    verified: true,
    clicks: 245,
    views: 1710,
    daysAgo: 15,
    reviews: [
      { authorName: "Aziz", rating: 5, comment: "DTM imtihoniga juda yaxshi tayyorladi. Rahmat!", sessionId: "seed-6" },
    ],
  },
  {
    name: "Nur Afzal Ta'lim Markazi",
    description:
      "Samarqanddagi eng tajribali ta'lim markazi. Matematika, fizika va ingliz tili fanlaridan sifatli ta'lim.",
    city: "Samarqand",
    contactUrl: "@nurafzal_sam",
    pool: "education",
    subType: "center",
    category: "Matematika",
    totalBid: 65_000,
    clicks: 132,
    views: 890,
    daysAgo: 7,
  },
  {
    name: "English House Buxoro",
    description:
      "Buxoroda ingliz tili va IELTS. Bolalar va kattalar uchun daraja bo'yicha guruhlar. Birinchi dars bepul.",
    city: "Buxoro",
    contactUrl: "@englishhouse_bux",
    pool: "education",
    subType: "center",
    category: "Ingliz tili",
    totalBid: 40_000,
    clicks: 87,
    views: 560,
    daysAgo: 5,
    reviews: [
      { authorName: "Kamola", rating: 5, comment: "Bolam 3 oyda erkin gapirishni boshladi. Rahmat!", sessionId: "seed-7" },
    ],
  },

  // ===== TA'LIM — INDIVIDUAL REPETITORLAR =====
  {
    name: "Aziza Karimova",
    description:
      "IELTS 8.5 egasi. 6 yillik tajriba bilan individual IELTS tayyorlov. Har bir o'quvchi uchun shaxsiy reja.",
    city: "Toshkent",
    contactUrl: "@aziza_ielts",
    pool: "education",
    subType: "individual",
    category: "IELTS / CEFR",
    totalBid: 90_000,
    verified: true,
    clicks: 356,
    views: 2140,
    daysAgo: 11,
    reviews: [
      { authorName: "Dilshod", rating: 5, comment: "Writing bo'yicha eng zo'r ustoz. 6.5 dan 7.5 ga chiqdim.", sessionId: "seed-8" },
      { authorName: "Sevinch", rating: 5, comment: "Juda sabrli va professional. Tavsiya qilaman!", sessionId: "seed-9" },
    ],
  },
  {
    name: "Jasur Rahimov",
    description:
      "Matematika bo'yicha tajribali repetitor. Maktab, OTM va matematika olimpiadalariga tayyorlov.",
    city: "Samarqand",
    contactUrl: "@jasur_math",
    pool: "education",
    subType: "individual",
    category: "Matematika",
    totalBid: 45_000,
    clicks: 154,
    views: 980,
    daysAgo: 6,
    reviews: [
      { authorName: "Otabek", rating: 4, comment: "Tushuntirishi tushunarli, o'zlashtirish yaxshi ketdi.", sessionId: "seed-10" },
    ],
  },
  {
    name: "Dilnoza Yusupova",
    description:
      "Farg'onalik ingliz tili ustozasi. CEFR A1-B2, bola va kattalar uchun individual darslar.",
    city: "Farg'ona",
    contactUrl: "@dilnoza_english",
    pool: "education",
    subType: "individual",
    category: "Ingliz tili",
    totalBid: 30_000,
    clicks: 76,
    views: 445,
    daysAgo: 4,
  },
  {
    name: "Bekzod Sultonov",
    description:
      "Fizika bo'yicha repetitor. Abituriyentlar uchun intensiv kurs, formulalarni oson o'rgatish metodikasi.",
    city: "Toshkent",
    contactUrl: "@bekzod_physics",
    pool: "education",
    subType: "individual",
    category: "Fizika",
    totalBid: 25_000,
    clicks: 64,
    views: 380,
    daysAgo: 3,
  },

  // ===== IT MUTAXASSISLAR =====
  {
    name: "CodeCraft Studio",
    description:
      "Fullstack web dasturlash: Next.js, Node.js, PostgreSQL. Startup va biznes uchun tezkor MVP ishlab chiqamiz.",
    city: "Toshkent",
    contactUrl: "@codecraft_studio",
    pool: "it",
    subType: "Dasturchi",
    category: "Fullstack",
    totalBid: 200_000,
    verified: true,
    clicks: 520,
    views: 3120,
    daysAgo: 14,
    reviews: [
      { authorName: "Startup asoschisi", rating: 5, comment: "3 haftada MVP chiqarib berishdi. Sifat zo'r!", sessionId: "seed-11" },
      { authorName: "Anvar", rating: 5, comment: "Kod sifati va kommunikatsiya 10/10.", sessionId: "seed-12" },
    ],
  },
  {
    name: "PixelPro Dizayn",
    description:
      "UI/UX dizayn studiyasi. Mobil ilovalar va veb-saytlar uchun zamonaviy, konversiyaga yo'naltirilgan dizayn.",
    city: "Toshkent",
    contactUrl: "@pixelpro_design",
    pool: "it",
    subType: "Dizayner",
    category: "UI/UX Dizayn",
    totalBid: 130_000,
    clicks: 388,
    views: 2410,
    daysAgo: 10,
    reviews: [
      { authorName: "Malika", rating: 5, comment: "Logotip va brendbuk juda yoqdi. Tez va sifatli.", sessionId: "seed-13" },
    ],
  },
  {
    name: "Ali Vohidov",
    description:
      "Frontend dasturchi (React, Next.js, TypeScript). Landing, internet-do'kon va SaaS panel yarataman.",
    city: "Toshkent",
    contactUrl: "@ali_frontend",
    pool: "it",
    subType: "Dasturchi",
    category: "Frontend",
    totalBid: 85_000,
    verified: true,
    clicks: 276,
    views: 1650,
    daysAgo: 8,
    reviews: [
      { authorName: "Ravshan", rating: 4, comment: "Saytim tez ishlaydi, dizayn ham zo'r chiqdi.", sessionId: "seed-14" },
      { authorName: "Gulnora", rating: 5, comment: "Muddatni buzmay, sifatli bajardi.", sessionId: "seed-15" },
    ],
  },
  {
    name: "Media Boost",
    description:
      "SMM va kontent marketing. Instagram va Telegram bo'yicha targetologiya, kontent reja va analitika.",
    city: "Samarqand",
    contactUrl: "@mediaboost_uz",
    pool: "it",
    subType: "SMM mutaxassis",
    category: "SMM",
    totalBid: 55_000,
    clicks: 198,
    views: 1204,
    daysAgo: 6,
  },
  {
    name: "GrowthLab Marketing",
    description:
      "Performance marketing agentligi. Google Ads, Facebook Ads va SEO bilan savdoni oshirish.",
    city: "Toshkent",
    contactUrl: "https://growthlab.uz",
    pool: "it",
    subType: "Marketolog",
    category: "Marketolog",
    totalBid: 48_000,
    clicks: 176,
    views: 1020,
    daysAgo: 9,
    reviews: [
      { authorName: "Do'kon egasi", rating: 4, comment: "Reklama byudjeti samarali ishlatildi, savdo oshdi.", sessionId: "seed-16" },
    ],
  },
  {
    name: "QA Masters",
    description:
      "Dasturiy ta'minot testlash: manual va avtomatlashtirilgan (Selenium, Playwright). Sifatni kafolatlaymiz.",
    city: "Namangan",
    contactUrl: "@qamasters_uz",
    pool: "it",
    subType: "QA mutaxassis",
    category: "QA / Testlash",
    totalBid: 25_000,
    clicks: 92,
    views: 610,
    daysAgo: 4,
  },
];

async function main() {
  console.log("🚀 Seed boshlanmoqda...");

  // Tozalash
  await db.review.deleteMany();
  await db.bid.deleteMany();
  await db.adminLog.deleteMany();
  await db.profile.deleteMany();
  await db.category.deleteMany();
  await db.siteStats.deleteMany();

  // Kategoriyalar
  const catMap = new Map<string, string>();
  for (const c of CATEGORIES) {
    const cat = await db.category.create({ data: { name: c.name, pool: c.pool } });
    catMap.set(c.name, cat.id);
  }
  console.log(`✅ ${CATEGORIES.length} kategoriya qo'shildi`);

  // Profillar
  let totalRevenue = 0;
  for (const p of PROFILES) {
    const daysAgo = p.daysAgo;
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const profile = await db.profile.create({
      data: {
        name: p.name,
        description: p.description,
        city: p.city,
        contactUrl: p.contactUrl,
        pool: p.pool,
        subType: p.subType,
        categoryId: catMap.get(p.category)!,
        verified: p.verified ?? false,
        totalBid: p.totalBid,
        clicks: p.clicks,
        views: p.views,
        createdAt,
        lastBidAt: createdAt,
      },
    });
    await db.bid.create({
      data: { profileId: profile.id, amount: p.totalBid, status: "paid", createdAt },
    });
    totalRevenue += p.totalBid;

    for (const r of p.reviews ?? []) {
      await db.review.create({
        data: {
          profileId: profile.id,
          sessionId: r.sessionId,
          authorName: r.authorName,
          rating: r.rating,
          comment: r.comment,
          createdAt: new Date(createdAt.getTime() + 12 * 60 * 60 * 1000),
        },
      });
    }
  }
  console.log(`✅ ${PROFILES.length} profil, ${totalRevenue.toLocaleString("ru-RU")} so'm daromad seed qilindi`);

  // Bazaviy tashriflar statistikasi
  await db.siteStats.create({ data: { id: "main", visits: 3421 } });

  // Admin jurnaliga boshlang'ich yozuv
  await db.adminLog.create({
    data: {
      type: "info",
      message: "🏁 Ustar platformasi ishga tushdi. Demo ma'lumotlar yuklandi.",
    },
  });

  console.log("🎉 Seed tugadi!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
