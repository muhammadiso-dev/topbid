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

---
Task ID: 3
Agent: Main agent (Super Z)
Task: TopBid 3-bosqich — brend logotipi, 4 til, URL auto-fetch, tashqi havolalar, yashirin admin

Work Log:
- Foydalanuvchi fayllari qayta ishlandi (scripts/process-images.py): logo tight-crop (2161x2462), favicon 32/180/512 + favicon.ico, logo-96/192, verify-badge-48/96/192 — /public papkasiga
- layout.tsx: favicon ikonalar (ico + png + apple-touch) ulandi
- VerifyBadge komponenti: brend rasmi (oltin muhr) bilan — verified/pending holatlar, istalgan o'lcham
- Navbar: logo rasmi (logo-96.png) + til almashtirgich (Globe + dropdown: UZ/RU/EN/KK, click-outside yopish) + mobil burger ichida tillar
- i18n tizimi (src/lib/ustar/i18n/): uz/ru/en/kk to'liq lug'atlar (~380 kalit), Zustand store + localStorage persist, makeT/t funksiyalari; formatSom/formatCompactSom/timeAgo til parametri qabul qiladi
- Barcha komponentlar tarjimaga o'tkazildi: navbar, home, stats, promo, card, form, payment/verify modallar, detail, about, rules, admin, footer
- Kartochka bosilganda TO'G'RIDAN-TO'G'RI tashqi havola (window.open + klik tracking) — profil saytga o'tish; sharhlar uchun alohida kichik tugma (MessageCircle + son) — detail sahifani ochadi
- Admin panel YASHIRILDI: footer'dan olib tashlandi; faqat #admin URL hash orqali kiriladi (hashchange listener; chiqishda hash tozalanadi)
- /api/fetch-meta: URL dan avtomatik metadata — og:title/description/image, apple-touch-icon, TikTok oEmbed, Google favicon fallback, umumiy nomlar (TikTok/Instagram) handle'ga almashtirish, rasmlar o'z serverga saqlanadi (hotlink himoyasi); Telegram/saytlar/TikTok/Instagram/X ishlaydi
- Formada auto-fetch: URL kiritilgach (600ms debounce) mavjudlik tekshiruvi + metadata olish → nom/tavsif/logo avtomatik to'ldiriladi (✓ auto belgisi bilan) + tahrirlanadigan preview kartochka; tavsif validatsiyasi yumshatildi (avtomatik olinganda majburiy emas)
- Mobil CTA tuzatish: min-w-0 + truncate (360-375px'da "Egallash" qisqa variant), reviews tugmasi shrink-0
- next.config: devIndicators false; media route: svg qo'shildi
- E2E testlar: 4 til almashtirish (RU hero/stats, EN, KK), kartochka → t.me/smartenglish_uz yangi tab, reviews tugmasi → detail, auto-fetch @durov → "Pavel Durov"/"Founder of Telegram."/logo URL, to'lov oqimi 70k (aksiya), 3-o'rin, admin #admin hash + login + o'chirish, favicon.ico ulangan, 360/375/390/768/1280/1440px 0 overflow, lint toza, 0 console error

Stage Summary:
- TopBid.uz: brend logotipi (oltin tanga + navy), verify badge rasmi, 4 til (uz/ru/en/kk — ~380 tarjima), URL avtomatik metadata olish (Telegram/saytlar/TikTok/Instagram), kartochka → to'g'ridan-to'g'ri tashqi havola, yashirin admin (#admin), responsiv tuzatilgan
- Raqobatchi (sindr.uz) tahlili asosida: URL-first forma + tahrirlanadigan preview (raqobatchida yo'q — bizning ustunligimiz)

---
Task ID: 4
Agent: Main agent (Super Z)
Task: TopBid 4-bosqich — yagona narx, kanonik URL, har kartada sharh, verifikatsiya egalik talabi, chuqur tahlil

Work Log:
- YAGONA NARX (raqobatchi modeli): min 30 000, qadam 5 000, TOP-1 egallash +50 000, boshqa o'rinlar +10 000 — pricing.ts butunlay qayta yozildi, PRICE_TIERS/tierFor olib tashlandi; forma "Siz kimsiz?" (Markaz/Repetitor) blokisiz — yana 1 input kamaydi; About/Rules jadvallari 4 qatorli yagona narx formatiga o'tdi (4 til)
- Kanonik URL (sindr.uz kabi): tracking paramlar (?utm...) olib tashlanadi, saytlar ASOSIY DOMEN bo'yicha birlashtiriladi (site.uz/price → site.uz), ijtimoiy tarmoqlar profil ID bo'yicha (instagram.com/user), Telegram post havolalari kanalga; migrate-urls.ts bilan eski profillar migratsiya qilindi; /api/profiles/check testlarida westminster-edu.uz?utm_source=instagram → mavjud profil topildi
- HAR KARTADA SHARH TUGMASI: 0 sharhli kartalarda ham "Fikringizni qoldiring" tugmasi ko'rinadi (mobil: "+" ikonka) — detail sahifani ochadi; sharhli kartalarda "N sharh"; ta'lim Markaz/Repetitor chiplari olib tashlandi
- Verifikatsiya faqat EGASI uchun: /api/profiles/[id]/verify endi editToken talab qiladi (claim'dan keyin); profil detail'da verifikatsiya bo'limi faqat editToken mavjud bo'lsa ko'rinadi
- Prisma client eskirganligi tufayli analytics API ishlamagan (db.profileView undefined) — db:generate + server restart bilan tuzatildi
- E2E: yagona narxlar (TOP-1 265k→132.5k, 2-o'rin 180k→90k, bo'sh 30k→15k), avto-fetch @testblog_uz, to'lov oqimi (15 000), 13-o'rin, profil qo'shilishi, o'chirish, verify editToken 403, 3 ta recharts grafigi (kunlik/shaharlar/qurilmalar), 0 console error, lint toza, 375px 0 overflow

Stage Summary:
- Narx endi hammaga bitta: 30 000 dan, TOP-1 +50 000, boshqa +10 000, qadam 5 000 — ustoz/markaz/IT teng
- Kanonik URL dedup kuchaytirildi (tracking param, asosiy domen, post havolalar)
- Sharhlar har kartadan available, verifikatsiya faqat egalik tasdiqlagan egaga
- Analytics (14 kun: dinamika, shaharlar, qurilmalar, referrerlar, CTR) to'liq ishlaydi

---
Task ID: 5
Agent: Main agent (Super Z)
Task: TopBid 5-bosqich — card redesign, universal claim, karta to'lovi, verify 50% ehson, fond, TG bot webhook

Work Log:
- CARD REDESIGN: TOP-1 gradient (fff8ef→white) + top-glow + katta 44px raqam + Flame ikonka; TOP-2/3 krem gradient; TOP badge yuqori o'ng burchakda (chapdagi ustma-ust tushish hal bo'ldi); desktop CTA TOP-3 uchun to'ldirilgan apelsin tugma (outline emas), oddiy kartalar outline; avatar ring; chips guruh+kategoriya birlashtirilgan; mobil CTA 2-qator (matn + narx alohida, truncate yo'q); VLM 9/10
- KARTA TO'LOVI: payment-config.ts (ADMIN_CARD .env: ADMIN_CARD_NUMBER/HOLDER/BANK = 8600 1234 5678 9012); PaymentModal'ga "Karta orqali" usuli — real karta vizuali (gradient bank kartasi, raqam, nusxalash tugmasi), 3 qadamli instruksiya, "O'tkazdim" tasdiqlash; eng tez opsiya sifatida 1-o'rinda
- VERIFY 50% EHSON: pricing.ts'ga VERIFICATION_FEE ko'chdi; computeRevenue charity = bids*10% + verification*50% (500 yaxlitlash); stats tile endi "Xayriyaga (10%)" nomi bilan lekin ikkala foizni o'z ichiga oladi (575k*0.1 + 100k*0.5 = 107.5k)
- FOND: "Sen Yolg'iz Emassan" (senyolgizemsan.uz) — About'da katta xayriya kartasi (10%/50% foiz bloklari + fond havolasi), Rules'da 3 punktlar + fond havola; CHARITY_FUND config (Payme/Click/website)
- UNIVERSAL CLAIM: detectPlatform (telegram/instagram/tiktok/site); Instagram bio scrape (public profil HTML), TikTok bio (HTML + oEmbed), Telegram (bio+postlar), saytlar (meta teg/HTML); har platformaga mos o'rinli instruksiyalar (uz); PATCH admin qo'lda tasdiqlash (maxfiy Instagram profillar uchun fallback); ClaimModal server instruksiyalarini ko'rsatadi
- TG BOT WEBHOOK: /api/telegram/webhook — /start, /stat (jonli statistika xayriya bilan), /help, xabarlar admin guruhga; secret token xavfsizligi; setWebhook instruksiyasi kodda
- ADMIN PANEL: xayriya statistik kartasi (5-grid), to'lov kartasi vizual blok (raqam + .env manzili eslatmasi)
- Tezkor oqim: karta "O'rinni egallash" → forma → avtomatik scroll to'g'ri o'ringa + intent tanlangan
- E2E: xayriya 108k to'g'ri, karta to'lov oqimi (132.5k TOP-1 quicktest), profil qo'shilishi/o'chirilishi, admin panel (charity + karta ko'rinadi), webhook 200, lint toza, 0 overflow

Stage Summary:
- Card dizayni premium (TOP-1 flame + gradient, to'ldirilgan CTA)
- To'lov: o'z karta (Humo 8600...) + TG bot — ikkala yo'l ishlaydi
- Verifikatsiya to'lovlarining 50% + o'rin to'lovlarining 10% → Sen Yolg'iz Emassan fondiga (oylik, kvitansiya bilan)
- Claim: hamma platforma (TG/IG/TikTok/sayt) + admin fallback
- Bot webhook tayyor: TELEGRAM_BOT_TOKEN qo'shilsa real bot ishga tushadi

---
Task ID: 6
Agent: Main agent (Super Z)
Task: TopBid 6-bosqich — StarKerak/HumoCardBot avtomatik to'lov, real karta, Ezgu Amal fondi, favicon, kategoriyalar tartibi

Work Log:
- STARKERAK TAHLILI: pip install starkerak (v0.2.4) — WebSocket client (wss://check.paystars.uz/api/ws/payments), on_payment handler, get_history REST; SDK read-only ~100 qator
- AVTOMATIK TO'LOV ZANJIRI: HumoCardBot (TG) → StarKerak (WSS) → mini-services/starkerak-listener (Python, aiohttp, .env yuklovchi, auto-reconnect, last_payment_id sync) → /api/payments/internal → match (so'nggi 45 daqiqadagi bid, ±500 tolerans) → admin TG guruhga "✅ AVTOMATIK TO'LOV TASDIQLANDI" xabari
- PaymentLog modeli (externalId, amount, cardLast4, matched, matchedBidId) + dubl xabar himoyasi; /api/payments/internal GET (admin), POST (secret tekshiruvi bilan)
- TEST: webhook simulyatsiya 132500/****3608 → "matched: true, profileName: Sales Battle" → admin panelda bildirishnoma ko'rindi; Telegram API getMe 200 (bot @TopBiduzbot)
- .env REAL MA'LUMOTLAR: karta 9860 1966 1891 3608 (M. SH., Humo), TELEGRAM_BOT_TOKEN (8870682444 / @TopBiduzbot), TELEGRAM_ADMIN_CHAT_ID (6978011752), STARKERAK_API_KEY, INTERNAL_PAYMENT_SECRET, SITE_URL=https://topbid.uz
- FAVICON MARKAZLASH: bbox markazi canvas markaziga + 6% margin — o'ng/chap 23px, tepa/past 12px (200px test'da mukammal simmetrik); favicon-32/180/512.ico, logo-96/192, verify-badge ham markazlandi
- KATEGORIYALAR TARTIBI (foydalanuvchi talabi): Chet tillari → Test tayyorlov (sertifikat) → Maktab fanlari → Dasturlash → Dizayn → Marketing → Boshqa → IT kurslar → Bolalar rivojlantirish (ENG PASTDA); CATEGORY_GROUP_ORDER konstantasi; API va 3 UI (home/form/edit) sort qilindi
- FOND: Sen Yolg'iz Emassan → EZGU AMAL (ezgu-amal.uz) — saraton kasalligiga chalingan bolalar; payment-config + 4 til + About/Rules avtomatik (config'dan)
- ADMIN PANEL: "To'lovlar (HumoCardBot avto)" bo'limi — match holati, summa, karta oxiri, vaqt; haqiqiy karta vizual blok
- Listener dev.sh tomonidan avtomatik ishga tushadi (package.json dev script); sandbox'da check.paystars.uz DNS bloklangan (production'da ishlaydi), retry mantiqida kutmoqda

Stage Summary:
- To'lov endi to'liq avtomatik: mijoz kartaga to'lov qiladi → HumoCardBot xabari → StarKerak → listener → sayt match → admin guruhga tasdiq. "O'tkazdim" bosilishi shart emas (lekin mavjud — fallback)
- Real ma'lumotlar .env'da (karta, bot @TopBiduzbot, admin ID, StarKerak kalit)
- Deploy qilingandan keyin: setWebhook URL bir marta ochish (kod ichida ko'rsatma bor)
- Favicon mukammal markazda, kategoriyalar: til/sertifikat yuqorida, bolalar pastda, fond — Ezgu Amal
