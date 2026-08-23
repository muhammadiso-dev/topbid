"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GraduationCap, Code2, SearchX, Filter, Users, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "./profile-card";
import { StatsBar } from "./stats-bar";
import { useUstarStore } from "@/lib/ustar/store";
import { CITIES, EDUCATION_SUBTYPES, IT_SUBTYPES, type Pool } from "@/lib/ustar/constants";
import type { CategoryDTO, PriceOptionDTO, ProfileDTO } from "@/lib/ustar/types";
import { cn } from "@/lib/utils";

/** Bosh sahifa — reyting: ikkita pool, filtrlar va kartochkalar ro'yxati */
export function HomeView() {
  const {
    pool,
    setPool,
    eduSubFilter,
    setEduSubFilter,
    categoryFilter,
    setCategoryFilter,
    cityFilter,
    setCityFilter,
    setView,
    highlightId,
  } = useUstarStore();

  const [data, setData] = useState<{
    pool: Pool;
    profiles: ProfileDTO[];
    priceOptions: PriceOptionDTO[];
  } | null>(null);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);

  const loadProfiles = useCallback((p: Pool) => {
    fetch(`/api/profiles?pool=${p}`)
      .then((r) => r.json())
      .then((d: { profiles: ProfileDTO[]; priceOptions: PriceOptionDTO[] }) => {
        setData({ pool: p, profiles: d.profiles, priceOptions: d.priceOptions });
      })
      .catch(() => {
        setData({ pool: p, profiles: [], priceOptions: [] });
      });
  }, []);

  useEffect(() => {
    loadProfiles(pool);
  }, [pool, loadProfiles]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d: { categories: CategoryDTO[] }) => setCategories(d.categories))
      .catch(() => null);
  }, []);

  const loading = !data || data.pool !== pool;
  const profiles = loading ? null : data.profiles;
  const priceOptions = loading ? [] : data.priceOptions;

  const poolCategories = useMemo(
    () => categories.filter((c) => c.pool === pool),
    [categories, pool]
  );

  // Filtrlash (pozitsiyalar butun pool bo'yicha saqlanadi)
  const filtered = useMemo(() => {
    if (!profiles) return [];
    return profiles.filter((p) => {
      if (pool === "education" && eduSubFilter !== "all" && p.subType !== eduSubFilter) return false;
      if (categoryFilter !== "all" && p.categoryId !== categoryFilter) return false;
      if (cityFilter !== "all" && p.city !== cityFilter) return false;
      return true;
    });
  }, [profiles, pool, eduSubFilter, categoryFilter, cityFilter]);

  const priceForPosition = useCallback(
    (pos: number) => priceOptions.find((o) => o.position === pos)?.price ?? 0,
    [priceOptions]
  );

  const hasActiveFilters =
    categoryFilter !== "all" || cityFilter !== "all" || (pool === "education" && eduSubFilter !== "all");

  const openProfile = (id: string) => setView({ name: "profile-detail", profileId: id });
  const takeSpot = (position: number) => setView({ name: "add-profile" });

  return (
    <div className="max-w-5xl mx-auto px-4 pb-16">
      {/* Hero */}
      <section className="pt-6 md:pt-10 pb-6 text-center">
        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#241c14] leading-tight">
          O'zingizga mos mutaxassisni{" "}
          <span className="text-[#d97b29]">reytingdan</span> tanlang
        </h1>
        <p className="mt-2.5 text-sm md:text-base text-[#6b5d4d] max-w-xl mx-auto leading-relaxed">
          Ta'lim markazlari, repetitorlar va IT mutaxassislari — barchasi bir joyda.
          Profilingizni qo'shing va raqobatda yuqori o'rinlarni egallang.
        </p>
      </section>

      {/* Statistika (ijtimoiy isbot) */}
      <section aria-label="Sayt statistikasi">
        <StatsBar />
      </section>

      {/* Pool almashish */}
      <section className="mt-6 md:mt-8" aria-label="Reyting turi">
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#f6efe6] rounded-xl">
          <button
            onClick={() => setPool("education")}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 md:py-3 rounded-lg text-sm md:text-[15px] font-extrabold transition-all cursor-pointer",
              pool === "education"
                ? "bg-white text-[#241c14] shadow-sm"
                : "text-[#94836f] hover:text-[#574634]"
            )}
            aria-pressed={pool === "education"}
          >
            <GraduationCap className={cn("w-4 h-4 md:w-5 md:h-5", pool === "education" && "text-[#d97b29]")} />
            Ta'lim
          </button>
          <button
            onClick={() => setPool("it")}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 md:py-3 rounded-lg text-sm md:text-[15px] font-extrabold transition-all cursor-pointer",
              pool === "it" ? "bg-white text-[#241c14] shadow-sm" : "text-[#94836f] hover:text-[#574634]"
            )}
            aria-pressed={pool === "it"}
          >
            <Code2 className={cn("w-4 h-4 md:w-5 md:h-5", pool === "it" && "text-[#d97b29]")} />
            IT mutaxassislar
          </button>
        </div>
      </section>

      {/* Sub-toifa (faqat ta'lim) + filtrlar */}
      <section className="mt-4 md:mt-5" aria-label="Filtrlar">
        <div className="flex flex-col gap-2.5">
          {pool === "education" && (
            <div className="flex gap-1.5">
              <SubTab
                active={eduSubFilter === "all"}
                onClick={() => setEduSubFilter("all")}
                icon={<Filter className="w-3.5 h-3.5" />}
                label="Barchasi"
              />
              {EDUCATION_SUBTYPES.map((st) => (
                <SubTab
                  key={st.value}
                  active={eduSubFilter === st.value}
                  onClick={() => setEduSubFilter(st.value)}
                  icon={st.value === "center" ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  label={st.short}
                />
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-10 bg-white border-[#e8ddd0] text-[#241c14] text-sm font-semibold rounded-lg">
                <SelectValue placeholder="Fan / soha" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#e8ddd0] max-h-72">
                <SelectItem value="all" className="font-semibold">
                  Fan / soha: barchasi
                </SelectItem>
                {poolCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="h-10 bg-white border-[#e8ddd0] text-[#241c14] text-sm font-semibold rounded-lg">
                <SelectValue placeholder="Shahar" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#e8ddd0] max-h-72">
                <SelectItem value="all" className="font-semibold">
                  Shahar: barchasi
                </SelectItem>
                {CITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Reyting ro'yxati */}
      <section className="mt-5 md:mt-6" aria-label="Reyting ro'yxati">
        {!profiles ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState hasFilters={hasActiveFilters} />
        ) : (
          <div className="flex flex-col gap-3 md:gap-4">
            {filtered.map((p) => (
              <ProfileCard
                key={p.id}
                profile={p}
                takePrice={priceForPosition(p.position)}
                highlighted={highlightId === p.id}
                onOpen={openProfile}
                onTakeSpot={takeSpot}
              />
            ))}
            {/* Pastki CTA — ro'yxat oxirida ham qo'shish imkoniyati */}
            <div className="mt-2 bg-white border border-dashed border-[#e0cdb4] rounded-xl p-5 md:p-6 text-center">
              <p className="text-sm md:text-[15px] font-bold text-[#241c14]">
                {pool === "education" ? "Siz ham o'quv markazi yoki repetitormisiz?" : "Siz ham IT mutaxassismisiz?"}
              </p>
              <p className="text-xs md:text-sm text-[#6b5d4d] mt-1">
                Reytingda o'rin oling — minglab foydalanuvchi profilingizni ko'radi.
              </p>
              <Button
                onClick={() => setView({ name: "add-profile" })}
                className="mt-3.5 bg-[#d97b29] hover:bg-[#c2691f] text-white font-bold rounded-lg h-10 px-5 text-sm"
              >
                Profil qo'shish — 20 000 so'mdan
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function SubTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs md:text-[13px] font-bold transition-all cursor-pointer",
        active ? "bg-[#d97b29] text-white shadow-sm" : "bg-white text-[#574634] border border-[#e8ddd0] hover:border-[#e0cdb4]"
      )}
      aria-pressed={active}
    >
      {icon}
      {label}
    </button>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3 md:gap-4" aria-label="Yuklanmoqda">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white border border-border rounded-xl p-4 md:p-5 flex gap-4">
          <Skeleton className="w-10 h-12 rounded-lg bg-[#f0e6da]" />
          <Skeleton className="w-14 h-14 rounded-xl bg-[#f0e6da]" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-5 w-1/2 bg-[#f0e6da]" />
            <Skeleton className="h-3.5 w-full bg-[#f0e6da]" />
            <Skeleton className="h-3.5 w-2/3 bg-[#f0e6da]" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full bg-[#f0e6da]" />
              <Skeleton className="h-5 w-16 rounded-full bg-[#f0e6da]" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Skeleton className="h-4 w-24 bg-[#f0e6da]" />
            <Skeleton className="h-8 w-28 rounded-lg bg-[#f0e6da]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  const { setCategoryFilter, setCityFilter, setEduSubFilter, pool } = useUstarStore();
  return (
    <div className="bg-white border border-border rounded-xl p-10 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-[#fdeedd] flex items-center justify-center">
        <SearchX className="w-7 h-7 text-[#d97b29]" />
      </div>
      <h3 className="mt-4 font-extrabold text-[#241c14] text-lg">
        {hasFilters ? "Hech narsa topilmadi" : "Reyting hali bo'sh"}
      </h3>
      <p className="mt-1.5 text-sm text-[#6b5d4d] max-w-sm mx-auto">
        {hasFilters
          ? "Tanlangan filtrlarga mos profil yo'q. Filtrlarni o'zgartirib ko'ring yoki bo'sh o'rinni egallang!"
          : "Birinchi bo'lib o'rin egallang — raqobatchilar sizdan keyin qoladi."}
      </p>
      {hasFilters ? (
        <Button
          variant="outline"
          onClick={() => {
            setCategoryFilter("all");
            setCityFilter("all");
            if (pool === "education") setEduSubFilter("all");
          }}
          className="mt-4 border-[#e8ddd0] text-[#574634] hover:bg-[#fdeedd] hover:text-[#b25e14] font-bold rounded-lg"
        >
          Filtrlarni tozalash
        </Button>
      ) : (
        <EmptyFirstSpot />
      )}
    </div>
  );
}

function EmptyFirstSpot() {
  const { setView } = useUstarStore();
  return (
    <Button
      onClick={() => setView({ name: "add-profile" })}
      className="mt-4 bg-[#d97b29] hover:bg-[#c2691f] text-white font-bold rounded-lg"
    >
      1-o'rinni olish — 20 000 so'm
    </Button>
  );
}

export { IT_SUBTYPES };
