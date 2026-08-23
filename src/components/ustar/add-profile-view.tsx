"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, GraduationCap, Code2, Info, Trophy, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { PaymentModal } from "./payment-modal";
import { useUstarStore, getSessionId } from "@/lib/ustar/store";
import {
  CITIES,
  EDUCATION_SUBTYPES,
  IT_SUBTYPES,
  MIN_BID,
  formatSom,
  isValidContactUrl,
  type Pool,
} from "@/lib/ustar/constants";
import type { CategoryDTO, CreateProfileResult, PriceOptionDTO } from "@/lib/ustar/types";
import { cn } from "@/lib/utils";

/** Profil qo'shish / to'lov sahifasi — auksion mantig'i bilan */
export function AddProfileView() {
  const { setView, setPool, setHighlight, goHome } = useUstarStore();
  const { toast } = useToast();

  // Forma holati
  const [pool, setFormPool] = useState<Pool>("education");
  const [subType, setSubType] = useState("center");
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [contactUrl, setContactUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetPosition, setTargetPosition] = useState<number | null>(null);

  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [priceOptions, setPriceOptions] = useState<PriceOptionDTO[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingProfile, setExistingProfile] = useState<{
    id: string;
    name: string;
    totalBid: number;
  } | null>(null);

  // Kategoriyalarni yuklash
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d: { categories: CategoryDTO[] }) => setCategories(d.categories))
      .catch(() => null);
  }, []);

  // Kontakt allaqachon ro'yxatda bormi? (debounce bilan)
  useEffect(() => {
    const u = contactUrl.trim();
    const t = setTimeout(() => {
      if (!u || !isValidContactUrl(u)) {
        setExistingProfile(null);
        return;
      }
      fetch(`/api/profiles/check?contact=${encodeURIComponent(u)}`)
        .then((r) => r.json())
        .then((d: { exists: boolean; profile?: { id: string; name: string; totalBid: number } }) => {
          setExistingProfile(d.exists && d.profile ? d.profile : null);
        })
        .catch(() => null);
    }, 500);
    return () => clearTimeout(t);
  }, [contactUrl]);

  // Pool o'zgarganda narxlarni yangilash
  const loadPrices = useCallback((p: Pool) => {
    setLoadingPrices(true);
    fetch(`/api/profiles?pool=${p}`)
      .then((r) => r.json())
      .then((d: { priceOptions: PriceOptionDTO[] }) => {
        setPriceOptions(d.priceOptions);
        setTargetPosition(d.priceOptions[d.priceOptions.length - 1]?.position ?? 1);
      })
      .catch(() => setPriceOptions([]))
      .finally(() => setLoadingPrices(false));
  }, []);

  useEffect(() => {
    loadPrices(pool);
    setSubType(pool === "education" ? "center" : IT_SUBTYPES[0]);
    setCategoryId("");
  }, [pool, loadPrices]);

  const poolCategories = useMemo(
    () => categories.filter((c) => c.pool === pool),
    [categories, pool]
  );

  const topupMode = existingProfile !== null;

  /** O'sha o'rin uchun haqiqiy to'lov summasi (top-up rejimida farqi) */
  const amountFor = useCallback(
    (opt: PriceOptionDTO) =>
      topupMode && existingProfile
        ? Math.max(opt.price - existingProfile.totalBid, MIN_BID)
        : opt.price,
    [topupMode, existingProfile]
  );

  const selectedOption = priceOptions.find((o) => o.position === targetPosition);
  const amount = selectedOption ? amountFor(selectedOption) : 0;

  const poolLabel = pool === "education" ? "Ta'lim" : "IT mutaxassislar";
  const targetLabel = selectedOption
    ? topupMode
      ? `${selectedOption.position}-o'ringa ko'tarilish (mavjud profilga qo'shiladi)`
      : `${selectedOption.position}-o'rinni egallash`
    : "O'rin tanlanmadi";

  // Validatsiya (top-up rejimida faqat kontakt talab qilinadi)
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!contactUrl.trim() || !isValidContactUrl(contactUrl))
      e.contactUrl = "Noto'g'ri format: @username yoki https://sayt.uz ko'rinishida yozing";
    if (!topupMode) {
      if (!name.trim() || name.trim().length < 2) e.name = "Nom kamida 2 belgidan iborat bo'lsin";
      if (!categoryId) e.categoryId = "Fan / sohani tanlang";
      if (!city) e.city = "Shaharni tanlang";
      if (description.trim().length < 10) e.description = "Tavsif kamida 10 belgidan iborat bo'lsin";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openPayment = () => {
    if (validate()) setPaymentOpen(true);
  };

  // To'lov tasdiqlangach — profil yaratish
  const handlePaid = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pool,
          subType,
          categoryId,
          name,
          city,
          description,
          contactUrl,
          imageUrl,
          targetPosition: targetPosition ?? priceOptions.length,
          sessionId: getSessionId(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        throw new Error(data.error || "Xatolik yuz berdi");
      }
      const result = data as CreateProfileResult;
      toast({
        title: "🎉 To'lov qabul qilindi!",
        description: result.message,
      });
      // Muaffaqiyat: bosh sahifaga qaytish va profilni ajratib ko'rsatish
      setPool(pool);
      setHighlight(result.profile.id);
      setTimeout(() => goHome(), 400);
    } catch (err) {
      toast({
        title: "Xatolik",
        description: err instanceof Error ? err.message : "Profil qo'shishda xatolik",
        variant: "destructive",
      });
      throw err; // PaymentModal xatoni ko'rsatadi
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16">
      {/* Sarlavha */}
      <div className="pt-6 md:pt-8 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setView({ name: "home" })}
          className="rounded-lg hover:bg-[#f6efe6] text-[#574634]"
          aria-label="Orqaga"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-[#241c14]">Profil qo'shish</h1>
          <p className="text-xs md:text-sm text-[#6b5d4d] mt-0.5">
            Reytingda o'rin egallang — to'lov Telegram bot orqali
          </p>
        </div>
      </div>

      <form
        className="mt-6 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          openPayment();
        }}
      >
        {/* 1-qadam: Yo'nalish */}
        <Section
          step={1}
          title="Yo'nalish"
          hint="Qaysi sohadasiz?"
        >
          <div className="grid grid-cols-2 gap-2">
            <PoolButton
              active={pool === "education"}
              onClick={() => setFormPool("education")}
              icon={<GraduationCap className="w-4 h-4" />}
              label="Ta'lim"
              sub="Markaz yoki repetitor"
            />
            <PoolButton
              active={pool === "it"}
              onClick={() => setFormPool("it")}
              icon={<Code2 className="w-4 h-4" />}
              label="IT mutaxassis"
              sub="Dasturchi, dizayner..."
            />
          </div>

          {/* Kichik toifa */}
          <div className="mt-3">
            <Label className="text-[13px] font-bold text-[#574634] mb-1.5 block">
              {pool === "education" ? "Siz kimsiz?" : "Mutaxassislik toifasi"}
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {(pool === "education" ? EDUCATION_SUBTYPES.map((s) => ({ value: s.value, label: s.label })) : IT_SUBTYPES.map((s) => ({ value: s as string, label: s as string }))).map((st) => (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => setSubType(st.value)}
                  className={cn(
                    "px-3.5 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer",
                    subType === st.value
                      ? "bg-[#d97b29] text-white shadow-sm"
                      : "bg-white text-[#574634] border border-[#e8ddd0] hover:border-[#e0cdb4]"
                  )}
                  aria-pressed={subType === st.value}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fan / soha */}
          <div className="mt-3">
            <Label htmlFor="category" className="text-[13px] font-bold text-[#574634] mb-1.5 block">
              Fan / soha <span className="text-[#d97b29]">*</span>
            </Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v)}>
              <SelectTrigger
                className={cn(
                  "h-11 bg-white text-sm font-semibold rounded-lg",
                  errors.categoryId ? "border-red-300" : "border-[#e8ddd0]"
                )}
              >
                <SelectValue placeholder="Tanlang (masalan: IELTS, Frontend...)" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#e8ddd0] max-h-72">
                {poolCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && <FieldError msg={errors.categoryId} />}
          </div>
        </Section>

        {/* 2-qadam: Profil ma'lumotlari */}
        <Section step={2} title="Profil ma'lumotlari" hint="Reytingda shu ma'lumotlar ko'rinadi">
          <div className="space-y-3.5">
            <div>
              <Label htmlFor="name" className="text-[13px] font-bold text-[#574634] mb-1.5 block">
                Nom <span className="text-[#d97b29]">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                placeholder={
                  pool === "education"
                    ? subType === "center"
                      ? "Masalan: Smart English Academy"
                      : "Masalan: Aziza Karimova"
                    : "Masalan: CodeCraft Studio"
                }
                className={cn("h-11 bg-white text-sm font-semibold rounded-lg", errors.name ? "border-red-300" : "border-[#e8ddd0]")}
              />
              {errors.name && <FieldError msg={errors.name} />}
            </div>

            <div>
              <Label htmlFor="city" className="text-[13px] font-bold text-[#574634] mb-1.5 block">
                Shahar <span className="text-[#d97b29]">*</span>
              </Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger
                  className={cn(
                    "h-11 bg-white text-sm font-semibold rounded-lg",
                    errors.city ? "border-red-300" : "border-[#e8ddd0]"
                  )}
                >
                  <SelectValue placeholder="Shaharni tanlang" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#e8ddd0] max-h-72">
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.city && <FieldError msg={errors.city} />}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="description" className="text-[13px] font-bold text-[#574634]">
                  Qisqa tavsif <span className="text-[#d97b29]">*</span>
                </Label>
                <span
                  className={cn(
                    "text-[11px] font-bold tabular-nums",
                    description.length > 280 ? "text-red-500" : "text-[#94836f]"
                  )}
                >
                  {description.length}/300
                </span>
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={300}
                rows={3}
                placeholder="Xizmatlaringiz qisqacha: tajriba, natijalar, afzalliklar..."
                className={cn(
                  "bg-white text-sm font-medium rounded-lg resize-none leading-relaxed",
                  errors.description ? "border-red-300" : "border-[#e8ddd0]"
                )}
              />
              {errors.description && <FieldError msg={errors.description} />}
            </div>

            <div>
              <Label htmlFor="contact" className="text-[13px] font-bold text-[#574634] mb-1.5 block">
                Kontakt havolasi <span className="text-[#d97b29]">*</span>
              </Label>
              <Input
                id="contact"
                value={contactUrl}
                onChange={(e) => setContactUrl(e.target.value)}
                placeholder="@username yoki https://sayt.uz"
                className={cn("h-11 bg-white text-sm font-semibold rounded-lg", errors.contactUrl ? "border-red-300" : "border-[#e8ddd0]")}
              />
              {errors.contactUrl ? (
                <FieldError msg={errors.contactUrl} />
              ) : topupMode && existingProfile ? (
                <div className="mt-1.5 flex items-start gap-1.5 bg-[#f0f9ff] border border-[#cbe9f8] rounded-lg px-2.5 py-2">
                  <Info className="w-3 h-3 mt-0.5 shrink-0 text-[#229ed9]" />
                  <p className="text-[11px] text-[#1a6da8] font-semibold leading-snug">
                    Bu kontakt <b>{existingProfile.name}</b> nomi bilan ro'yxatda — yangi profil ochilmaydi,
                    summa ({formatSom(existingProfile.totalBid)} ustiga) mavjud profilga qo'shiladi.
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-[#94836f] font-medium mt-1.5 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-px shrink-0" />
                  Bir xil kontakt qayta kiritilsa, yangi profil ochilmaydi — summa mavjud profilga qo'shiladi.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="image" className="text-[13px] font-bold text-[#574634] mb-1.5 block">
                Logo / rasm URL <span className="text-[#94836f] font-medium">(ixtiyoriy)</span>
              </Label>
              <Input
                id="image"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... (bo'sh qoldirsangiz — avtomatik avatar)"
                className="h-11 bg-white text-sm font-semibold rounded-lg border-[#e8ddd0]"
              />
            </div>
          </div>
        </Section>

        {/* 3-qadam: O'rin tanlash (auksion) */}
        <Section
          step={3}
          title="O'rin tanlang"
          hint="Yuqori o'rin ko'proq ko'rinadi — narx raqobatga qarab shakllanadi"
        >
          {loadingPrices ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 rounded-lg bg-[#f0e6da]" />
              ))}
            </div>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto scrollbar-thin pr-1 -mr-1">
              {priceOptions.map((opt) => {
                const active = targetPosition === opt.position;
                const isTop = opt.position <= 3;
                return (
                  <button
                    key={opt.position}
                    type="button"
                    onClick={() => setTargetPosition(opt.position)}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg border-2 transition-all cursor-pointer text-left",
                      active
                        ? "border-[#d97b29] bg-[#fff9f2]"
                        : "border-[#f0e6da] bg-white hover:border-[#e0cdb4]"
                    )}
                    aria-pressed={active}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Trophy
                        className={cn(
                          "w-4 h-4 shrink-0",
                          isTop ? "text-[#d97b29]" : "text-[#c4b5a1]"
                        )}
                      />
                      <span className={cn("text-sm font-extrabold truncate", active ? "text-[#b25e14]" : "text-[#241c14]")}>
                        {opt.position}-o'rin
                        {isTop && (
                          <span className="ml-1.5 text-[10px] font-extrabold uppercase bg-[#fdeedd] text-[#b25e14] px-1.5 py-0.5 rounded-full">
                            TOP
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      {opt.price <= 20000 && !topupMode && (
                        <span className="text-[10px] font-bold text-[#94836f] uppercase tracking-wide">
                          minimal
                        </span>
                      )}
                      <span className={cn("text-sm font-extrabold tabular-nums", active ? "text-[#d97b29]" : "text-[#241c14]")}>
                        {formatSom(amountFor(opt))}
                      </span>
                      <span
                        className={cn(
                          "w-4.5 h-4.5 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0",
                          active ? "border-[#d97b29]" : "border-[#e0d3c2]"
                        )}
                      >
                        {active && <span className="w-2.5 h-2.5 rounded-full bg-[#d97b29]" />}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Umumiy hisob */}
          <div className="mt-4 bg-[#241c14] rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <CircleDollarSign className="w-5 h-5 text-[#e9a05c] shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#94836f] leading-none">
                  {topupMode ? "Qo'shiladigan summa" : "To'lov summasi"}
                </p>
                <p className="text-xs text-[#c4b5a1] font-medium mt-1 truncate">
                  {targetLabel}
                </p>
              </div>
            </div>
            <p className="text-xl md:text-2xl font-extrabold text-white tabular-nums shrink-0">
              {formatSom(amount)}
            </p>
          </div>
        </Section>

        {/* Yuborish */}
        <Button
          type="submit"
          disabled={submitting || loadingPrices}
          className="w-full h-12 bg-[#d97b29] hover:bg-[#c2691f] text-white font-extrabold rounded-xl text-base shadow-md shadow-[#d97b29]/25"
        >
          {submitting ? (
            "To'lov qilinmoqda..."
          ) : (
            <>To'lovga o'tish — {formatSom(amount)}</>
          )}
        </Button>
      </form>

      {/* To'lov modali */}
      <PaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        amount={amount}
        onPaid={handlePaid}
        summary={{ name: name || "Profil", poolLabel, targetLabel }}
      />
    </div>
  );
}

function Section({
  step,
  title,
  hint,
  children,
}: {
  step: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-border rounded-2xl p-4 md:p-5">
      <div className="flex items-start gap-3 mb-4">
        <span className="w-7 h-7 rounded-lg bg-[#fdeedd] text-[#b25e14] font-extrabold text-sm flex items-center justify-center shrink-0">
          {step}
        </span>
        <div>
          <h2 className="font-extrabold text-[#241c14] leading-none">{title}</h2>
          {hint && <p className="text-xs text-[#94836f] font-medium mt-1">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function PoolButton({
  active,
  onClick,
  icon,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1 p-3.5 rounded-xl border-2 transition-all cursor-pointer text-left",
        active ? "border-[#d97b29] bg-[#fff9f2]" : "border-[#f0e6da] bg-white hover:border-[#e0cdb4]"
      )}
      aria-pressed={active}
    >
      <span className={cn("flex items-center gap-1.5 font-extrabold text-sm", active ? "text-[#b25e14]" : "text-[#241c14]")}>
        {icon}
        {label}
      </span>
      <span className="text-[11px] text-[#94836f] font-medium">{sub}</span>
    </button>
  );
}

function FieldError({ msg }: { msg: string }) {
  return <p className="text-xs font-semibold text-red-600 mt-1.5">{msg}</p>;
}
