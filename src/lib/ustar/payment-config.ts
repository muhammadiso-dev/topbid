// To'lov va ehson sozlamalari — .env orqali boshqariladi

/** Admin shaxsiy karta raqami (Humo/Uzcard) — .env: ADMIN_CARD_NUMBER */
export const ADMIN_CARD = {
  number: process.env.ADMIN_CARD_NUMBER || "8600 **** **** 1234",
  holder: process.env.ADMIN_CARD_HOLDER || "TopBid",
  bank: process.env.ADMIN_CARD_BANK || "Humo",
};

/** Xayriya fondi — Sen Yolg'iz Emassan (O'zbekistondagi eng yirik xayriya jamg'armasi) */
export const CHARITY_FUND = {
  name: "Sen Yolg'iz Emassan",
  site: "senyolgizemsan.uz",
  description:
    "O'zbekistondagi eng yirik xayriya jamg'armalaridan biri — og'ir kasal bolalar va muhtoj oilalarga yordam beradi. Har oyning boshida o'tgan oyda yig'ilgan xayriya mablag'lari jamg'arma rasmiy hisob raqamiga o'tkaziladi va kvitansiya Telegram kanalimizda e'lon qilinadi.",
  // Rasmiy to'lov usullari (jamg'arma rasmiy sahifasidan)
  payme: "Payme orqali: senyolgizemsan.uz/donate",
  click: "Click orqali: senyolgizemsan.uz/donate",
  website: "https://senyolgizemsan.uz",
};

/** Xayriya foizlari */
export const CHARITY_RATES = {
  bids: 0.1, // o'rin to'lovlarining 10%
  verification: 0.5, // verifikatsiya to'lovlarining 50%
};
