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

---
Task ID: 2
Agent: Main agent (Super Z)
Task: TopBid 2-bosqich — narx darajalari, kategoriyalar, tab nomlari, verifikatsiya, dizayn yangilanishi va responsiv tuzatishlar

Work Log:
- Brend USTAR → TopBid.uz: logo "T" markasi, wordmark, metadata, footer, navbar, bot nomi @TopBidBot, payment/verify modallar
- Tab nomlari intentga asoslandi: "O'rganish" (ta'lim) / "Yollash" (IT) — hero, subtitllar, mobil menyu, footer
- 3 ta mustaqil narx darajasi (pricing.ts yadro moduli, client+server umumiy): Markazlar (min 50k/qadam 15k/TOP-1 +80k), Repetitorlar (15k/5k/+25k), IT (20k/5k/+30k); narx darajasi pool+subType dan avtomatik
- Ochilish aksiyasi: LAUNCH_DATE dan 14 kun 50% chegirma — haqiqiy to'lov 50% kam, reytingga TO'LIQ summa yoziladi; jonli countdown banner (kun:soat:daq:sek); chizilgan to'liq narx + aksiya narxi + "-50%" badge hamma joyda
- Yangi kategoriya daraxti (43 kategoriya, 9 guruh): Chet tillari/Maktab fanlari/Test tayyorlov/IT kurslar/Bolalar rivojlantirish + Dasturlash/Dizayn/Marketing/Boshqa — SelectGroup bilan guruhlangan dropdown
- Baza: Category.groupName, Profile.verifyStatus (none/pending/verified), VerificationRequest modeli (fee, status pending/approved/refunded); db push + yangi seed (15 profil, 5 verifikatsiya: 4 tasdiqlangan + 1 kutilayotgan)
- Verifikatsiya tizimi: profil detail'da CTA → afzalliklar modali → Telegram bot to'lovi (50k, aksiya 25k) → pending badge (soat ikonkasi) → admin panelda Tasdiqlash/Rad etish → ko'k "Tekshirilgan" belgi yoki refund
- Logo yuklash tuzatildi: POST /api/upload (multipart, 2MB, PNG/JPG/WEBP/GIF) → /uploads/uuid.ext → GET /api/media/[file] serve; formada drag-drop uslubidagi tugma + preview + URL alternativa
- Filtr pozitsiyalari: filtrlangan ro'yxatda LOKAL reyting ko'rsatiladi (TOP badge'lar lokal), karta ichida "Global N" chipi; "O'rinni egallash" intent sifatida global pozitsiya formaga uzatiladi
- UI psixologiyasi: ownership til ("O'rinni egallash"), narx anchoring (chizilgan narx), urgency (countdown, "aksiya tugagach normal narx"), social proof (stats bar, ko'rishlar), holder nomlari forma variantlarida ("hozir: PixelPro"), TOP-1 crown ikonkasi
- Responsiv qayta qurish: ProfileCard mobil uchun to'liq stacked layout (avatar+nom+rank → tavsif → chips → stats → 44px CTA), desktop 4 ustunli; 360/375/390/768/1280/1440 da 0 overflow
- A11y tuzatishlar (VLM audit asosida): tap-targetlar 44px (navbar, hamburger, SubTab, SelectTrigger, banner/card CTA), kontrast oshirish (stats/footer matnlar #6b5d4d/#7d6c58), devIndicators o'chirildi
- API: profiles POST 2-fazali validatsiya (top-up rejimida faqat kontakt), verify endpoint, admin/verify (approve/reject), upload, media; revenue = bidlar + tasdiqlangan verifikatsiya to'lovlari
- Dev server Prisma client yangilanishi uchun .zscripts/dev.sh bilan qayta ishga tushirildi
- E2E testlash: narx hisoblari (310k→155k, 110k→55k top-up), logo upload+serve, profil yaratish (60k reyting/30k to'lov), verifikatsiya to'lov→tasdiqlash→ko'k belgi, admin rad etish→refund, top-up (17.5k→2-o'rin), test profili o'chirish, 0 console error, lint toza

Stage Summary:
- TopBid.uz to'liq yangilandi: 3 narx darajasi + TOP-1 premium + 14 kunlik 50% aksiya (jonli countdown), 43 kategoriya 9 guruhda, O'rganish/Yollash tablari, pullik verifikatsiya (to'lov→admin tasdiq/rad + refund), fayl logo yuklash, lokal/global reyting ko'rsatkichlari, responsiv 360-1440px, a11y yaxshilanishlar
- Demo parol admin: ustar2024; real Telegram integratsiya uchun TELEGRAM_BOT_TOKEN + TELEGRAM_ADMIN_CHAT_ID env tayyor
- Revenue model: real pul (aksiya bilan) Bid yozuvlarida, reyting credit to'liq summa — statistika real daromadni ko'rsatadi
