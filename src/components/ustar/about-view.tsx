"use client";

import { ArrowLeft, GraduationCap, Code2, Trophy, Wallet, Bot, ShieldCheck, Star, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUstarStore } from "@/lib/ustar/store";

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
          u
        </div>
        <h1 className="mt-4 text-2xl md:text-3xl font-extrabold text-[#241c14]">
          Ustar nima?
        </h1>
        <p className="mt-3 text-sm md:text-base text-[#6b5d4d] leading-relaxed">
          Ustar — O'zbekistondagi ta'lim (repetitorlar, o'quv markazlari) va IT sohasi
          mutaxassislarini birlashtirgan pullik reyting platformasi. Bizneslar o'z
          profilingizni reytingga qo'shadi, yuqori o'rin uchun raqobat qiladi —
          foydalanuvchilar esa eng yaxshilarni bir joyda topadi.
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
            text="To'lovlar Telegram to'lov boti orqali qabul qilinadi. Bir xil kontakt bilan qayta to'lov qilsangiz, yangi profil ochilmaydi — summa mavjud profilingizga qo'shiladi."
          />
          <Step
            num={3}
            icon={<TrendingUp className="w-5 h-5 text-[#d97b29]" />}
            title="Raqobat qiling"
            text="Boshqalar sizning o'rinngizni «overtake» qilishi mumkin. «Bu o'rinni ol» tugmasi kerakli summani avtomatik hisoblab beradi — siz faqat tasdiqlaysiz."
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
          <h3 className="font-extrabold text-[#241c14] mt-3">Ta'lim reytingi</h3>
          <p className="text-[13px] text-[#6b5d4d] leading-relaxed mt-1.5">
            Ta'lim markazlari va individual repetitorlar alohida-alohida reytingda
            raqobat qiladi. IELTS, matematika, fizika va boshqa fanlar bo'yicha filtrlash mumkin.
          </p>
        </div>
        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl bg-[#fdeedd] flex items-center justify-center">
            <Code2 className="w-5 h-5 text-[#d97b29]" />
          </div>
          <h3 className="font-extrabold text-[#241c14] mt-3">IT mutaxassislar</h3>
          <p className="text-[13px] text-[#6b5d4d] leading-relaxed mt-1.5">
            Dasturchilar, dizaynerlar, marketologlar, SMM mutaxassislari va boshqalar.
            Freelancer yoki studiya — farqi yo'q, o'z xizmatingizni ko'rsating.
          </p>
        </div>
      </section>

      {/* Ishonch features */}
      <section className="mt-8">
        <h2 className="font-extrabold text-lg text-[#241c14] mb-4">Nega Ustar?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Feature
            icon={<Star className="w-5 h-5 text-[#d97b29]" />}
            title="Bepul sharhlar"
            text="Har bir profilga haqiqiy mijozlar baho va sharh qoldiradi — reytingga ta'sir qilmaydi, faqat ishonch uchun."
          />
          <Feature
            icon={<Bot className="w-5 h-5 text-[#d97b29]" />}
            title="Telegram integratsiyasi"
            text="To'lovlar bot orqali, yangi profillar haqida admin guruhga avtomatik xabar boradi."
          />
          <Feature
            icon={<ShieldCheck className="w-5 h-5 text-[#d97b29]" />}
            title="Tekshirilgan profil"
            text="Diplom yoki litsenziyani tasdiqlagan profillar ko'k «Tekshirilgan» belgisini oladi."
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-8">
        <h2 className="font-extrabold text-lg text-[#241c14] mb-4">Ko'p so'raladigan savollar</h2>
        <div className="space-y-2.5">
          <Faq
            q="Reytingda qanday yuqoriga chiqaman?"
            a="Har qanday kartochkadagi «Bu o'rni ol» tugmasini bosing — tizim kerakli summani avtomatik hisoblaydi. To'lovdan so'ng profilingiz tanlagan o'ringa ko'tariladi."
          />
          <Faq
            q="Mening o'rinimni boshqa olib tashlasa-chi?"
            a="Reyting — jonli auksion. Kimdir sizdan ko'proq to'lasa, siz bir pog'ona pastga tushasiz, lekin profilingiz reytingdan chiqib ketmaydi."
          />
          <Faq
            q="Sharh yozish uchun pul kerakmi?"
            a="Yo'q, sharhlar mutlaqo bepul. Har bir foydalanuvchi bir profilga bir marta sharh yozishi mumkin — bu soxta sharhlarning oldini oladi."
          />
          <Faq
            q="To'lovni qanday amalga oshiraman?"
            a="Barcha to'lovlar Telegram to'lov boti orqali: Payme, Click yoki karta orqali. To'lov tasdiqlangach, o'rin darhol yangilanadi."
          />
        </div>
      </section>

      {/* CTA */}
      <div className="mt-10 bg-[#241c14] rounded-2xl p-6 md:p-8 text-center">
        <h2 className="text-white font-extrabold text-xl md:text-2xl">
          O'z o'riningizni egallang
        </h2>
        <p className="text-[#c4b5a1] text-sm mt-2 max-w-sm mx-auto leading-relaxed">
          Reytingda 1-o'rin — eng ko'p ko'rilgan joy. Boshlanish narxi atigi 20 000 so'm.
        </p>
        <Button
          onClick={() => setView({ name: "add-profile" })}
          className="mt-5 bg-[#d97b29] hover:bg-[#e8944a] text-white font-extrabold rounded-xl h-11 px-6"
        >
          Profil qo'shish
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
        <span className="text-[#d97b29] font-extrabold text-lg group-open:rotate-45 transition-transform leading-none">+</span>
      </summary>
      <p className="px-4 pb-4 text-[13px] text-[#6b5d4d] leading-relaxed">{a}</p>
    </details>
  );
}
