"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  MapPin,
  Eye,
  MousePointerClick,
  Globe,
  Send,
  Instagram,
  Globe2,
  MessageSquare,
  Star,
  TrendingUp,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ProfileAvatar } from "./profile-avatar";
import { StarRating } from "./star-rating";
import { VerifyModal } from "./verify-modal";
import { useUstarStore, getSessionId } from "@/lib/ustar/store";
import {
  contactInfo,
  formatCompactNumber,
  formatSom,
  promoInfo,
  timeAgo,
} from "@/lib/ustar/constants";
import type { ProfileDTO, ReviewDTO } from "@/lib/ustar/types";
import { cn } from "@/lib/utils";

/** Profil batafsil sahifasi — ma'lumotlar + bepul sharhlar + verifikatsiya */
export function ProfileDetailView({ profileId }: { profileId: string }) {
  const { setView, openAddForm } = useUstarStore();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ProfileDTO | null>(null);
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyOpen, setVerifyOpen] = useState(false);

  const promo = promoInfo();

  const load = useCallback(
    (countView: boolean) => {
      fetch(`/api/profiles/${profileId}`)
        .then((r) => r.json())
        .then((d: { profile: ProfileDTO; reviews: ReviewDTO[] }) => {
          setProfile(d.profile);
          setReviews(d.reviews);
        })
        .catch(() => null)
        .finally(() => setLoading(false));

      if (countView) {
        fetch(`/api/profiles/${profileId}/click`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "view" }),
        }).catch(() => null);
      }
    },
    [profileId]
  );

  useEffect(() => {
    load(true);
  }, [load]);

  const handleContactClick = () => {
    if (!profile) return;
    fetch(`/api/profiles/${profileId}/click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "click" }),
    })
      .then(() => {
        setProfile((p) => (p ? { ...p, clicks: p.clicks + 1 } : p));
      })
      .catch(() => null);
  };

  // Verifikatsiya to'lovidan so'ng — so'rov yaratish
  const handleVerifyPaid = async () => {
    const res = await fetch(`/api/profiles/${profileId}/verify`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Xatolik");
    toast({
      title: "🛡️ So'rov yuborildi!",
      description: data.message || "Admin 24 soat ichida ko'rib chiqadi.",
    });
    load(false);
  };

  if (loading && !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 pb-16 pt-6 md:pt-8 space-y-4">
        <Skeleton className="h-10 w-40 rounded-lg bg-[#f0e6da]" />
        <Skeleton className="h-56 rounded-2xl bg-[#f0e6da]" />
        <Skeleton className="h-40 rounded-2xl bg-[#f0e6da]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 pb-16 pt-16 text-center">
        <p className="font-extrabold text-lg text-[#241c14]">Profil topilmadi</p>
        <Button
          onClick={() => setView({ name: "home" })}
          className="mt-4 bg-[#d97b29] hover:bg-[#c2691f] text-white font-extrabold rounded-lg"
        >
          Reytingga qaytish
        </Button>
      </div>
    );
  }

  const contact = contactInfo(profile.contactUrl);
  const ContactIcon =
    contact.kind === "telegram" ? Send : contact.kind === "instagram" ? Instagram : Globe2;
  const isTop3 = profile.position <= 3;

  const verifyBadge =
    profile.verifyStatus === "verified" ? (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1d7ed8] bg-[#e8f2fc] px-2 py-1 rounded-full">
        <BadgeCheck className="w-3.5 h-3.5" />
        Tekshirilgan
      </span>
    ) : profile.verifyStatus === "pending" ? (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#a86a00] bg-[#fff4d6] px-2 py-1 rounded-full">
        <Clock3 className="w-3.5 h-3.5" />
        Tekshirilmoqda
      </span>
    ) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16">
      {/* Orqaga */}
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

      {/* Profil kartochkasi */}
      <article
        className={cn(
          "mt-4 bg-white rounded-2xl border p-5 md:p-6 relative",
          isTop3 && profile.position === 1 && "top-glow border-transparent",
          isTop3 && profile.position !== 1 && "border-2 border-[#e9b98a]",
          !isTop3 && "border-border"
        )}
      >
        {isTop3 && (
          <div
            className={cn(
              "absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide shadow-sm",
              profile.position === 1
                ? "bg-[#d97b29] text-white"
                : "bg-[#fdeedd] text-[#b25e14] border border-[#f0d5b8]"
            )}
          >
            TOP {profile.position}
          </div>
        )}

        <div className="flex items-start gap-4 flex-col sm:flex-row">
          <ProfileAvatar name={profile.name} imageUrl={profile.imageUrl} size={72} className="rounded-2xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-extrabold text-[#241c14] leading-tight">
                {profile.name}
              </h1>
              {verifyBadge}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <span className="text-xs font-bold text-[#b25e14] bg-[#fdeedd] px-2.5 py-1 rounded-full">
                {profile.categoryGroup ? `${profile.categoryGroup} · ${profile.categoryName}` : profile.categoryName}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#574634] bg-[#f6efe6] px-2.5 py-1 rounded-full">
                <MapPin className="w-3 h-3" />
                {profile.city}
              </span>
              {profile.pool === "education" && (
                <span className="text-xs font-semibold text-[#574634] bg-[#f6efe6] px-2.5 py-1 rounded-full">
                  {profile.subType === "center" ? "Ta'lim markazi" : "Individual repetitor"}
                </span>
              )}
            </div>
            <p className="text-sm md:text-[15px] text-[#6b5d4d] leading-relaxed mt-3">
              {profile.description}
            </p>
          </div>
        </div>

        {/* Statistika */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
          <Stat label="Global o'rin" value={`${profile.position}-o'rin`} accent icon={<Globe className="w-3.5 h-3.5" />} />
          <Stat label="Reyting summasi" value={formatSom(profile.totalBid)} />
          <Stat label="Ko'rilgan" value={formatCompactNumber(profile.views)} icon={<Eye className="w-3.5 h-3.5" />} />
          <Stat
            label="Kliklar"
            value={formatCompactNumber(profile.clicks)}
            icon={<MousePointerClick className="w-3.5 h-3.5" />}
          />
        </div>

        {/* Kontakt + raqobat */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <a
            href={contact.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleContactClick}
            className="flex-1 h-11 inline-flex items-center justify-center gap-2 bg-[#d97b29] hover:bg-[#c2691f] text-white font-extrabold rounded-lg text-sm transition-colors active:scale-[0.98]"
          >
            <ContactIcon className="w-4 h-4" />
            Bog'lanish — {contact.label}
          </a>
          <Button
            variant="outline"
            onClick={() => openAddForm(profile.position)}
            className="h-11 border-[#e8ddd0] text-[#574634] hover:bg-[#fdeedd] hover:text-[#b25e14] hover:border-[#f0d5b8] font-extrabold rounded-lg text-sm"
          >
            <TrendingUp className="w-4 h-4" />
            O'rinni yaxshilash
          </Button>
        </div>
      </article>

      {/* Verifikatsiya bloki (tekshirilmagan profillar uchun) */}
      {profile.verifyStatus !== "verified" && (
        <section className="mt-4" aria-label="Verifikatsiya">
          {profile.verifyStatus === "pending" ? (
            <div className="bg-[#fffaf0] border border-[#f0d5b8] rounded-2xl p-4 md:p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fff4d6] flex items-center justify-center shrink-0">
                <Clock3 className="w-5 h-5 text-[#a86a00]" />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-sm text-[#241c14]">
                  Verifikatsiya ko'rib chiqilmoqda
                </h3>
                <p className="text-[13px] text-[#6b5d4d] leading-relaxed mt-1">
                  So'rovingiz admin da. Hujjatlaringiz tekshirilgach, profilingizda ko'k
                  «Tekshirilgan» belgisi paydo bo'ladi (odatda 24 soat ichida).
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-[#e8f2fc] to-[#f0f7ff] border border-[#cbe9f8] rounded-2xl p-4 md:p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-[#1d7ed8]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-sm text-[#241c14]">
                    «Tekshirilgan» profil bo'ling
                  </h3>
                  <p className="text-[13px] text-[#574634] leading-relaxed mt-1">
                    Ko'k belgi mijozlar ishonchini 2-3 barobar oshiradi. Diplom yoki
                    litsenziyani tasdiqlang — bir martalik to'lov.
                  </p>
                  <Button
                    onClick={() => setVerifyOpen(true)}
                    className="mt-3 bg-[#1d7ed8] hover:bg-[#1769b8] text-white font-extrabold rounded-lg h-10 text-sm active:scale-[0.98] transition-transform"
                  >
                    <BadgeCheck className="w-4 h-4" />
                    Verifikatsiyadan o'tish
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Sharhlar */}
      <section className="mt-6" aria-label="Sharhlar">
        <ReviewsSection
          profile={profile}
          reviews={reviews}
          onAdded={() => load(false)}
          toast={toast}
        />
      </section>

      {/* Verifikatsiya to'lov modali */}
      <VerifyModal
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        promoActive={promo.active}
        onPaid={handleVerifyPaid}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl px-3 py-2.5 border",
        accent ? "bg-[#fff9f2] border-[#f0d5b8]" : "bg-[#fffdfa] border-[#f0e6da]"
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#94836f] leading-none flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p
        className={cn(
          "text-sm font-extrabold mt-1.5 tabular-nums truncate",
          accent ? "text-[#b25e14]" : "text-[#241c14]"
        )}
      >
        {value}
      </p>
    </div>
  );
}

/** Sharhlar bo'limi: o'rtacha baho + ro'yxat + forma (rate-limit bilan) */
function ReviewsSection({
  profile,
  reviews,
  onAdded,
  toast,
}: {
  profile: ProfileDTO;
  reviews: ReviewDTO[];
  onAdded: () => void;
  toast: ReturnType<typeof useToast>["toast"];
}) {
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    setAlreadyReviewed(false);
  }, [profile.id]);

  const avg = reviews.length > 0 ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        title: "Baho bering",
        description: "Yulduzchalardan baho tanlang (1-5)",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/profiles/${profile.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: getSessionId(),
          authorName,
          rating,
          comment,
        }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setAlreadyReviewed(true);
        throw new Error(data.error);
      }
      if (!res.ok) throw new Error(data.error || "Xatolik");
      toast({ title: "Rahmat! 🌟", description: "Sharhingiz qo'shildi." });
      setAuthorName("");
      setRating(0);
      setComment("");
      setAlreadyReviewed(true);
      onAdded();
    } catch (err) {
      toast({
        title: "Xatolik",
        description: err instanceof Error ? err.message : "Sharh qo'shilmadi",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-border rounded-2xl p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-extrabold text-lg text-[#241c14] flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#d97b29]" />
          Sharhlar
        </h2>
        <div className="flex items-center gap-2.5">
          <span className="text-3xl font-extrabold text-[#241c14] tabular-nums leading-none">
            {avg > 0 ? avg.toFixed(1) : "—"}
          </span>
          <div>
            <StarRating value={avg} size={16} />
            <p className="text-[11px] text-[#94836f] font-semibold mt-1">{reviews.length} ta sharh</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-[#94836f] font-medium mt-2 flex items-center gap-1.5">
        <Star className="w-3.5 h-3.5 text-[#d97b29]" />
        Sharhlar bepul va reytingdagi o'ringa ta'sir qilmaydi — faqat ishonch uchun
      </p>

      {reviews.length > 0 ? (
        <div className="mt-5 space-y-3 max-h-96 overflow-y-auto scrollbar-thin pr-1 -mr-1">
          {reviews.map((r) => (
            <div key={r.id} className="bg-[#fffdfa] border border-[#f0e6da] rounded-xl p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-[#241c14]">{r.authorName}</span>
                <span className="text-[11px] text-[#94836f] font-medium">{timeAgo(r.createdAt)}</span>
              </div>
              <StarRating value={r.rating} size={13} className="mt-1.5" />
              {r.comment && (
                <p className="text-[13px] text-[#574634] leading-relaxed mt-2">{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#94836f] font-medium mt-4 bg-[#fffdfa] border border-dashed border-[#e0d3c2] rounded-xl px-4 py-3.5 text-center">
          Hozircha sharh yo'q — birinchi bo'lib fikr bildiring!
        </p>
      )}

      <div className="mt-6 pt-5 border-t border-[#f0e6da]">
        <h3 className="font-extrabold text-sm text-[#241c14]">Fikringizni qoldiring</h3>
        {alreadyReviewed ? (
          <div className="mt-3 flex items-center gap-2.5 bg-[#f6efe6] border border-[#e8ddd0] rounded-xl px-4 py-3.5">
            <Lock className="w-4 h-4 text-[#94836f] shrink-0" />
            <p className="text-[13px] font-semibold text-[#574634]">
              Siz bu profilga allaqachon sharh yozgansiz. Har bir foydalanuvchi bir profilga bir
              marta yozadi.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-3 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="reviewer" className="text-[13px] font-bold text-[#574634] mb-1.5 block">
                  Ismingiz
                </Label>
                <Input
                  id="reviewer"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  maxLength={40}
                  required
                  placeholder="Masalan: Aziza"
                  className="h-10 bg-white text-sm font-semibold rounded-lg border-[#e8ddd0]"
                />
              </div>
              <div>
                <Label className="text-[13px] font-bold text-[#574634] mb-1.5 block">Baho</Label>
                <StarRating value={rating} onChange={setRating} size={26} interactive />
              </div>
            </div>
            <div>
              <Label htmlFor="comment" className="text-[13px] font-bold text-[#574634] mb-1.5 block">
                Sharh
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={2}
                required
                placeholder="Xizmat sifati qanday edi?"
                className="bg-white text-sm font-medium rounded-lg resize-none border-[#e8ddd0]"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#241c14] hover:bg-[#3a2e22] text-white font-extrabold rounded-lg h-10 text-sm"
            >
              {submitting ? "Yuborilmoqda..." : "Sharh yuborish"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
