"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SearchX, Sparkles, Heart } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "./profile-card";
import { StatsBar } from "./stats-bar";
import { PromoBanner } from "./promo-banner";
import { useUstarStore } from "@/lib/ustar/store";
import { useI18n } from "@/lib/ustar/i18n";
import {
  CITIES,
  formatCompactSom,
  CATEGORY_GROUP_ORDER,
} from "@/lib/ustar/constants";
import { entryPrice, fullPriceForPosition, payableAmount } from "@/lib/ustar/pricing";
import type { CategoryDTO, ProfileDTO } from "@/lib/ustar/types";
import { cn } from "@/lib/utils";

/** Bosh sahifa — YAGONA reyting: ta'lim + IT birga, kategoriya filtri bilan */
export function HomeView() {
  const { categoryFilter, setCategoryFilter, cityFilter, setCityFilter, setView, openAddForm, highlightId } =
    useUstarStore();
  const { t, lang } = useI18n();

  const [data, setData] = useState<{
    profiles: ProfileDTO[];
    promoActive: boolean;
  } | null>(null);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);

  useEffect(() => {
    fetch("/api/profiles")
      .then((r) => r.json())
      .then((d: { profiles: ProfileDTO[]; promo: { active: boolean } }) => {
        setData({ profiles: d.profiles, promoActive: d.promo.active });
      })
      .catch(() => {
        setData({ profiles: [], promoActive: false });
      });
  }, []);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d: { categories: CategoryDTO[] }) => setCategories(d.categories))
      .catch(() => null);
  }, []);

  const loading = data === null;
  const profiles = data?.profiles ?? null;
  const promoActive = data?.promoActive ?? false;

  const filtersActive = categoryFilter !== "all" || cityFilter !== "all";

  const filtered = useMemo(() => {
    if (!profiles) return [];
    return profiles.filter((p) => {
      if (categoryFilter !== "all" && p.categoryId !== categoryFilter) return false;
      if (cityFilter !== "all" && p.city !== cityFilter) return false;
      return true;
    });
  }, [profiles, categoryFilter, cityFilter]);

  /** Karta CTA narxi — yagona narx (TOP-1: +50k, boshqalar: +10k) */
  const ctaPriceLabel = useCallback(
    (globalPosition: number): string => {
      if (!profiles) return "";
      return formatCompactSom(
        payableAmount(fullPriceForPosition(profiles, globalPosition), promoActive),
        lang
      );
    },
    [profiles, promoActive, lang]
  );

  const categoryGroups = useMemo(() => {
    const groups = new Map<string, CategoryDTO[]>();
    for (const c of categories) {
      const key = c.group || "Boshqa";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(c);
    }
    // Guruhlar tartibi: ASOSIY (til/sertifikat) → maktab → IT → kurslar → bolalar
    const orderMap = new Map(CATEGORY_GROUP_ORDER.map((g, i) => [g, i]));
    return Array.from(groups.entries()).sort(
      (a, b) =>
        (orderMap.get(a[0]) ?? 99) - (orderMap.get(b[0]) ?? 99) || a[0].localeCompare(b[0])
    );
  }, [categories]);

  const selectedCategory = categories.find((c) => c.id === categoryFilter);
  const entryLabel = formatCompactSom(entryPrice(promoActive), lang);

  const openProfile = (id: string) => setView({ name: "profile-detail", profileId: id });
  const clearAllFilters = () => {
    setCategoryFilter("all");
    setCityFilter("all");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pb-16">
      {/* Hero */}
      <section className="pt-6 md:pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-1.5 bg-[#fdeedd] text-[#b25e14] text-[11px] md:text-xs font-extrabold px-3 py-1 rounded-full mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Repetitor, markaz, kurs va IT mutaxassislar — barchasi bir joyda
        </div>
        <h1 className="text-[26px] leading-[1.15] md:text-[40px] md:leading-[1.1] font-extrabold tracking-tight text-[#241c14]">
          O'zbekistonning <span className="text-[#d97b29]">reyting</span> platformasi
        </h1>
        <p className="mt-2.5 text-sm md:text-base text-[#6b5d4d] max-w-xl mx-auto leading-relaxed">
          Haqiqiy sharhlar va reyting asosida tanlang. Siz ham o'z xizmatingizni reytingga
          qo'shing.
        </p>
        <Button
          onClick={() => openAddForm()}
          className="mt-4 h-11 md:h-12 px-6 bg-[#d97b29] hover:bg-[#c2691f] text-white font-extrabold rounded-xl text-sm md:text-base shadow-md shadow-[#d97b29]/25 active:scale-[0.98] transition-transform"
        >
          Reytingga qo'shilish — {entryLabel}
          {t("home.from")}
        </Button>
      </section>

      {/* Statistika + xayriya */}
      <section aria-label={t("stats.online")}>
        <StatsBar />
      </section>

      {/* Aksiya */}
      <section className="mt-3 md:mt-4">
        <PromoBanner />
      </section>

      {/* Filtrlar */}
      <section className="mt-6 md:mt-7" aria-label={t("filter.category")}>
        <div className="flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-11 md:h-10 bg-white border-[#e8ddd0] text-[#241c14] text-[13px] font-semibold rounded-lg">
                <SelectValue placeholder={t("filter.category")} />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#e8ddd0] max-h-80">
                <SelectItem value="all" className="font-semibold">
                  {t("filter.categoryAll")}
                </SelectItem>
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

            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="h-11 md:h-10 bg-white border-[#e8ddd0] text-[#241c14] text-[13px] font-semibold rounded-lg">
                <SelectValue placeholder={t("filter.city")} />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#e8ddd0] max-h-72">
                <SelectItem value="all" className="font-semibold">
                  {t("filter.cityAll")}
                </SelectItem>
                {CITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filtersActive && (
            <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
              <span className="text-[#94836f] font-bold">{t("filter.active")}</span>
              {selectedCategory && (
                <Chip label={selectedCategory.name} onClear={() => setCategoryFilter("all")} />
              )}
              {cityFilter !== "all" && <Chip label={cityFilter} onClear={() => setCityFilter("all")} />}
              <button
                onClick={clearAllFilters}
                className="text-[#d97b29] font-extrabold hover:underline cursor-pointer"
              >
                {t("filter.clearAll")}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Reyting */}
      <section className="mt-5 md:mt-6" aria-label={t("nav.home")}>
        {loading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState hasFilters={filtersActive} entryLabel={entryLabel} onClear={clearAllFilters} />
        ) : (
          <div className="flex flex-col gap-3 md:gap-4">
            {filtered.map((p, idx) => (
              <ProfileCard
                key={p.id}
                profile={p}
                displayPosition={idx + 1}
                globalPosition={p.position}
                filtersActive={filtersActive}
                priceLabel={ctaPriceLabel(p.position)}
                promoActive={promoActive}
                highlighted={highlightId === p.id}
                onOpenDetail={openProfile}
                onTakeSpot={openAddForm}
              />
            ))}

            {/* Pastki CTA */}
            <div className="mt-2 bg-white border border-dashed border-[#e0cdb4] rounded-xl p-5 md:p-6 text-center">
              <p className="text-sm md:text-[15px] font-extrabold text-[#241c14]">
                {t("cta.eduTitle")}
              </p>
              <p className="text-xs md:text-sm text-[#6b5d4d] mt-1 leading-relaxed">
                {t("cta.desc")}
                {promoActive && <span className="text-[#b25e14] font-bold"> {t("cta.promoNote")}</span>}
              </p>
              <Button
                onClick={() => openAddForm()}
                className="mt-3.5 bg-[#d97b29] hover:bg-[#c2691f] text-white font-extrabold rounded-xl h-11 px-6 text-sm shadow-md shadow-[#d97b29]/25 active:scale-[0.98] transition-transform"
              >
                {t("cta.start")} {entryLabel}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-[#fdeedd] text-[#b25e14] font-bold px-2 py-0.5 rounded-full">
      {label}
      <button onClick={onClear} className="hover:text-[#d97b29] cursor-pointer" aria-label={label}>
        ✕
      </button>
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3 md:gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white border border-border rounded-xl p-4 md:p-5 flex flex-col gap-3 md:flex-row md:gap-4">
          <div className="hidden md:flex w-14 justify-center">
            <Skeleton className="w-10 h-12 rounded-lg bg-[#f0e6da]" />
          </div>
          <div className="flex md:hidden items-center gap-3">
            <Skeleton className="w-11 h-11 rounded-xl bg-[#f0e6da]" />
            <Skeleton className="h-5 flex-1 bg-[#f0e6da]" />
          </div>
          <Skeleton className="hidden md:block w-16 h-16 rounded-2xl bg-[#f0e6da]" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-5 w-1/2 bg-[#f0e6da]" />
            <Skeleton className="h-3.5 w-full bg-[#f0e6da]" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-24 rounded-full bg-[#f0e6da]" />
              <Skeleton className="h-5 w-16 rounded-full bg-[#f0e6da]" />
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end gap-3">
            <Skeleton className="h-4 w-24 bg-[#f0e6da]" />
            <Skeleton className="h-9 w-36 rounded-lg bg-[#f0e6da]" />
          </div>
          <Skeleton className="md:hidden h-10 w-full rounded-lg bg-[#f0e6da]" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  hasFilters,
  entryLabel,
  onClear,
}: {
  hasFilters: boolean;
  entryLabel: string;
  onClear: () => void;
}) {
  const { t } = useI18n();
  const { openAddForm } = useUstarStore();
  return (
    <div className="bg-white border border-border rounded-xl p-10 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-[#fdeedd] flex items-center justify-center">
        <SearchX className="w-7 h-7 text-[#d97b29]" />
      </div>
      <h3 className="mt-4 font-extrabold text-[#241c14] text-lg">
        {hasFilters ? t("empty.notFoundTitle") : t("empty.emptyListTitle")}
      </h3>
      <p className="mt-1.5 text-sm text-[#6b5d4d] max-w-sm mx-auto leading-relaxed">
        {hasFilters ? t("empty.notFoundDesc") : `${t("empty.emptyListDesc")} ${entryLabel}.`}
      </p>
      <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
        {hasFilters && (
          <Button
            variant="outline"
            onClick={onClear}
            className="border-[#e8ddd0] text-[#574634] hover:bg-[#fdeedd] hover:text-[#b25e14] font-bold rounded-lg"
          >
            {t("empty.clearFilters")}
          </Button>
        )}
        <Button
          onClick={() => openAddForm()}
          className="bg-[#d97b29] hover:bg-[#c2691f] text-white font-extrabold rounded-lg shadow-sm shadow-[#d97b29]/25"
        >
          {t("empty.takeFirst")} — {entryLabel}
        </Button>
      </div>
    </div>
  );
}
