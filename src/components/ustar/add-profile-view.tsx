"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Info,
  Trophy,
  CircleDollarSign,
  ImagePlus,
  Trash2,
  Loader2,
  Crown,
  Rocket,
  Wand2,
  CheckCircle2,
  XCircle,
  Users,
  User,
  Copy,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { PaymentModal } from "./payment-modal";
import { useUstarStore, getSessionId, saveEditToken } from "@/lib/ustar/store";
import { useI18n } from "@/lib/ustar/i18n";
import {
  CITIES,
  PRICE_TIERS,
  formatSom,
  isValidContactUrl,
  promoInfo,
  type PriceTier,
} from "@/lib/ustar/constants";
import { fullPriceForPosition, payableAmount, tierFor } from "@/lib/ustar/pricing";
import type { CategoryDTO, CreateProfileResult, ProfileDTO } from "@/lib/ustar/types";
import { cn } from "@/lib/utils";

interface FetchedMeta {
  name: string;
  description: string;
  imageUrl: string | null;
  source: string;
}

/** Soddalashtirilgan forma: havola (avto-to'ldirish) → kategoriya + shahar → o'rin */
export function AddProfileView() {
  const { setView, setHighlight, goHome, addIntentPosition, setAddIntentPosition } = useUstarStore();
  const { toast } = useToast();
  const { t, lang } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Forma holati — FAQAT KERAKLILARI
  const [contactUrl, setContactUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subType, setSubType] = useState("center"); // faqat ta'lim: center/individual
  const [city, setCity] = useState("");
  const [targetPosition, setTargetPosition] = useState<number | null>(null);

  // Avto-to'ldiriladigan maydonlar (tahrirlanadigan)
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [fetchState, setFetchState] = useState<"idle" | "loading" | "done" | "failed">("idle");
  const [fetchedMeta, setFetchedMeta] = useState<FetchedMeta | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);
  const [showDetails, setShowDetails] = useState(false); // nom/tavsif tahriri (accordion)

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
  const [editLinkCopied, setEditLinkCopied] = useState(false);
  const [editLink, setEditLink] = useState<string | null>(null);

  const promo = promoInfo();

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d: { categories: CategoryDTO[] }) => setCategories(d.categories))
      .catch(() => null);
    fetch("/api/profiles")
      .then((r) => r.json())
      .then((d: { profiles: ProfileDTO[] }) => setRanked(d.profiles))
      .catch(() => setRanked([]));
  }, []);

  // Intent pozitsiya
  useEffect(() => {
    if (ranked && addIntentPosition && addIntentPosition <= ranked.length + 1) {
      setTargetPosition(addIntentPosition);
      setAddIntentPosition(null);
    }
  }, [ranked, addIntentPosition, setAddIntentPosition]);

  // ===== AVTO METADATA + mavjudlik tekshiruvi =====
  useEffect(() => {
    const u = contactUrl.trim();
    const timer = setTimeout(() => {
      if (!u || !isValidContactUrl(u)) {
        setExistingProfile(null);
        setFetchState("idle");
        setFetchedMeta(null);
        return;
      }
      fetch(`/api/profiles/check?contact=${encodeURIComponent(u)}`)
        .then((r) => r.json())
        .then((d: { exists: boolean; profile?: { id: string; name: string; totalBid: number } }) => {
          setExistingProfile(d.exists && d.profile ? d.profile : null);
          if (!d.exists) {
            setFetchState("loading");
            fetch(`/api/fetch-meta?url=${encodeURIComponent(u)}`)
              .then((r) => r.json())
              .then((m: FetchedMeta) => {
                if (m && (m.name || m.imageUrl)) {
                  setFetchedMeta(m);
                  setFetchState("done");
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
     
  }, [contactUrl]);

  // Tanlangan kategoriya
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const isEdu = selectedCategory?.pool === "education";

  // Tier: kategoriya pool'i + subType dan
  const tier: PriceTier = useMemo(() => {
    if (!selectedCategory) return "edu_individual";
    return tierFor(selectedCategory.pool, isEdu ? subType : "it");
  }, [selectedCategory, isEdu, subType]);
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

  const targetLabel = selectedPosition
    ? topupMode
      ? `${selectedPosition}${t("form.targetTopup")}`
      : `${selectedPosition}${t("form.targetPosition")}`
    : t("form.targetNone");

  const categoryGroups = useMemo(() => {
    const groups = new Map<string, CategoryDTO[]>();
    for (const c of categories) {
      const key = c.group || "Boshqa";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(c);
    }
    return Array.from(groups.entries());
  }, [categories]);

  // Logo yuklash
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

  // Validatsiya
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!contactUrl.trim() || !isValidContactUrl(contactUrl)) e.contactUrl = t("err.contact");
    if (!topupMode) {
      if (!categoryId) e.categoryId = t("err.category");
      if (!city) e.city = t("err.city");
      if (!name.trim() || name.trim().length < 2) e.name = t("err.name");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openPayment = () => {
    if (validate()) setPaymentOpen(true);
  };

  // To'lov
  const handlePaid = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subType: isEdu ? subType : "it",
          categoryId,
          name,
          city,
          description,
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
      // Edit token saqlash
      if (result.editToken) {
        saveEditToken(result.profile.id, result.editToken);
        const link = `${window.location.origin}/#p/${result.profile.id}?token=${result.editToken}`;
        setEditLink(link);
      }
      toast({ title: t("toast.paidTitle"), description: result.message });
      setHighlight(result.profile.id);
      // Edit link ko'rsatish — to'lov muvaffaqiyati ekranida
      setTimeout(() => goHome(), 2500);
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

  const copyEditLink = async () => {
    if (!editLink) return;
    try {
      await navigator.clipboard.writeText(editLink);
      setEditLinkCopied(true);
      setTimeout(() => setEditLinkCopied(false), 2000);
    } catch {
      /* noop */
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
        {/* ====== 1-QADAM: HAVOLA (avto-to'ldirish bilan) ====== */}
        <section className="bg-white border border-border rounded-2xl p-4 md:p-5">
          <div className="flex items-start gap-3 mb-4">
            <span className="w-7 h-7 rounded-lg bg-[#fdeedd] text-[#b25e14] font-extrabold text-sm flex items-center justify-center shrink-0">
              1
            </span>
            <div className="min-w-0">
              <h2 className="font-extrabold text-[#241c14] leading-none">{t("form.step1New")}</h2>
              <p className="text-xs text-[#94836f] font-medium mt-1">{t("form.step1HintNew")}</p>
            </div>
          </div>

          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c4b5a1] pointer-events-none" />
            <Input
              id="contact"
              value={contactUrl}
              onChange={(e) => setContactUrl(e.target.value)}
              placeholder="@kanal yoki https://sayt.uz"
              className={cn(
                "h-12 bg-white text-sm font-semibold rounded-xl pl-9 pr-10 text-[15px]",
                errors.contactUrl ? "border-red-300" : "border-[#e8ddd0]"
              )}
            />
            {fetchState === "loading" && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d97b29] animate-spin" />
            )}
            {fetchState === "done" && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
            )}
            {fetchState === "failed" && (
              <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c4b5a1]" />
            )}
          </div>

          {errors.contactUrl ? (
            <p className="text-xs font-semibold text-red-600 mt-2">{errors.contactUrl}</p>
          ) : fetchState === "loading" ? (
            <p className="text-[11px] text-[#b25e14] font-bold mt-2 flex items-center gap-1">
              <Wand2 className="w-3 h-3" />
              {t("fetch.loading")}
            </p>
          ) : fetchState === "done" && !topupMode ? (
            <div className="mt-3 bg-[#f0faf4] border border-[#c8ecd5] rounded-xl px-3 py-2.5">
              <p className="text-[11px] text-[#1a7a3c] font-extrabold flex items-center gap-1">
                <Wand2 className="w-3 h-3" />
                {t("fetch.fetched")}
              </p>
              {fetchedMeta && (
                <div className="flex items-center gap-2.5 mt-2 bg-white rounded-lg p-2.5 border border-[#dcefe3]">
                  {fetchedMeta.imageUrl ? (
                     
                    <img
                      src={fetchedMeta.imageUrl}
                      alt={fetchedMeta.name}
                      className="w-11 h-11 rounded-xl object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-[#f6efe6] shrink-0 flex items-center justify-center">
                      <ImagePlus className="w-4 h-4 text-[#c4b5a1]" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-extrabold text-[#241c14] truncate">{fetchedMeta.name}</p>
                    <p className="text-[11px] text-[#94836f] truncate">{fetchedMeta.description || contactUrl}</p>
                  </div>
                </div>
              )}
            </div>
          ) : fetchState === "failed" && !topupMode ? (
            <p className="text-[11px] text-[#94836f] font-medium mt-2 flex items-start gap-1">
              <Info className="w-3 h-3 mt-px shrink-0" />
              {t("fetch.failed")}
            </p>
          ) : topupMode && existingProfile ? (
            <div className="mt-2 flex items-start gap-1.5 bg-[#f0f9ff] border border-[#cbe9f8] rounded-lg px-2.5 py-2">
              <Info className="w-3 h-3 mt-0.5 shrink-0 text-[#229ed9]" />
              <p className="text-[11px] text-[#1a6da8] font-semibold leading-snug">
                {t("topup.banner")} <b>{existingProfile.name}</b> {t("topup.exists")}{" "}
                {formatSom(existingProfile.totalBid, lang)}).
              </p>
            </div>
          ) : (
            <p className="text-[11px] text-[#94836f] font-medium mt-2 flex items-start gap-1">
              <Info className="w-3 h-3 mt-px shrink-0" />
              {t("form.contactHint")}
            </p>
          )}

          {/* Nom/tavsif tahriri (accordion) */}
          {fetchState === "done" && !topupMode && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="text-[11px] font-extrabold text-[#b25e14] hover:underline cursor-pointer flex items-center gap-1"
              >
                {showDetails ? "▾" : "▸"} {t("form.step2")}
              </button>
              {showDetails && (
                <div className="mt-2.5 space-y-3 p-3 bg-[#fffdfa] border border-[#f0e6da] rounded-xl">
                  <div>
                    <Label className="text-[12px] font-bold text-[#574634] mb-1 block">
                      {t("form.name")} <span className="text-green-600 text-[10px]">✓ auto</span>
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={60}
                      className={cn(
                        "h-10 bg-white text-sm font-semibold rounded-lg",
                        errors.name ? "border-red-300" : "border-[#e8ddd0]"
                      )}
                    />
                    {errors.name && <p className="text-xs font-semibold text-red-600 mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <Label className="text-[12px] font-bold text-[#574634] mb-1 block">
                      {t("form.description")}{" "}
                      <span className="text-[#94836f] font-medium">({t("form.optional")})</span>
                    </Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={300}
                      rows={2}
                      className="bg-white text-[13px] font-medium rounded-lg resize-none border-[#e8ddd0]"
                    />
                  </div>
                  {/* Logo yuklash */}
                  <div>
                    <Label className="text-[12px] font-bold text-[#574634] mb-1.5 block">
                      {t("form.logo")} <span className="text-[#94836f] font-medium">({t("form.optional")})</span>
                    </Label>
                    {imageUrl ? (
                      <div className="flex items-center gap-3 bg-white border border-[#f0e6da] rounded-xl p-2.5">
                        { }
                        <img src={imageUrl} alt="Logo" className="w-12 h-12 rounded-xl object-cover" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 ml-auto"
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
                        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#e0cdb4] hover:border-[#d97b29] bg-[#fffdfa] rounded-xl py-3 cursor-pointer transition-colors disabled:opacity-60"
                      >
                        {uploading ? (
                          <Loader2 className="w-4 h-4 text-[#d97b29] animate-spin" />
                        ) : (
                          <>
                            <ImagePlus className="w-4 h-4 text-[#d97b29]" />
                            <span className="text-[12px] font-extrabold text-[#241c14]">
                              {t("form.logoUpload")}
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
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Top-up rejimida nom ko'rsatish */}
          {topupMode && existingProfile && (
            <p className="text-[11px] text-[#94836f] font-medium mt-2">
              {t("form.name")}: <b className="text-[#241c14]">{existingProfile.name}</b>
            </p>
          )}
        </section>

        {/* ====== 2-QADAM: KATEGORIYA + SHAHAR ====== */}
        <section className="bg-white border border-border rounded-2xl p-4 md:p-5">
          <div className="flex items-start gap-3 mb-4">
            <span className="w-7 h-7 rounded-lg bg-[#fdeedd] text-[#b25e14] font-extrabold text-sm flex items-center justify-center shrink-0">
              2
            </span>
            <div className="min-w-0">
              <h2 className="font-extrabold text-[#241c14] leading-none">{t("form.step2New")}</h2>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-[13px] font-bold text-[#574634] mb-1.5 block">
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
                  {categoryGroups.map(([group, items]) => (
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
              {errors.categoryId && <p className="text-xs font-semibold text-red-600 mt-1.5">{errors.categoryId}</p>}
            </div>

            {/* Markaz/Repetitor — faqat ta'lim kategoriyasida */}
            {isEdu && (
              <div>
                <Label className="text-[13px] font-bold text-[#574634] mb-1.5 block">
                  {t("form.whoAreYou")}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["center", "individual"] as const).map((st) => {
                    const info = PRICE_TIERS[st === "center" ? "edu_center" : "edu_individual"];
                    const active = subType === st;
                    const entry = payableAmount(info.min, promo.active);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSubType(st)}
                        className={cn(
                          "flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all cursor-pointer text-left",
                          active ? "border-[#d97b29] bg-[#fff9f2]" : "border-[#f0e6da] bg-white hover:border-[#e0cdb4]"
                        )}
                        aria-pressed={active}
                      >
                        <div
                          className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                            active ? "bg-[#d97b29] text-white" : "bg-[#f6efe6] text-[#574634]"
                          )}
                        >
                          {st === "center" ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className={cn("text-[12px] font-extrabold", active ? "text-[#b25e14]" : "text-[#241c14]")}>
                            {st === "center" ? t("filter.center") : t("filter.individual")}
                          </p>
                          <p className="text-[10px] text-[#94836f] font-bold tabular-nums">
                            {formatSom(entry, lang)}
                            {t("home.from")}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <Label className="text-[13px] font-bold text-[#574634] mb-1.5 block">
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
              {errors.city && <p className="text-xs font-semibold text-red-600 mt-1.5">{errors.city}</p>}
            </div>
          </div>
        </section>

        {/* ====== 3-QADAM: O'RIN ====== */}
        <section className="bg-white border border-border rounded-2xl p-4 md:p-5">
          <div className="flex items-start gap-3 mb-4">
            <span className="w-7 h-7 rounded-lg bg-[#fdeedd] text-[#b25e14] font-extrabold text-sm flex items-center justify-center shrink-0">
              3
            </span>
            <div className="min-w-0">
              <h2 className="font-extrabold text-[#241c14] leading-none">{t("form.step3")}</h2>
              <p className="text-xs text-[#94836f] font-medium mt-1">
                {selectedCategory ? `${selectedCategory.group} · ${selectedCategory.name}` : t("err.category")}
              </p>
            </div>
          </div>

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
                      active ? "border-[#d97b29] bg-[#fff9f2]" : "border-[#f0e6da] bg-white hover:border-[#e0cdb4]"
                    )}
                    aria-pressed={active}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      {isTop1 ? (
                        <Crown className="w-4 h-4 shrink-0 text-[#d97b29]" />
                      ) : (
                        <Trophy className={cn("w-4 h-4 shrink-0", isTop ? "text-[#d97b29]" : "text-[#c4b5a1]")} />
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

          {/* Umumiy hisob + xayriya */}
          <div className="mt-4 space-y-2">
            <div className="bg-[#241c14] rounded-xl p-4 flex items-center justify-between gap-3">
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
            {/* Xayriya eslatmasi */}
            <div className="flex items-center gap-2 bg-[#fff5f0] border border-[#ffd9c9] rounded-xl px-3.5 py-2">
              <span className="text-sm shrink-0">❤️</span>
              <p className="text-[11px] text-[#b4522d] font-bold leading-snug">
                {t("charity.paymentNote")}: {formatSom(Math.floor((amount * 0.1) / 500) * 500, lang)}.{" "}
                {t("charity.note")}.
              </p>
            </div>
          </div>
        </section>

        {/* Yuborish */}
        <Button
          type="submit"
          disabled={submitting || !ranked}
          className="w-full h-12 md:h-13 bg-[#d97b29] hover:bg-[#c2691f] text-white font-extrabold rounded-xl text-base shadow-md shadow-[#d97b29]/25 active:scale-[0.99] transition-transform"
        >
          {submitting ? t("form.processing") : <>{t("form.toPayment")} — {formatSom(amount, lang)}</>}
        </Button>
      </form>

      {/* Edit link (to'lovdan so'ng) */}
      {editLink && (
        <div className="mt-4 bg-[#f0faf4] border border-[#c8ecd5] rounded-xl p-4">
          <p className="text-[13px] font-extrabold text-[#1a7a3c]">{t("editlink.title")}</p>
          <p className="text-[11px] text-[#574634] font-medium mt-1">{t("editlink.desc")}</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 min-w-0 text-[11px] font-bold text-[#241c14] bg-white border border-[#dcefe3] rounded-lg px-2.5 py-2 truncate">
              {editLink}
            </code>
            <Button
              size="sm"
              onClick={copyEditLink}
              className="h-9 bg-[#1a7a3c] hover:bg-[#15632f] text-white font-bold rounded-lg text-xs shrink-0"
            >
              {editLinkCopied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
      )}

      <PaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        amount={amount}
        fullAmount={hasPromoDiscount ? fullAmount : null}
        onPaid={handlePaid}
        summary={{
          name: existingProfile?.name || name || "Profil",
          poolLabel: selectedCategory ? `${selectedCategory.group} · ${selectedCategory.name}` : "—",
          targetLabel,
        }}
      />
    </div>
  );
}
