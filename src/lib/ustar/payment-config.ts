// To'lov va ehson sozlamalari — .env orqali boshqariladi

/** Admin shaxsiy karta raqami (Humo) — .env: ADMIN_CARD_NUMBER */
export const ADMIN_CARD = {
  number: process.env.ADMIN_CARD_NUMBER || "9860 1966 1891 3608",
  holder: process.env.ADMIN_CARD_HOLDER || "M. SH.",
  bank: process.env.ADMIN_CARD_BANK || "Humo",
};

/** Xayriya fondi — Ezgu Amal (ezgu-amal.uz) — saraton kasalligiga chalingan bolalarga yordam */
export const CHARITY_FUND = {
  name: "Ezgu Amal",
  site: "ezgu-amal.uz",
  description:
    "Saraton kasalligiga chalingan bolalarga yordam beruvchi xayriya jamg'armasi. Har oyning boshida o'tgan oyda yig'ilgan xayriya mablag'lari jamg'arma rasmiy hisob raqamiga o'tkaziladi va kvitansiya Telegram kanalimizda e'lon qilinadi.",
  payme: "Payme orqali: ezgu-amal.uz",
  click: "Click orqali: ezgu-amal.uz",
  website: "https://ezgu-amal.uz/uz",
};

/** Xayriya foizlari */
export const CHARITY_RATES = {
  bids: 0.1, // o'rin to'lovlarining 10%
  verification: 0.5, // verifikatsiya to'lovlarining 50%
};
