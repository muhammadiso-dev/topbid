# 🚀 TopBid.uz — Deploy Qo'llanmasi

Saytni internetga chiqarish uchun bosqichma-bosqich qo'llanma.

---

## 1. Server tanlash (tavsiya)

| Variant | Narx | Kim uchun |
|---|---|---|
| **Vercel** (tavsiya) | Bepul boshlanadi | Eng oson — Next.js uchun maxsus |
| VPS (DigitalOcean/Hetzner) | ~$6/oy | To'liq nazorat |
| Uzbek VPS (ahost/vps.uz) | ~150k/oy | O'zbekistonda tez |

## 2. Vercel deploy (eng oson, 15 daqiqa)

### 2.1. GitHub'ga yuklash
```bash
git init
git add .
git commit -m "TopBid.uz tayyor"
git remote add origin https://github.com/SEN/topbid.git
git push -u origin main
```

⚠️ `.gitignore'ga qo'shing:` `.env`, `db/`, `uploads/`, `node_modules/`

### 2.2. Vercel'da
1. [vercel.com](https://vercel.com) → GitHub repo'ni import qiling
2. **Environment Variables** (Settings → Environment Variables):

```
DATABASE_URL=file:/tmp/topbid.db
ADMIN_PASSWORD=TOPBID!2026
ADMIN_CARD_NUMBER=9860 1966 1891 3608
ADMIN_CARD_HOLDER=M. SH.
ADMIN_CARD_BANK=Humo
TELEGRAM_BOT_TOKEN=8870682444:AAFvw1TlcQwbVhQ5JpUB0oC88kvDVHPkcOQ
TELEGRAM_ADMIN_CHAT_ID=6978011752
INTERNAL_PAYMENT_SECRET=topbid_internal_2026_x7k
SITE_URL=https://topbid.uz
```

3. Deploy → 2-3 daqiqa

### 2.3. Ma'lumotlar bazasi
Vercel'da fayl bazasi o'chadi (serverless). **real foydalanish uchun:**
- [PlanetScale](https://planetscale.com) yoki [Turso](https://turso.tech) — bepul tier bor
- Yoki oddiy variant: boshlanishda Vercel'da SQLite ishlaydi (har deploy'da reset) — keyin o'tasiz

**eng oddiy boshlanish:** VPS + pm2 (pastga qarang)

## 3. VPS deploy (to'liq nazorat)

```bash
# 1. Serverga ulaning
ssh root@SERVER_IP

# 2. Node.js + bun
curl -fsSL https://bun.sh/install | bash
npm install -g pm2

# 3. Kodni yuklang
git clone https://github.com/SEN/topbid.git /var/www/topbid
cd /var/www/topbid
bun install

# 4. .env yarating (yuqoridagi o'zgaruvchilar)

# 5. Baza + build
bun run db:push
bun run build

# 6. Ishga tushirish
pm2 start "bun .next/standalone/server.js" --name topbid
pm2 save && pm2 startup

# 7. Nginx + SSL (topbid.uz uchun)
apt install nginx certbot python3-certbot-nginx
# nginx config: proxy_pass http://localhost:3000;
certbot --nginx -d topbid.uz -d www.topbid.uz
```

## 4. Telegram bot sozlash (bir marta, 5 daqiqa)

### 4.1. Webhook ulash
Brauzerda oching (bir marta):
```
https://api.telegram.org/bot8870682444:AAFvw1TlcQwbVhQ5JpUB0oC88kvDVHPkcOQ/setWebhook?url=https://topbid.uz/api/telegram/webhook
```

### 4.2. Guruhni privacy'dan chiqarish (to'lov o'qish uchun)
1. Telegram'da @BotFather oching
2. `/setprivacy` → `@TopBiduzbot` → **Disable**
3. Endi bot guruhdagi BARCHA xabarlarni o'qiydi

### 4.3. To'lov monitoring guruhini yaratish
1. Telegram'da yangi guruh yarating (masalan "TopBid To'lovlar")
2. Guruhga qo'shing:
   - **HumoCardBot** (sizning karta hisobotingiz uchun)
   - **@TopBiduzbot** (bizning bot)
3. HumoCardBot sozlamasida karta hisobotlari guruhga tushishini yoqing
4. Endi: karta pul tushdi → HumoCardBot guruhga yozadi → @TopBiduzbot o'qiydi → profil avtomatik reytingga chiqadi! ✅

## 5. DNS sozlash (topbid.uz)

Domen registrar (kimdan oldingiz):
- A record: `@` → `SERVER_IP` (yoki Vercel IP'lari)
- CNAME: `www` → `topbid.uz`

Vercel'da: Settings → Domains → `topbid.uz` qo'shing

## 6. Deploy'dan keyin tekshirish ✅

- [ ] `topbid.uz` ochilyapti
- [ ] Logo + favicon ko'rinyapti
- [ ] Profil qo'shib ko'ring (test to'lov bilan)
- [ ] `topbid.uz/#bids` → admin panel (parol: TOPBID!2026)
- [ ] Aksiya boshqaruvi ishlayapti
- [ ] Telegram guruhga test xabar yozing → admin log'da ko'rinsin
- [ ] Karta hisobotini tekshiring — to'lov avtomatik match bo'lsin
- [ ] 4 til almashadi
- [ ] Dark mode ishlaydi

## 7. Har oy qilinadigan ishlar 📅

1. **Xayriya hisoboti**: oyning 1-5 kunlari — Ezgu Amal'ga o'tkazing (ezgu-amal.uz orqali)
2. **Kvitansiya skrinshotini Telegram kanalingizga joylang** (shaffoflik uchun)
3. Admin panel → statistikani tekshiring

## 8. Xavfsizlik 🔐

- `ADMIN_PASSWORD` ni kuchli qiling (hozir TOPBID!2026)
- `INTERNAL_PAYMENT_SECRET` ni hech kimga bermang
- Bot token faqat .env'da bo'lsin
- `.env` faylni hech qachon git'ga yuklamang

## Tez yordam 🆘

| Muammo | Yechim |
|---|---|
| Sayt ochilmaydi | `pm2 logs topbid` / Vercel logs |
| Bot javob bermaydi | setWebhook URL'ni qayta oching |
| To'lov match bo'lmaydi | Admin panel → "Pul tushdi ✓" qo'lda bosing |
| Baza o'chdi | `bun run db:push` + backup oling |
