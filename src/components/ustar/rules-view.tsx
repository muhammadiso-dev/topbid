"use client";

import { ArrowLeft, Check, X, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUstarStore } from "@/lib/ustar/store";
import { MIN_BID, BID_INCREMENT } from "@/lib/ustar/constants";

/** "Qoidalar" sahifasi */
export function RulesView() {
  const { setView } = useUstarStore();

  const allowed = [
    "Haqiqiy ta'lim markazlari, repetitorlar va IT mutaxassislar",
    "Aniq va to'g'ri profil ma'lumotlari (nom, shahar, tavsif)",
    "Faol kontakt havolasi (Telegram, Instagram yoki sayt)",
    "Sifatli xizmat va mijozlar bilan halol munosabat",
    "O'z profilingizni muntazam yangilab borish",
  ];

  const forbidden = [
    "Soxta ma'lumot yoki boshqa biznes nomidan profil yuritish",
    "Nusxa/o'g'irlangan kontent va tasodifiy havolalar",
    "Spam, firibgarlik va noqonuniy xizmatlar reklaması",
    "Soxta sharhlar yozish yoki buyurtma qilish",
    "Bir xil biznes uchun bir nechta profil ochish",
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16">
      <div className="pt-6 md:pt-8">
        <Button
          variant="ghost"
          onClick={() => setView({ name: "home" })}
          className="rounded-lg hover:bg-[#f6efe6] text-[#574634] font-bold gap-1.5 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Reytingga qaytish
        </Button>
      </div>

      <header className="mt-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#fdeedd] flex items-center justify-center shrink-0">
          <ScrollText className="w-6 h-6 text-[#d97b29]" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#241c14]">Reyting qoidalari</h1>
          <p className="text-xs md:text-sm text-[#6b5d4d] mt-0.5">
            Oxirgi yangilanish: 2026-yil
          </p>
        </div>
      </header>

      {/* Auksion qoidalari */}
      <section className="mt-7 bg-white border border-border rounded-2xl p-5 md:p-6">
        <h2 className="font-extrabold text-[#241c14] flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#d97b29] text-white text-xs font-extrabold flex items-center justify-center">1</span>
          Auksion qoidalari
        </h2>
        <ul className="mt-4 space-y-2.5 text-[13px] md:text-sm text-[#574634] leading-relaxed">
          <li className="flex gap-2.5">
            <span className="text-[#d97b29] font-extrabold">•</span>
            Reytingdagi o'rin jami to'langan summa ({MIN_BID.toLocaleString("ru-RU")} so'mdan boshlanadi) bo'yicha shakllanadi.
          </li>
          <li className="flex gap-2.5">
            <span className="text-[#d97b29] font-extrabold">•</span>
            Biror o'rinni egallash uchun shu o'rin egasidan kamida {BID_INCREMENT.toLocaleString("ru-RU")} so'm ko'p to'lash kerak — «Bu o'rinni ol» tugmasi summani avtomatik hisoblaydi.
          </li>
          <li className="flex gap-2.5">
            <span className="text-[#d97b29] font-extrabold">•</span>
            Teng summalarda ilgari to'lov qilgan profil yuqorida qoladi.
          </li>
          <li className="flex gap-2.5">
            <span className="text-[#d97b29] font-extrabold">•</span>
            Bir xil kontakt havolasi bilan qayta to'lov qilinsa, yangi profil ochilmaydi — summa mavjud profilga qo'shiladi va o'rin yangilanadi.
          </li>
          <li className="flex gap-2.5">
            <span className="text-[#d97b29] font-extrabold">•</span>
            Profilning reytingdagi o'rni faqat to'lovlar orqali o'zgaradi — sharhlar o'ringa ta'sir qilmaydi.
          </li>
        </ul>
      </section>

      {/* Ruxsat etilgan / taqiqlangan */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <section className="bg-white border border-border rounded-2xl p-5">
          <h2 className="font-extrabold text-[#241c14] flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-green-100 text-green-700 flex items-center justify-center">
              <Check className="w-3.5 h-3.5" />
            </span>
            Ruxsat etilgan
          </h2>
          <ul className="mt-3.5 space-y-2">
            {allowed.map((a) => (
              <li key={a} className="flex gap-2 text-[13px] text-[#574634] leading-relaxed">
                <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                {a}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white border border-border rounded-2xl p-5">
          <h2 className="font-extrabold text-[#241c14] flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-red-100 text-red-600 flex items-center justify-center">
              <X className="w-3.5 h-3.5" />
            </span>
            Taqiqlangan
          </h2>
          <ul className="mt-3.5 space-y-2">
            {forbidden.map((f) => (
              <li key={f} className="flex gap-2 text-[13px] text-[#574634] leading-relaxed">
                <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* To'lov va qaytarish */}
      <section className="mt-4 bg-white border border-border rounded-2xl p-5 md:p-6">
        <h2 className="font-extrabold text-[#241c14] flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#d97b29] text-white text-xs font-extrabold flex items-center justify-center">2</span>
          To'lov va qaytarish
        </h2>
        <ul className="mt-4 space-y-2.5 text-[13px] md:text-sm text-[#574634] leading-relaxed">
          <li className="flex gap-2.5">
            <span className="text-[#d97b29] font-extrabold">•</span>
            Barcha to'lovlar Telegram to'lov boti orqali qabul qilinadi (Payme, Click, karta).
          </li>
          <li className="flex gap-2.5">
            <span className="text-[#d97b29] font-extrabold">•</span>
            To'lov tasdiqlangach, o'rin darhol yangilanadi.
          </li>
          <li className="flex gap-2.5">
            <span className="text-[#d97b29] font-extrabold">•</span>
            Qoidabuzar profil admin tomonidan o'chirilganda, to'lovlar to'liq qaytariladi.
          </li>
          <li className="flex gap-2.5">
            <span className="text-[#d97b29] font-extrabold">•</span>
            Xohishingiz bilan profilingizni o'chirishingiz mumkin — unda oxirgi to'lov qaytariladi.
          </li>
        </ul>
      </section>

      {/* Sharh qoidalari */}
      <section className="mt-4 bg-white border border-border rounded-2xl p-5 md:p-6">
        <h2 className="font-extrabold text-[#241c14] flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#d97b29] text-white text-xs font-extrabold flex items-center justify-center">3</span>
          Sharh qoidalari
        </h2>
        <ul className="mt-4 space-y-2.5 text-[13px] md:text-sm text-[#574634] leading-relaxed">
          <li className="flex gap-2.5">
            <span className="text-[#d97b29] font-extrabold">•</span>
            Sharhlar bepul — har bir foydalanuvchi bir profilga faqat bir marta sharh yozadi.
          </li>
          <li className="flex gap-2.5">
            <span className="text-[#d97b29] font-extrabold">•</span>
            Haqiqiy tajribangizga asoslanib yozing: haqorat, spam va reklama o'chiriladi.
          </li>
          <li className="flex gap-2.5">
            <span className="text-[#d97b29] font-extrabold">•</span>
            Sharh reytingdagi o'ringa ta'sir qilmaydi — u faqat boshqa foydalanuvchilar uchun qo'shimcha ma'lumot.
          </li>
        </ul>
      </section>

      {/* Tekshirilgan belgi */}
      <section className="mt-4 bg-white border border-border rounded-2xl p-5 md:p-6">
        <h2 className="font-extrabold text-[#241c14] flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#d97b29] text-white text-xs font-extrabold flex items-center justify-center">4</span>
          «Tekshirilgan» belgisi
        </h2>
        <p className="mt-3.5 text-[13px] md:text-sm text-[#574634] leading-relaxed">
          Diplom, sertifikat yoki litsenziya nusxasini yuborgan profillar ko'k rangdagi
          «Tekshirilgan» belgisini oladi. Bu — mijozlarga profilingiz haqiqiyligini
          ko'rsatadigan qo'shimcha ishonch omili. Belgini olish uchun admin bilan
          Telegram orqali bog'laning.
        </p>
      </section>

      {/* Admin huquqi */}
      <section className="mt-4 bg-[#fff9f2] border border-[#f0d5b8] rounded-2xl p-5 md:p-6">
        <h2 className="font-extrabold text-[#b25e14]">Admin nazorati</h2>
        <p className="mt-2.5 text-[13px] md:text-sm text-[#574634] leading-relaxed">
          Har bir yangi profil va to'lov haqida admin Telegram guruhiga avtomatik xabar
          oladi. Shubhali yoki qoidabuzar profil bir tugma bilan o'chiriladi, to'lov
          esa egasiga qaytariladi. Qoidalarga rioya qilmagan profilingiz ogohlantirishsiz
          reytingdan olib tashlanishi mumkin.
        </p>
      </section>
    </div>
  );
}
