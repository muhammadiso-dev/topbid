# Worklog

---
Task ID: 1
Agent: Main agent (Super Z)
Task: Ustar — ta'lim va IT mutaxassislar uchun pullik reyting platformasini to'liq qurish (sindr.uz uslubida)

Work Log:
- fullstack-dev skill yuklandi, Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui + Prisma (SQLite) muhiti inicializatsiya qilindi
- Prisma sxemasi yozildi: Category, Profile (totalBid, verified, clicks, views), Bid (paid/refunded), Review (profileId+sessionId unikal), SiteStats, AdminLog — db:push bilan bazaga surildi
- Dizayn tizimi: globals.css (kremsimon #FFFDFA fon, apelsin #D97B29 aksent, iliq palitra), Manrope shrifti, layout.tsx (uz lang, SEO metadata)
- Yordamchi modullar: constants.ts (MIN_BID=20k, INCREMENT=10k, shaharlar, formatlash), store.ts (Zustand view-router + sessionId), telegram.ts (notifyAdmin — TELEGRAM_BOT_TOKEN bo'lsa real bot, aks holda AdminLog), online.ts (in-memory onlayn treker), server.ts (reyting tartibi, narx hisoblash)
- API marshrutlar: /api/stats (GET+POST heartbeat/visit), /api/profiles (GET ro'yxat+narxlar, POST yaratish/top-up), /api/profiles/[id] (GET batafsil, POST top-up, DELETE admin+refund), /api/profiles/[id]/reviews (POST rate-limit bilan), /api/profiles/[id]/click, /api/profiles/check (kontakt mavjudligi), /api/categories, /api/admin
- Demo seed (scripts/seed.ts): 20 kategoriya, 15 profil (ta'lim markazlari/repetitorlar + IT), 16 sharh, statistika
- UI komponentlar (src/components/ustar/): navbar, stats-bar (onlayn/tashrif/daromad/profillar), home-view (pool toggle, Markaz/Repetitor sub-tablar, fan+shahar filtrlari, skeleton, empty state), profile-card (TOP-1/2/3 ramkali katta kartochkalar, o'rin raqami, narx, «Bu o'rinni ol»), add-profile-view (3 qadamli forma, o'rin tanlash narxlar bilan, kontakt dubl-tekshiruvi banneri), payment-modal (Telegram bot simulyatsiyasi: usul -> bot chat -> to'lov -> muvaffaqiyat), profile-detail-view (statistika, bog'lanish tugmasi klik-tracking, sharhlar + rate-limit), about-view, rules-view, admin-view (parol login, Telegram guruh ko'rinishidagi bildirishnomalar, o'chirish+refund), footer
- Agent Browser orqali E2E testlash: reyting ko'rinishi, IT pool, profil batafsil, sharh yozish + rate-limit (409), profil yaratish to'lov oqimi (20k, 10-o'rin), top-up oqimi (55k, 5-o'rin), admin login/bildirishnomalar/o'chirish+refund (190k qaytarildi), filtrlar (Repetitor/Markaz, IELTS, Samarqand+empty state), Haqida/Qoidalar, mobil (390px, overflow yo'q), sticky footer, 0 console error
- VLM skrinshot tahlili asosida tuzatishlar: tavsif leading-normal, TOP-2/3 border-2 + top-soft shadow, top-glow kuchaytirildi

Stage Summary:
- To'liq ishlaydigan Ustar platformasi: /home/z/my-project (Next.js, bitta / route, client-side view router)
- Barcha asosiy funksiyalar tayyor va brauzerda testlangan: 2 mustaqil reyting havzasi, filtrlash, auksion mantig'i (MIN_BID=20k, +10k qadam), bir xil kontaktga top-up, Telegram to'lov boti simulyatsiyasi (real integratsiya uchun TELEGRAM_BOT_TOKEN/TELEGRAM_ADMIN_CHAT_ID env), bepul sharhlar (sessiya bo'yicha rate-limit), «Tekshirilgan» belgisi (seed'da ko'rinadi), admin panel (parol: ustar2024, .env ADMIN_PASSWORD bilan almashtiriladi), jonli statistika (onlayn/tashrif/daromad)
- Demo ma'lumotlar seed qilingan; qayta yuklash: bun run scripts/seed.ts
- Lint toza, dev server ishlayapti, brauzerda xatosiz
