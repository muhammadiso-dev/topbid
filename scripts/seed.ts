/**
 * TopBid demo ma'lumotlari seed skripti.
 * Ishga tushirish: bun run scripts/seed.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const CATEGORIES: { name: string; pool: string; group: string }[] = [
  // O'rganish — Chet tillari
  { name: "Ingliz tili (IELTS)", pool: "education", group: "Chet tillari" },
  { name: "Ingliz tili (umumiy/bolalar)", pool: "education", group: "Chet tillari" },
  { name: "SAT/TOEFL", pool: "education", group: "Chet tillari" },
  { name: "Rus tili", pool: "education", group: "Chet tillari" },
  { name: "Koreys tili", pool: "education", group: "Chet tillari" },
  { name: "Xitoy tili", pool: "education", group: "Chet tillari" },
  { name: "Turk tili", pool: "education", group: "Chet tillari" },
  { name: "Arab tili", pool: "education", group: "Chet tillari" },
  { name: "Nemis/Fransuz tili", pool: "education", group: "Chet tillari" },
  // O'rganish — Maktab fanlari
  { name: "Matematika", pool: "education", group: "Maktab fanlari" },
  { name: "Fizika", pool: "education", group: "Maktab fanlari" },
  { name: "Kimyo", pool: "education", group: "Maktab fanlari" },
  { name: "Biologiya", pool: "education", group: "Maktab fanlari" },
  { name: "Tarix", pool: "education", group: "Maktab fanlari" },
  { name: "Ona tili va adabiyot", pool: "education", group: "Maktab fanlari" },
  { name: "Iqtisodiyot/Huquq", pool: "education", group: "Maktab fanlari" },
  // O'rganish — Test tayyorlov
  { name: "Milliy sertifikat / DTM", pool: "education", group: "Test tayyorlov" },
  { name: "IELTS/TOEFL intensiv", pool: "education", group: "Test tayyorlov" },
  { name: "Chet el universitetlariga tayyorlov", pool: "education", group: "Test tayyorlov" },
  // O'rganish — IT kurslar
  { name: "Python/dasturlash kursi", pool: "education", group: "IT kurslar" },
  { name: "Frontend kursi", pool: "education", group: "IT kurslar" },
  { name: "Dizayn kursi", pool: "education", group: "IT kurslar" },
  { name: "SMM/marketing kursi", pool: "education", group: "IT kurslar" },
  // O'rganish — Bolalar rivojlantirish
  { name: "Robototexnika", pool: "education", group: "Bolalar rivojlantirish" },
  { name: "Shaxmat", pool: "education", group: "Bolalar rivojlantirish" },
  { name: "Rasm/San'at", pool: "education", group: "Bolalar rivojlantirish" },
  { name: "Musiqa", pool: "education", group: "Bolalar rivojlantirish" },
  // Yollash — Dasturlash
  { name: "Frontend", pool: "it", group: "Dasturlash" },
  { name: "Backend", pool: "it", group: "Dasturlash" },
  { name: "Full-stack", pool: "it", group: "Dasturlash" },
  { name: "Mobil (iOS/Android)", pool: "it", group: "Dasturlash" },
  { name: "Game dev", pool: "it", group: "Dasturlash" },
  // Yollash — Dizayn
  { name: "UI/UX dizayn", pool: "it", group: "Dizayn" },
  { name: "Grafik dizayn", pool: "it", group: "Dizayn" },
  { name: "Motion dizayn", pool: "it", group: "Dizayn" },
  // Yollash — Marketing
  { name: "SMM", pool: "it", group: "Marketing" },
  { name: "Target reklama", pool: "it", group: "Marketing" },
  { name: "SEO", pool: "it", group: "Marketing" },
  // Yollash — Boshqa
  { name: "Data analyst / Data science", pool: "it", group: "Boshqa" },
  { name: "DevOps", pool: "it", group: "Boshqa" },
  { name: "QA/Testing", pool: "it", group: "Boshqa" },
  { name: "Kiberxavfsizlik", pool: "it", group: "Boshqa" },
  { name: "Copywriting/Kontent", pool: "it", group: "Boshqa" },
];

interface SeedProfile {
  name: string;
  description: string;
  city: string;
  contactUrl: string;
  pool: string;
  subType: string; // education: center|individual; it: kategoriya guruhi
  category: string;
  totalBid: number;
  paid: number; // aksiya bilan to'langan (50%)
  verifyStatus?: "none" | "pending" | "verified";
  clicks: number;
  views: number;
  daysAgo: number;
  reviews?: { authorName: string; rating: number; comment: string; sessionId: string }[];
}

const PROFILES: SeedProfile[] = [
  // ===== O'RGANISH — MARKAZLAR (min 50k, qadam 15k) =====
  {
    name: "Smart English Academy",
    description:
      "IELTS 7.0+ kafolatli kurslar. Tajribali ustozlar, haftalik mock testlar va individual yondashuv. 8 yillik tajriba, 2000+ bitiruvchi.",
    city: "Toshkent",
    contactUrl: "@smartenglish_uz",
    pool: "education",
    subType: "center",
    category: "Ingliz tili (IELTS)",
    totalBid: 215_000,
    paid: 107_500,
    verifyStatus: "verified",
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
    category: "Ingliz tili (IELTS)",
    totalBid: 170_000,
    paid: 85_000,
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
      "Xalqaro standartlarda ta'lim: SAT, IMAT va chet el universitetlariga tayyorlov. Filiallar Toshkent va Samarqandda.",
    city: "Toshkent",
    contactUrl: "https://westminster-edu.uz",
    pool: "education",
    subType: "center",
    category: "Chet el universitetlariga tayyorlov",
    totalBid: 125_000,
    paid: 62_500,
    clicks: 245,
    views: 1710,
    daysAgo: 15,
    reviews: [
      { authorName: "Aziz", rating: 5, comment: "IMAT imtihoniga juda yaxshi tayyorladi. Rahmat!", sessionId: "seed-6" },
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
    paid: 32_500,
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
    category: "Ingliz tili (umumiy/bolalar)",
    totalBid: 50_000,
    paid: 25_000,
    clicks: 87,
    views: 560,
    daysAgo: 5,
    reviews: [
      { authorName: "Kamola", rating: 5, comment: "Bolam 3 oyda erkin gapirishni boshladi. Rahmat!", sessionId: "seed-7" },
    ],
  },
  // ===== O'RGANISH — INDIVIDUAL REPETITORLAR (min 15k, qadam 5k) =====
  {
    name: "Aziza Karimova",
    description:
      "IELTS 8.5 egasi. 6 yillik tajriba bilan individual IELTS tayyorlov. Har bir o'quvchi uchun shaxsiy reja.",
    city: "Toshkent",
    contactUrl: "@aziza_ielts",
    pool: "education",
    subType: "individual",
    category: "Ingliz tili (IELTS)",
    totalBid: 75_000,
    paid: 37_500,
    verifyStatus: "verified",
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
    paid: 22_500,
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
    category: "Ingliz tili (umumiy/bolalar)",
    totalBid: 30_000,
    paid: 15_000,
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
    totalBid: 15_000,
    paid: 7_500,
    clicks: 64,
    views: 380,
    daysAgo: 3,
  },
  // ===== YOLLASH — IT MUTAXASSISLAR (min 20k, qadam 5k) =====
  {
    name: "CodeCraft Studio",
    description:
      "Fullstack web dasturlash: Next.js, Node.js, PostgreSQL. Startup va biznes uchun tezkor MVP ishlab chiqamiz.",
    city: "Toshkent",
    contactUrl: "@codecraft_studio",
    pool: "it",
    subType: "Dasturlash",
    category: "Full-stack",
    totalBid: 135_000,
    paid: 67_500,
    verifyStatus: "verified",
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
    subType: "Dizayn",
    category: "UI/UX dizayn",
    totalBid: 90_000,
    paid: 45_000,
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
    subType: "Dasturlash",
    category: "Frontend",
    totalBid: 55_000,
    paid: 27_500,
    verifyStatus: "verified",
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
    subType: "Marketing",
    category: "SMM",
    totalBid: 35_000,
    paid: 17_500,
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
    subType: "Marketing",
    category: "Target reklama",
    totalBid: 25_000,
    paid: 12_500,
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
    subType: "Boshqa",
    category: "QA/Testing",
    totalBid: 20_000,
    paid: 10_000,
    clicks: 92,
    views: 610,
    daysAgo: 4,
  },
];

async function main() {
  console.log("🚀 TopBid seed boshlanmoqda...");

  await db.profileView.deleteMany();
  await db.review.deleteMany();
  await db.bid.deleteMany();
  await db.verificationRequest.deleteMany();
  await db.adminLog.deleteMany();
  await db.profile.deleteMany();
  await db.category.deleteMany();
  await db.siteStats.deleteMany();

  // Kategoriyalar
  const catMap = new Map<string, string>();
  for (const c of CATEGORIES) {
    const cat = await db.category.create({
      data: { name: c.name, pool: c.pool, groupName: c.group },
    });
    catMap.set(c.name, cat.id);
  }
  console.log(`✅ ${CATEGORIES.length} kategoriya qo'shildi`);

  // Profillar
  let bidsRevenue = 0;
  const createdIds: Record<string, string> = {};
  for (const p of PROFILES) {
    const createdAt = new Date(Date.now() - p.daysAgo * 24 * 60 * 60 * 1000);
    const profile = await db.profile.create({
      data: {
        name: p.name,
        description: p.description,
        city: p.city,
        contactUrl: p.contactUrl,
        pool: p.pool,
        subType: p.subType,
        categoryId: catMap.get(p.category)!,
        verifyStatus: p.verifyStatus ?? "none",
        totalBid: p.totalBid,
        clicks: p.clicks,
        views: p.views,
        createdAt,
        lastBidAt: createdAt,
      },
    });
    createdIds[p.name] = profile.id;
    // Haqiqiy to'lov (aksiya 50%) — Bid yozuvlari real pulni aks ettiradi
    await db.bid.create({
      data: { profileId: profile.id, amount: p.paid, status: "paid", createdAt },
    });
    bidsRevenue += p.paid;

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
  console.log(`✅ ${PROFILES.length} profil, bidlar daromadi: ${bidsRevenue.toLocaleString("ru-RU")} so'm`);

  // Verifikatsiya so'rovlari: tasdiqlanganlar (o'tgan) + 1 ta kutilayotgan
  const verifiedSeeds = [
    { name: "Smart English Academy", fee: 25_000, daysAgo: 11 },
    { name: "Aziza Karimova", fee: 25_000, daysAgo: 10 },
    { name: "CodeCraft Studio", fee: 25_000, daysAgo: 13 },
    { name: "Ali Vohidov", fee: 25_000, daysAgo: 7 },
  ];
  let verRevenue = 0;
  for (const v of verifiedSeeds) {
    await db.verificationRequest.create({
      data: {
        profileId: createdIds[v.name],
        fee: v.fee,
        status: "approved",
        createdAt: new Date(Date.now() - v.daysAgo * 86_400_000),
        reviewedAt: new Date(Date.now() - (v.daysAgo - 1) * 86_400_000),
      },
    });
    verRevenue += v.fee;
  }
  // Kutilayotgan so'rov — admin panelda ko'rinadi
  await db.verificationRequest.create({
    data: {
      profileId: createdIds["IELTS Zone"],
      fee: 25_000,
      status: "pending",
      createdAt: new Date(Date.now() - 6 * 3600_000),
    },
  });
  await db.profile.update({
    where: { id: createdIds["IELTS Zone"] },
    data: { verifyStatus: "pending" },
  });
  console.log(`✅ Verifikatsiya: ${verifiedSeeds.length} tasdiqlangan (+${verRevenue.toLocaleString("ru-RU")} so'm), 1 kutilayotgan`);

  // ===== ANALITIKA SEED (chuqur analytics demo) =====
  const CITIES_DIST: [string, number][] = [
    ["Toshkent", 45], ["Samarqand", 12], ["Buxoro", 8], ["Farg'ona", 7],
    ["Namangan", 6], ["Andijon", 5], ["Nukus", 4], ["Urganch", 4], ["Onlayn", 9],
  ];
  const DEVICES: [string, number][] = [["mobile", 72], ["desktop", 24], ["tablet", 4]];
  const REFS: [string, number][] = [["direct", 55], ["t.me", 18], ["google.com", 12], ["instagram.com", 10], ["yandex.ru", 5]];

  function pickWeighted<T>(items: [T, number][]): T {
    const total = items.reduce((a, x) => a + x[1], 0);
    let r = Math.random() * total;
    for (const [v, w] of items) {
      r -= w;
      if (r <= 0) return v;
    }
    return items[0][0];
  }

  console.log("📊 Analitika seed...");
  let totalEvents = 0;
  for (const p of PROFILES) {
    const pid = createdIds[p.name];
    if (!pid) continue;
    // Har profil uchun 14 kunlik ko'rishlar (o'sish tendensiyasi bilan)
    const baseViews = Math.floor(p.views * 0.12); // ~12% so'nggi 14 kunda
    const events: {
      profileId: string; sessionId: string; type: string;
      city: string; country: string; device: string; referrer: string; createdAt: Date;
    }[] = [];
    let views = 0;
    let clicks = 0;
    for (let day = 13; day >= 0; day--) {
      // oxirgi kunlarda ko'proq
      const weight = 1 + (13 - day) * 0.12;
      const dayViews = Math.max(1, Math.round((baseViews / 14) * weight * (0.6 + Math.random() * 0.8)));
      for (let i = 0; i < dayViews; i++) {
        const at = new Date(Date.now() - day * 86_400_000 - Math.random() * 86_400_000);
        const sid = `seed-sess-${Math.random().toString(36).slice(2, 10)}`;
        events.push({
          profileId: pid, sessionId: sid, type: "view",
          city: pickWeighted(CITIES_DIST), country: "O'zbekiston",
          device: pickWeighted(DEVICES), referrer: pickWeighted(REFS), createdAt: at,
        });
        views++;
        if (Math.random() < 0.14) {
          events.push({
            profileId: pid, sessionId: sid, type: "click",
            city: events[events.length - 1].city, country: "O'zbekiston",
            device: events[events.length - 1].device, referrer: events[events.length - 1].referrer,
            createdAt: new Date(at.getTime() + 60_000),
          });
          clicks++;
        }
      }
    }
    // Bulk insert (1000 dan bo'lib)
    for (let i = 0; i < events.length; i += 1000) {
      await db.profileView.createMany({ data: events.slice(i, i + 1000) });
    }
    totalEvents += events.length;
    // Profil counterglarini analitikaga sinxronlash
    await db.profile.update({ where: { id: pid }, data: { views, clicks } });
  }
  console.log(`✅ ${totalEvents} analitika hodisasi yaratildi`);

  // Statistika va admin log
  await db.siteStats.create({ data: { id: "main", visits: 4823 } });
  await db.adminLog.create({
    data: {
      type: "info",
      message: "🏁 TopBid platformasi ishga tushdi. Ochilish aksiyasi: 2 hafta 50% chegirma!",
    },
  });
  await db.adminLog.create({
    data: {
      type: "verification",
      message: "🛡️ Verifikatsiya so'rovi: IELTS Zone\nTo'lov: 25 000 so'm (aksiya -50%)\nKontakt: @ieltszone\nHujjatlarni tekshirib, panelda tasdiqlang yoki rad eting.",
      profileId: createdIds["IELTS Zone"],
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
