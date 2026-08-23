"use client";

import { ArrowLeft, GraduationCap, Briefcase, Trophy, Wallet, Bot, ShieldCheck, Star, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUstarStore } from "@/lib/ustar/store";
import { PRICE_TIERS, formatCompactSom } from "@/lib/ustar/constants";

/** "Haqida" sahifasi */
export function AboutView() {
  const { setView } = useUstarStore();

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

      <header className="mt-6 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#d97b29] flex items-center justify-center text-white font-extrabold text-2xl shadow-md shadow-[#d97b29]/30">
          T
        </div>
        <h1 className="mt-4 text-2xl md:text-3xl font-extrabold text-[#241c14]">TopBid nima?</h1>
        <p className="mt-3 text-sm md:text-base text-[#6b5d4d] leading-relaxed">
          TopBid — O'zbekistondagi ta'lim (repetitorlar, o'quv markazlari) va IT sohasi
          mutaxassislarini birlashtirgan pullik reyting platformasi. Bizneslar o'z
          profilingizni reytingga qo'shadi, yuqori o'rin uchun raqobat qiladi — foydalanuvchilar
          esa eng yaxshilarni bir joyda topadi.
        </p>
      </header>

      {/* Qanday ishlaydi */}
      <section className="mt-8">
        <h2 className="font-extrabold text-lg text-[#241c14] mb-4">Qanday ishlaydi?</h2>
        <div className="space-y-3">
          <Step
            num={1}
            icon={<Trophy className="w-5 h-5 text-[#d97b29]" />}
            title="O'ringa da'vo qiling"
            text="Profilingizni qo'shing va maqsadli o'rinni tanlang. Har bir o'rin o'z narxiga ega — yuqori o'rin ko'proq ko'rinadi va ko'proq mijoz olib keladi."
          />
          <Step
            num={2}
            icon={<Wallet className="w-5 h-5 text-[#d97b29]" />}
            title="Telegram bot orqali to'lang"
            text="To'lovlar Telegram to'lov boti orqali qabul qilinadi (karta, Payme, Click). Bir xil kontakt bilan qayta to'lov qilsangiz, yangi profil ochilmaydi — summa mavjud profilingizga qo'shiladi."
          />
          <Step
            num={3}
            icon={<TrendingUp className="w-5 h-5 text-[#d97b29]" />}
            title="Raqobat qiling"
            text="Boshqalar sizning o'rinngizni o'tib ketishi mumkin. «O'rinni egallash» tugmasi kerakli summani avtomatik hisoblab beradi — siz faqat tasdiqlaysiz."
          />
          <Step
            num={4}
            icon={<Users className="w-5 h-5 text-[#d97b29]" />}
            title="Mijozlar bilan tanishing"
            text="Foydalanuvchilar profilingizni ko'radi, sharhlarni o'qiydi va bog'lanadi. Har bir ko'rish va klik statistikada aks etadi."
          />
        </div>
      </section>

      {/* Ikki yo'nalish */}
      <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl bg-[#fdeedd] flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-[#d97b29]" />
          </div>
          <h3 className="font-extrabold text-[#241c14] mt-3">O'rganish</h3>
          <p className="text-[13px] text-[#6b5d4d] leading-relaxed mt-1.5">
            Repetitor, ta'lim markazi va kurslar reytingi. Chet tillari, maktab fanlari,
            test tayyorlov, IT kurslar va bolalar rivojlantirish — 40+ yo'nalish.
          </p>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl bg-[#fdeedd] flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-[#d97b29]" />
          </div>
          <h3 className="font-extrabold text-[#241c14] mt-3">Yollash</h3>
          <p className="text-[13px] text-[#6b5d4d] leading-relaxed mt-1.5">
            IT mutaxassislar va frilanserlar reytingi. Dasturlash, dizayn, marketing va
            boshqa yo'nalishlar — tayyor mutaxassisni toping yoki o'zingizni taklif qiling.
          </p>
        </div>
      </section>

      {/* Narxlar */}
      <section className="mt-8">
        <h2 className="font-extrabold text-lg text-[#241c14] mb-4">Narx darajalari</h2>
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-4 gap-2 px-4 py-3 bg-[#f6efe6] text-[10px] md:text-[11px] font-extrabold uppercase tracking-wide text-[#574634]">
            <span className="col-span-2">Daraja</span>
            <span className="text-right">Min. taklif</span>
            <span className="text-right">Qadam</span>
          </div>
          {Object.values(PRICE_TIERS).map((t) => (
            <div
              key={t.label}
              className="grid grid-cols-4 gap-2 px-4 py-3 border-t border-[#f0e6da] text-[12px] md:text-[13px]"
            >
              <span className="col-span-2 font-extrabold text-[#241c14]">{t.label}</span>
              <span className="text-right font-bold text-[#574634] tabular-nums">
                {formatCompactSom(t.min)}
              </span>
              <span className="text-right font-bold text-[#574634] tabular-nums">
                {formatCompactSom(t.step)}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-[#94836f] font-medium mt-2 leading-relaxed">
          TOP-1 o'rin uchun qo'shimcha premium to'lanadi (markazlar: 80 000, repetitorlar: 25 000,
          IT: 30 000 so'm). Ochilish aksiyasi davrida barcha narxlar 50% arzon.
        </p>
      </section>

      {/* Ishonch features */}
      <section className="mt-8">
        <h2 className="font-extrabold text-lg text-[#241c14] mb-4">Nega TopBid?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Feature
            icon={<Star className="w-5 h-5 text-[#d97b29]" />}
            title="Bepul sharhlar"
            text="Har bir profilga haqiqiy mijozlar baho va sharh qoldiradi — reytingga ta'sir qilmaydi, faqat ishonch uchun."
          />
          <Feature
            icon={<Bot className="w-5 h-5 text-[#d97b29]" />}
            title="Telegram integratsiyasi"
            text="To'lovlar bot orqali, yangi profil va verifikatsiya haqida admin guruhga avtomatik xabar boradi."
          />
          <Feature
            icon={<ShieldCheck className="w-5 h-5 text-[#d97b29]" />}
            title="Tekshirilgan profil"
            text="Diplom yoki litsenziyani tasdiqlagan profillar ko'k «Tekshirilgan» belgisini oladi — mijozlar ishonchi 2-3 barobar oshadi."
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-8">
        <h2 className="font-extrabold text-lg text-[#241c14] mb-4">Ko'p so'raladigan savollar</h2>
        <div className="space-y-2.5">
          <Faq
            q="Reytingda qanday yuqoriga chiqaman?"
            a="Har qanday kartochkadagi «O'rinni egallash» tugmasini bosing — tizim kerakli summani avtomatik hisoblaydi. To'lovdan so'ng profilingiz tanlagan o'ringa ko'tariladi."
          />
          <Faq
            q="Mening o'rinimni boshqa olib tashlasa-chi?"
            a="Reyting — jonli auksion. Kimdir sizdan ko'proq to'lasa, siz bir pog'ona pastga tushasiz, lekin profilingiz reytingdan chiqib ketmaydi."
          />
          <Faq
            q="Ochilish aksiyasi qanday ishlaydi?"
            a="Birinchi 2 hafta barcha narxlarga 50% chegirma qo'llanadi — to'lagan summingiz kamayadi, lekin reytingga to'liq summa yoziladi. Aksiya tugagach narxlar avtomatik normal holatga qaytadi."
          />
          <Faq
            q="Verifikatsiya qancha turadi?"
            a="Bir martalik to'lov — 50 000 so'm (aksiya davrida 25 000). To'lovdan so'ng admin hujjatlarni tekshiradi; rad etilsa, pul to'liq qaytariladi."
          />
          <Faq
            q="Sharh yozish uchun pul kerakmi?"
            a="Yo'q, sharhlar mutlaqo bepul. Har bir foydalanuvchi bir profilga bir marta sharh yozishi mumkin — bu soxta sharhlarning oldini oladi."
          />
        </div>
      </section>

      {/* CTA */}
      <div className="mt-10 bg-[#241c14] rounded-2xl p-6 md:p-8 text-center">
        <h2 className="text-white font-extrabold text-xl md:text-2xl">O'z o'riningizni egallang</h2>
        <p className="text-[#c4b5a1] text-sm mt-2 max-w-sm mx-auto leading-relaxed">
          Reytingda 1-o'rin — eng ko'p ko'rilgan joy. Aksiya davrida narxlar 50% arzon.
        </p>
        <Button
          onClick={() => setView({ name: "add-profile" })}
          className="mt-5 bg-[#d97b29] hover:bg-[#e8944a] text-white font-extrabold rounded-xl h-11 px-6"
        >
          O'rin olish
        </Button>
      </div>
    </div>
  );
}

function Step({ num, icon, title, text }: { num: number; icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-4 md:p-5 flex gap-4">
      <div className="flex flex-col items-center gap-2 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-[#fdeedd] flex items-center justify-center">{icon}</div>
        <span className="text-[10px] font-extrabold text-[#c4b5a1]">{num}-qadam</span>
      </div>
      <div>
        <h3 className="font-extrabold text-[#241c14]">{title}</h3>
        <p className="text-[13px] text-[#6b5d4d] leading-relaxed mt-1">{text}</p>
      </div>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-4">
      <div className="w-9 h-9 rounded-lg bg-[#fdeedd] flex items-center justify-center">{icon}</div>
      <h3 className="font-extrabold text-sm text-[#241c14] mt-2.5">{title}</h3>
      <p className="text-xs text-[#6b5d4d] leading-relaxed mt-1.5">{text}</p>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="bg-white border border-border rounded-xl group">
      <summary className="px-4 py-3.5 font-bold text-sm text-[#241c14] cursor-pointer list-none flex items-center justify-between gap-2">
        {q}
        <span className="text-[#d97b29] font-extrabold text-lg group-open:rotate-45 transition-transform leading-none">
          +
        </span>
      </summary>
      <p className="px-4 pb-4 text-[13px] text-[#6b5d4d] leading-relaxed">{a}</p>
    </details>
  );
}
