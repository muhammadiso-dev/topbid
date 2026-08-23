"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  GraduationCap,
  Briefcase,
  Info,
  Trophy,
  CircleDollarSign,
  ImagePlus,
  Trash2,
  Loader2,
  Crown,
  User,
  Users,
  Rocket,
  Wand2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { PaymentModal } from "./payment-modal";
import { useUstarStore, getSessionId } from "@/lib/ustar/store";
import { useI18n } from "@/lib/ustar/i18n";
import {
  CITIES,
  EDUCATION_SUBTYPES,
  PRICE_TIERS,
  formatSom,
  isValidContactUrl,
  promoInfo,
  type Pool,
  type PriceTier,
} from "@/lib/ustar/constants";
import { fullPriceForPosition, payableAmount } from "@/lib/ustar/pricing";
import type { CategoryDTO, CreateProfileResult, ProfileDTO } from "@/lib/ustar/types";
import { cn } from "@/lib/utils";

interface FetchedMeta {
  name: string;
  description: string;
  imageUrl: string | null;
  source: string;
}

/** Profil qo'shish / o'rin olish — URL dan avtomatik metadata + tier narxlar */
export function AddProfileView() {
  const { setView, setPool, setHighlight, goHome, addIntentPosition, setAddIntentPosition } =
    useUstarStore();
  const { toast } = useToast();
  const { t, lang } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Auto-fetch holati
  const [fetchState, setFetchState] = useState<"idle" | "loading" | "done" | "failed">("idle");
  const [fetchedMeta, setFetchedMeta] = useState<FetchedMeta | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);

  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [ranked, setRanked] = useState<ProfileDTO[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingProfile, setExistingProfile] = useState<{
    id: string;
    name: string;
    totalBid: number;
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  const promo = promoInfo();

  // Kategoriyalar
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d: { categories: CategoryDTO[] }) => setCategories(d.categories))
      .catch(() => null);
  }, []);

  // Pool o'zgarganda
  useEffect(() => {
    setRanked(null);
    fetch(`/api/profiles?pool=${pool}`)
      .then((r) => r.json())
      .then((d: { profiles: ProfileDTO[] }) => setRanked(d.profiles))
      .catch(() => setRanked([]));
    setSubType(pool === "education" ? "center" : "it");
    setCategoryId("");
  }, [pool]);

  // Intent pozitsiyasi
  useEffect(() => {
    if (ranked && addIntentPosition && addIntentPosition <= ranked.length + 1) {
      setTargetPosition(addIntentPosition);
      setAddIntentPosition(null);
    }
  }, [ranked, addIntentPosition, setAddIntentPosition]);

  // ===== AVTOMATIK METADATA: kontakt + mavjudlik tekshiruvi (debounce) =====
  useEffect(() => {
    const u = contactUrl.trim();
    const timer = setTimeout(() => {
      if (!u || !isValidContactUrl(u)) {
        setExistingProfile(null);
        setFetchState("idle");
        setFetchedMeta(null);
        return;
      }
      // 1) Mavjud profil tekshiruvi
      fetch(`/api/profiles/check?contact=${encodeURIComponent(u)}`)
        .then((r) => r.json())
        .then((d: { exists: boolean; profile?: { id: string; name: string; totalBid: number } }) => {
          setExistingProfile(d.exists && d.profile ? d.profile : null);
          // 2) Agar yangi profil bo'lsa — metadata avtomatik olish
          if (!d.exists) {
            setFetchState("loading");
            fetch(`/api/fetch-meta?url=${encodeURIComponent(u)}`)
              .then((r) => r.json())
              .then((m: FetchedMeta) => {
                if (m && (m.name || m.imageUrl)) {
                  setFetchedMeta(m);
                  setFetchState("done");
                  // Faqat bo'sh maydonlarni to'ldirish (foydalanuvchi yozganini buzmaymiz)
                  if (!name.trim() && m.name) setName(m.name);
                  if (!description.trim() && m.description) setDescription(m.description.slice(0, 300));
                  if (!imageUrl && m.imageUrl) setImageUrl(m.imageUrl);
                  setAutoFilled(true);
                } else {
                  setFetchState("failed");
                }
              })
              .catch(() => setFetchState("failed"));
          } else {
            setFetchState("idle");
            setFetchedMeta(null);
          }
        })
        .catch(() => null);
    }, 600);
    return () => clearTimeout(timer);
    // name/description/imageUrl ni qasddan dependency'dan chiqarmadik — faqat URL o'zgarsa
     
  }, [contactUrl]);

  // ===== Narx darajasi =====
  const tier: PriceTier = pool === "it" ? "it" : subType === "center" ? "edu_center" : "edu_individual";
  const tierInfo = PRICE_TIERS[tier];
  const topupMode = existingProfile !== null;

  const amountFor = useCallback(
    (position: number) => {
      if (!ranked) return 0;
      const full = fullPriceForPosition(ranked, position, tier);
      if (topupMode && existingProfile) {
        const credit = Math.max(full - existingProfile.totalBid, tierInfo.step);
        return payableAmount(credit, promo.active);
      }
      return payableAmount(full, promo.active);
    },
    [ranked, tier, topupMode, existingProfile, tierInfo.step, promo.active]
  );

  const fullFor = useCallback(
    (position: number) => {
      if (!ranked) return 0;
      const full = fullPriceForPosition(ranked, position, tier);
      if (topupMode && existingProfile) {
        return Math.max(full - existingProfile.totalBid, tierInfo.step);
      }
      return full;
    },
    [ranked, tier, topupMode, existingProfile, tierInfo.step]
  );

  const selectedPosition = targetPosition;
  const amount = selectedPosition ? amountFor(selectedPosition) : 0;
  const fullAmount = selectedPosition ? fullFor(selectedPosition) : 0;
  const hasPromoDiscount = promo.active && fullAmount > amount;

  const poolLabel =
    pool === "education" ? `${t("home.tabEdu")} (ta'lim)` : `${t("home.tabIt")} (IT)`;
  const targetLabel = selectedPosition
    ? topupMode
      ? `${selectedPosition}${t("form.targetTopup")}`
      : `${selectedPosition}${t("form.targetPosition")}`
    : t("form.targetNone");

  const poolCategories = useMemo(
    () => categories.filter((c) => c.pool === pool),
    [categories, pool]
  );
  const poolCategoryGroups = useMemo(() => {
    const groups = new Map<string, CategoryDTO[]>();
    for (const c of poolCategories) {
      const key = c.group || "Boshqa";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(c);
    }
    return Array.from(groups.entries());
  }, [poolCategories]);

  // ===== Logo yuklash =====
  const handleFileSelect = async (file: File | null) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: t("err.fileBig"), description: t("err.fileBigDesc"), variant: "destructive" });
      return;
    }
    if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) {
      toast({ title: t("err.fileType"), description: t("err.fileTypeDesc"), variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "upload error");
      setImageUrl(data.url);
      toast({ title: t("toast.logoUploaded"), description: t("toast.logoUploadedDesc") });
    } catch {
      toast({ title: t("err.uploadFail"), description: t("err.retry"), variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ===== Validatsiya =====
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!contactUrl.trim() || !isValidContactUrl(contactUrl))
      e.contactUrl = t("err.contact");
    if (!topupMode) {
      if (!name.trim() || name.trim().length < 2) e.name = t("err.name");
      if (!categoryId) e.categoryId = t("err.category");
      if (!city) e.city = t("err.city");
      // Avtomatik olingan tavsif qisqa bo'lishi mumkin — faqat qo'lda kiritilganda qat'iy
      if (description.trim().length < 10 && !fetchedMeta?.description) e.description = t("err.desc");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openPayment = () => {
    if (validate()) setPaymentOpen(true);
  };

  // ===== To'lov tasdiqlangach =====
  const handlePaid = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pool,
          subType: pool === "it" ? "it" : subType,
          categoryId,
          name,
          city,
          description: description || fetchedMeta?.description || name,
          contactUrl,
          imageUrl,
          targetPosition: targetPosition ?? (ranked?.length ?? 0) + 1,
          sessionId: getSessionId(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        throw new Error(data.error || "error");
      }
      const result = data as CreateProfileResult;
      toast({ title: t("toast.paidTitle"), description: result.message });
      setPool(pool);
      setHighlight(result.profile.id);
      setTimeout(() => goHome(), 400);
    } catch (err) {
      toast({
        title: t("err.generic"),
        description: err instanceof Error ? err.message : t("err.server"),
        variant: "destructive",
      });
      throw err;
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
          aria-label={t("form.back")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-[#241c14]">{t("form.title")}</h1>
          <p className="text-xs md:text-sm text-[#6b5d4d] mt-0.5">{t("form.subtitle")}</p>
        </div>
      </div>

      <form
        className="mt-6 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          openPayment();
        }}
      >
        {/* 1-qadam: Yo'nalish */}
        <Section step={1} title={t("form.step1")} hint={t("form.step1Hint")}>
          <div className="grid grid-cols-2 gap-2">
            <PoolButton
              active={pool === "education"}
              onClick={() => setFormPool("education")}
              icon={<GraduationCap className="w-4 h-4" />}
              label={t("form.eduPool")}
              sub={t("form.eduPoolSub")}
            />
            <PoolButton
              active={pool === "it"}
              onClick={() => setFormPool("it")}
              icon={<Briefcase className="w-4 h-4" />}
              label={t("form.itPool")}
              sub={t("form.itPoolSub")}
            />
          </div>

          {pool === "education" ? (
            <div className="mt-3">
              <Label className="text-[13px] font-bold text-[#574634] mb-1.5 block">
                {t("form.whoAreYou")} <span className="text-[#d97b29]">*</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EDUCATION_SUBTYPES.map((st) => {
                  const info = PRICE_TIERS[st.tier];
                  const active = subType === st.value;
                  const entry = payableAmount(info.min, promo.active);
                  return (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => setSubType(st.value)}
                      className={cn(
                        "flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all cursor-pointer text-left",
                        active
                          ? "border-[#d97b29] bg-[#fff9f2]"
                          : "border-[#f0e6da] bg-white hover:border-[#e0cdb4]"
                      )}
                      aria-pressed={active}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          active ? "bg-[#d97b29] text-white" : "bg-[#f6efe6] text-[#574634]"
                        )}
                      >
                        {st.value === "center" ? (
                          <Users className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "text-[13px] font-extrabold",
                            active ? "text-[#b25e14]" : "text-[#241c14]"
                          )}
                        >
                          {st.value === "center" ? t("form.centerLabel") : t("form.individualLabel")}
                        </p>
                        <p className="text-[11px] text-[#94836f] font-bold mt-0.5 tabular-nums">
                          {formatSom(entry, lang)}
                          {t("home.from")}
                          {promo.active && ` ${t("form.actionPromo")}`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2.5 bg-[#fdeedd] border border-[#f0d5b8] rounded-xl px-3.5 py-2.5">
              <Briefcase className="w-4 h-4 text-[#d97b29] shrink-0" />
              <p className="text-[12px] text-[#574634] font-semibold">
                {t("form.itTierNote")}{" "}
                <b className="tabular-nums">
                  {formatSom(payableAmount(PRICE_TIERS.it.min, promo.active), lang)}
                  {t("home.from")}
                </b>{" "}
                {promo.active && t("form.actionPromo")}
              </p>
            </div>
          )}

          <div className="mt-3">
            <Label htmlFor="category" className="text-[13px] font-bold text-[#574634] mb-1.5 block">
              {t("form.categoryLabel")} <span className="text-[#d97b29]">*</span>
            </Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v)}>
              <SelectTrigger
                className={cn(
                  "h-11 bg-white text-sm font-semibold rounded-lg",
                  errors.categoryId ? "border-red-300" : "border-[#e8ddd0]"
                )}
              >
                <SelectValue placeholder={t("form.categoryPlaceholder")} />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#e8ddd0] max-h-80">
                {poolCategoryGroups.map(([group, items]) => (
                  <SelectGroup key={group}>
                    <SelectLabel className="text-[11px] font-extrabold uppercase tracking-wide text-[#b25e14]">
                      {group}
                    </SelectLabel>
                    {items.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && <FieldError msg={errors.categoryId} />}
          </div>
        </Section>

        {/* 2-qadam: Profil ma'lumotlari — URL birinchi! */}
        <Section
          step={2}
          title={t("form.step2")}
          hint={t("form.step2Hint")}
        >
          <div className="space-y-3.5">
            {/* KONTAKT HAVOLASI — asosiy maydon */}
            <div>
              <Label htmlFor="contact" className="text-[13px] font-bold text-[#574634] mb-1.5 block">
                {t("form.contact")} <span className="text-[#d97b29]">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="contact"
                  value={contactUrl}
                  onChange={(e) => setContactUrl(e.target.value)}
                  placeholder={t("form.contactPlaceholder")}
                  className={cn(
                    "h-11 bg-white text-sm font-semibold rounded-lg pr-10",
                    errors.contactUrl ? "border-red-300" : "border-[#e8ddd0]"
                  )}
                />
                {/* Fetch indikatori */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {fetchState === "loading" && <Loader2 className="w-4 h-4 text-[#d97b29] animate-spin" />}
                  {fetchState === "done" && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  {fetchState === "failed" && <XCircle className="w-4 h-4 text-[#c4b5a1]" />}
                </div>
              </div>
              {errors.contactUrl ? (
                <FieldError msg={errors.contactUrl} />
              ) : fetchState === "loading" ? (
                <p className="text-[11px] text-[#b25e14] font-bold mt-1.5 flex items-center gap-1">
                  <Wand2 className="w-3 h-3" />
                  {t("fetch.loading")}
                </p>
              ) : fetchState === "done" && !topupMode ? (
                <div className="mt-2 bg-[#f0faf4] border border-[#c8ecd5] rounded-xl px-3 py-2.5">
                  <p className="text-[11px] text-[#1a7a3c] font-extrabold flex items-center gap-1">
                    <Wand2 className="w-3 h-3" />
                    {t("fetch.fetched")}
                  </p>
                  {/* Preview kartochka */}
                  {fetchedMeta && (
                    <div className="flex items-center gap-2.5 mt-2 bg-white rounded-lg p-2.5 border border-[#dcefe3]">
                      {fetchedMeta.imageUrl ? (
                         
                        <img
                          src={fetchedMeta.imageUrl}
                          alt={fetchedMeta.name}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#f6efe6] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-[13px] font-extrabold text-[#241c14] truncate">
                          {fetchedMeta.name}
                        </p>
                        <p className="text-[11px] text-[#94836f] truncate">
                          {fetchedMeta.description || contactUrl}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : fetchState === "failed" && !topupMode ? (
                <p className="text-[11px] text-[#94836f] font-medium mt-1.5 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-px shrink-0" />
                  {t("fetch.failed")}
                </p>
              ) : topupMode && existingProfile ? (
                <div className="mt-1.5 flex items-start gap-1.5 bg-[#f0f9ff] border border-[#cbe9f8] rounded-lg px-2.5 py-2">
                  <Info className="w-3 h-3 mt-0.5 shrink-0 text-[#229ed9]" />
                  <p className="text-[11px] text-[#1a6da8] font-semibold leading-snug">
                    {t("topup.banner")} <b>{existingProfile.name}</b> {t("topup.exists")}{" "}
                    {formatSom(existingProfile.totalBid, lang)}).
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-[#94836f] font-medium mt-1.5 flex items-start gap-1">
                  <Info className="w-3 h-3 mt-px shrink-0" />
                  {t("form.contactHint")}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="name" className="text-[13px] font-bold text-[#574634] mb-1.5 block">
                {t("form.name")}{" "}
                {autoFilled && (
                  <span className="text-[10px] text-green-600 font-bold">✓ auto</span>
                )}{" "}
                <span className="text-[#d97b29]">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                placeholder={
                  pool === "education"
                    ? subType === "center"
                      ? t("form.namePlaceholderCenter")
                      : t("form.namePlaceholderIndividual")
                    : t("form.namePlaceholderIt")
                }
                className={cn(
                  "h-11 bg-white text-sm font-semibold rounded-lg",
                  errors.name ? "border-red-300" : "border-[#e8ddd0]"
                )}
              />
              {errors.name && <FieldError msg={errors.name} />}
            </div>

            <div>
              <Label htmlFor="city" className="text-[13px] font-bold text-[#574634] mb-1.5 block">
                {t("form.city")} <span className="text-[#d97b29]">*</span>
              </Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger
                  className={cn(
                    "h-11 bg-white text-sm font-semibold rounded-lg",
                    errors.city ? "border-red-300" : "border-[#e8ddd0]"
                  )}
                >
                  <SelectValue placeholder={t("form.cityPlaceholder")} />
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
                  {t("form.description")}{" "}
                  {fetchedMeta?.description && autoFilled && (
                    <span className="text-[10px] text-green-600 font-bold">✓ auto</span>
                  )}
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
                placeholder={t("form.descriptionPlaceholder")}
                className={cn(
                  "bg-white text-sm font-medium rounded-lg resize-none leading-relaxed",
                  errors.description ? "border-red-300" : "border-[#e8ddd0]"
                )}
              />
              {errors.description && <FieldError msg={errors.description} />}
            </div>

            {/* Logo */}
            <div>
              <Label className="text-[13px] font-bold text-[#574634] mb-1.5 block">
                {t("form.logo")}{" "}
                {fetchedMeta?.imageUrl && autoFilled && (
                  <span className="text-[10px] text-green-600 font-bold">✓ auto</span>
                )}{" "}
                <span className="text-[#94836f] font-medium">({t("form.optional")})</span>
              </Label>
              {imageUrl ? (
                <div className="flex items-center gap-3 bg-[#fffdfa] border border-[#f0e6da] rounded-xl p-3">
                  { }
                  <img
                    src={imageUrl}
                    alt="Logo"
                    className="w-14 h-14 rounded-xl object-cover border border-[#f0e6da]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[#241c14]">{t("form.logoAttached")}</p>
                    <p className="text-[11px] text-[#94836f] font-medium mt-0.5">
                      {t("form.logoAttachedDesc")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="w-9 h-9 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => setImageUrl("")}
                    aria-label={t("form.logoRemove")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-[#e0cdb4] hover:border-[#d97b29] bg-[#fffdfa] hover:bg-[#fff9f2] rounded-xl py-5 cursor-pointer transition-colors disabled:opacity-60"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-6 h-6 text-[#d97b29] animate-spin" />
                      <span className="text-xs font-bold text-[#574634]">{t("form.uploading")}</span>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="w-6 h-6 text-[#d97b29]" />
                      <span className="text-[13px] font-extrabold text-[#241c14]">
                        {t("form.logoUpload")}
                      </span>
                      <span className="text-[11px] text-[#94836f] font-medium">
                        {t("form.logoFormats")}
                      </span>
                    </>
                  )}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                aria-label="Logo"
              />
              {!imageUrl && (
                <details className="mt-2">
                  <summary className="text-[11px] text-[#94836f] font-bold cursor-pointer hover:text-[#b25e14] list-none select-none">
                    {t("form.logoUrl")} ↗
                  </summary>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="mt-1.5 h-10 bg-white text-[13px] font-semibold rounded-lg border-[#e8ddd0]"
                  />
                </details>
              )}
            </div>
          </div>
        </Section>

        {/* 3-qadam: O'rin tanlash */}
        <Section
          step={3}
          title={t("form.step3")}
          hint={`${tierInfo.label} — ${t("about.tableStep")} ${formatSom(tierInfo.step, lang)}${
            tierInfo.top1Extra ? `, TOP-1 ${t("form.top1Premium")} ${formatSom(tierInfo.top1Extra, lang)}` : ""
          }`}
        >
          {!ranked ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 rounded-lg bg-[#f0e6da]" />
              ))}
            </div>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto scrollbar-thin pr-1 -mr-1">
              {Array.from({ length: ranked.length + 1 }, (_, i) => i + 1).map((pos) => {
                const holder = ranked[pos - 1];
                const pay = amountFor(pos);
                const full = fullFor(pos);
                const active = targetPosition === pos;
                const isTop = pos <= 3;
                const isTop1 = pos === 1;
                const discounted = pay < full;
                return (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setTargetPosition(pos)}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 rounded-lg border-2 transition-all cursor-pointer text-left",
                      active
                        ? "border-[#d97b29] bg-[#fff9f2]"
                        : "border-[#f0e6da] bg-white hover:border-[#e0cdb4]"
                    )}
                    aria-pressed={active}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      {isTop1 ? (
                        <Crown className="w-4 h-4 shrink-0 text-[#d97b29]" />
                      ) : (
                        <Trophy
                          className={cn("w-4 h-4 shrink-0", isTop ? "text-[#d97b29]" : "text-[#c4b5a1]")}
                        />
                      )}
                      <span className="min-w-0">
                        <span
                          className={cn(
                            "flex items-center gap-1.5 text-[13px] sm:text-sm font-extrabold truncate",
                            active ? "text-[#b25e14]" : "text-[#241c14]"
                          )}
                        >
                          {pos}
                          {t("form.targetPosition")}
                          {isTop1 && (
                            <span className="text-[9px] font-extrabold uppercase bg-[#d97b29] text-white px-1.5 py-0.5 rounded-full shrink-0">
                              TOP-1
                            </span>
                          )}
                          {isTop && !isTop1 && (
                            <span className="text-[9px] font-extrabold uppercase bg-[#fdeedd] text-[#b25e14] px-1.5 py-0.5 rounded-full shrink-0">
                              TOP
                            </span>
                          )}
                        </span>
                        {holder ? (
                          <span className="block text-[10px] sm:text-[11px] text-[#94836f] font-semibold truncate mt-0.5">
                            {t("form.holderNow")} {holder.name}
                          </span>
                        ) : (
                          <span className="block text-[10px] sm:text-[11px] text-[#94836f] font-semibold mt-0.5">
                            {t("form.emptySpot")}
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-right">
                        {discounted && (
                          <span className="block text-[10px] font-bold text-[#c4b5a1] line-through tabular-nums leading-none">
                            {formatSom(full, lang)}
                          </span>
                        )}
                        <span
                          className={cn(
                            "text-[13px] sm:text-sm font-extrabold tabular-nums",
                            discounted ? "text-[#d97b29]" : active ? "text-[#d97b29]" : "text-[#241c14]"
                          )}
                        >
                          {formatSom(pay, lang)}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0",
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

          {promo.active && (
            <div className="mt-3 flex items-center gap-2 bg-gradient-to-r from-[#fdeedd] to-[#fff9f2] border border-[#f0d5b8] rounded-xl px-3.5 py-2.5">
              <Rocket className="w-4 h-4 text-[#d97b29] shrink-0" />
              <p className="text-[11px] sm:text-xs text-[#b25e14] font-bold leading-snug">
                {t("form.promoNote")}
              </p>
            </div>
          )}

          {/* Umumiy hisob */}
          <div className="mt-4 bg-[#241c14] rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <CircleDollarSign className="w-5 h-5 text-[#e9a05c] shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#94836f] leading-none">
                  {topupMode ? t("form.payTopup") : t("form.payTotal")}
                </p>
                <p className="text-xs text-[#c4b5a1] font-medium mt-1 truncate">{targetLabel}</p>
              </div>
            </div>
            <p className="text-right shrink-0">
              {hasPromoDiscount && (
                <span className="block text-[11px] font-bold text-[#94836f] line-through tabular-nums leading-none mb-0.5">
                  {formatSom(fullAmount, lang)}
                </span>
              )}
              <span className="text-xl md:text-2xl font-extrabold text-white tabular-nums">
                {formatSom(amount, lang)}
              </span>
            </p>
          </div>
        </Section>

        {/* Yuborish */}
        <Button
          type="submit"
          disabled={submitting || !ranked}
          className="w-full h-12 md:h-13 bg-[#d97b29] hover:bg-[#c2691f] text-white font-extrabold rounded-xl text-base shadow-md shadow-[#d97b29]/25 active:scale-[0.99] transition-transform"
        >
          {submitting ? t("form.processing") : <>{t("form.toPayment")} — {formatSom(amount, lang)}</>}
        </Button>
      </form>

      <PaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        amount={amount}
        fullAmount={hasPromoDiscount ? fullAmount : null}
        onPaid={handlePaid}
        summary={{
          name: existingProfile?.name || name || "Profil",
          poolLabel,
          targetLabel,
        }}
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
        <div className="min-w-0">
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
      <span
        className={cn(
          "flex items-center gap-1.5 font-extrabold text-sm",
          active ? "text-[#b25e14]" : "text-[#241c14]"
        )}
      >
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
