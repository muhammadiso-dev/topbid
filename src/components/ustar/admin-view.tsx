"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Lock,
  Send,
  Trash2,
  RefreshCw,
  Bell,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Wallet,
  Heart,
  CreditCard,
  Clock3,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ProfileAvatar } from "./profile-avatar";
import { useUstarStore } from "@/lib/ustar/store";
import { useI18n } from "@/lib/ustar/i18n";
import { formatCompactSom, formatSom, timeAgo } from "@/lib/ustar/constants";
import { ADMIN_CARD } from "@/lib/ustar/payment-config";
import type { AdminLogDTO, ProfileDTO, VerificationRequestDTO } from "@/lib/ustar/types";
import { cn } from "@/lib/utils";

interface PaymentLogDTO {
  id: string;
  amount: number;
  cardLast4: string;
  matched: boolean;
  createdAt: string;
}

interface AwaitingBidDTO {
  id: string;
  amount: number;
  credit: number;
  createdAt: string;
  profileId: string;
  profileName: string;
  profileContact: string;
  profileCity: string;
  profileStatus: string;
}

interface AwaitingVerifyDTO {
  id: string;
  fee: number;
  createdAt: string;
  profileId: string;
  profileName: string;
  profileContact: string;
}

interface AdminData {
  logs: AdminLogDTO[];
  profiles: ProfileDTO[];
  pendingProfiles?: ProfileDTO[];
  awaitingBids?: AwaitingBidDTO[];
  awaitingVerifications?: AwaitingVerifyDTO[];
  verifications: VerificationRequestDTO[];
  revenue: { bids: number; verification: number; total: number; charity: number };
  paymentLogs?: PaymentLogDTO[];
}

/** Admin panel: bildirishnomalar + profil boshqaruvi + verifikatsiya */
export function AdminView() {
  const { setView } = useUstarStore();
  const { toast } = useToast();
  const { t, lang } = useI18n();

  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // Aksiya boshqaruvi
  const [promoSettings, setPromoSettings] = useState({ promoActive: true, promoPercent: 0.5, promoEndsAt: "" });
  const [promoEndInput, setPromoEndInput] = useState("");
  const [savingPromo, setSavingPromo] = useState(false);
  const [promoMsg, setPromoMsg] = useState<string | null>(null);

  const load = useCallback(
    (pw: string) => {
      setLoading(true);
      fetch(`/api/admin?password=${encodeURIComponent(pw)}`)
        .then((r) => {
          if (!r.ok) throw new Error("bad password");
          return r.json();
        })
        .then((d: AdminData) => {
          setData(d);
          setAuthed(true);
          sessionStorage.setItem("topbid_admin_pw", pw);
        })
        .catch(() => {
          toast({ title: t("admin.denied"), description: t("admin.deniedDesc"), variant: "destructive" });
        })
        .finally(() => setLoading(false));
    },
    [toast, t]
  );

  useEffect(() => {
    const saved = sessionStorage.getItem("topbid_admin_pw");
    if (saved) load(saved);
  }, [load]);

  // Aksiya sozlamalarini yuklash
  const loadPromoSettings = useCallback(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d: { promo: { active: boolean; percent: number; endsAt: string | null } }) => {
        setPromoSettings({
          promoActive: d.promo.active,
          promoPercent: d.promo.percent,
          promoEndsAt: d.promo.endsAt || "",
        });
        if (d.promo.endsAt) {
          setPromoEndInput(d.promo.endsAt.slice(0, 10));
        }
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (authed) loadPromoSettings();
  }, [authed, loadPromoSettings]);

  const savePromo = async (changes: Record<string, unknown>) => {
    setSavingPromo(true);
    setPromoMsg(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminPassword: sessionStorage.getItem("topbid_admin_pw") || password,
          ...changes,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Xatolik");
      setPromoMsg("✅ Saqlandi");
      loadPromoSettings();
      setTimeout(() => setPromoMsg(null), 2500);
    } catch (e) {
      setPromoMsg(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setSavingPromo(false);
    }
  };

  /** Admin qo'lda "pul tushdi" tasdiqlash — profil reytingga chiqadi / o'rin yangilanadi */
  const confirmPayment = async (type: "bid" | "verification", id: string, name: string) => {
    if (!confirm(`"${name}" — pul karta hisobiga tushganini tasdiqlaysizmi?\nProfil darhol reytingga chiqadi / o'rin yangilanadi.`)) return;
    setConfirmingId(id);
    try {
      const res = await fetch("/api/admin/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminPassword: sessionStorage.getItem("topbid_admin_pw") || password,
          type,
          id,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Xatolik");
      toast({
        title: "✅ To'lov tasdiqlandi",
        description: json.activated
          ? "Profil reytingga chiqdi!"
          : json.verification
            ? "Verifikatsiya to'lovi qabul qilindi — hujjatlar so'raladi"
            : `O'rin yangilandi: ${json.position}-o'rin`,
      });
      load(sessionStorage.getItem("topbid_admin_pw") || password);
    } catch (e) {
      toast({
        title: "Xatolik",
        description: e instanceof Error ? e.message : "Tasdiqlashda xatolik",
        variant: "destructive",
      });
    } finally {
      setConfirmingId(null);
    }
  };

  const handleDelete = async (profile: ProfileDTO) => {
    if (!confirm(`"${profile.name}" ${t("admin.deleteConfirm")}`)) return;
    setDeletingId(profile.id);
    try {
      const res = await fetch(`/api/profiles/${profile.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminPassword: sessionStorage.getItem("topbid_admin_pw") || password,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "error");
      toast({ title: `🗑 ${t("admin.deleted")}`, description: t("admin.deletedDesc") });
      load(sessionStorage.getItem("topbid_admin_pw") || password);
    } catch (e) {
      toast({
        title: t("err.generic"),
        description: e instanceof Error ? e.message : t("err.server"),
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleVerifyDecision = async (req: VerificationRequestDTO, decision: "approve" | "reject") => {
    if (decision === "reject" && !confirm(`"${req.profileName}" ${t("admin.verifyRejectConfirm")} ${formatSom(req.fee, lang)}`)) return;
    setVerifyingId(req.id);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: req.id,
          decision,
          adminPassword: sessionStorage.getItem("topbid_admin_pw") || password,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "error");
      toast({
        title: decision === "approve" ? `✅ ${t("admin.verifyApproveTitle")}` : t("admin.verifyRejectTitle"),
        description:
          decision === "approve"
            ? `${req.profileName} — ${t("admin.verifyApproveDesc")}`
            : `${formatSom(req.fee, lang)} ${t("admin.verifyRefunded")}`,
      });
      load(sessionStorage.getItem("topbid_admin_pw") || password);
    } catch (e) {
      toast({
        title: t("err.generic"),
        description: e instanceof Error ? e.message : t("err.server"),
        variant: "destructive",
      });
    } finally {
      setVerifyingId(null);
    }
  };

  // ===== Login =====
  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 pb-16 pt-16 md:pt-24">
        <div className="bg-white dark:bg-[#201a14] border border-border rounded-2xl p-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#241c14] flex items-center justify-center">
            <Lock className="w-6 h-6 text-[#e9a05c]" />
          </div>
          <h1 className="mt-4 font-extrabold text-lg text-[#241c14] dark:text-[#f2ebe2]">{t("admin.title")}</h1>
          <p className="text-xs text-[#94836f] dark:text-[#8a7a68] font-medium mt-1">{t("admin.subtitle")}</p>
          <form
            className="mt-5 space-y-3 text-left"
            onSubmit={(e) => {
              e.preventDefault();
              setLoggingIn(true);
              load(password);
              setTimeout(() => setLoggingIn(false), 100);
            }}
          >
            <div>
              <Label htmlFor="admin-pw" className="text-[13px] font-bold text-[#574634] dark:text-[#c9bba7] mb-1.5 block">
                {t("admin.password")}
              </Label>
              <Input
                id="admin-pw"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 bg-white text-sm font-semibold rounded-lg border-[#e8ddd0]"
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              disabled={loggingIn || loading}
              className="w-full h-11 bg-[#241c14] hover:bg-[#3a2e22] text-white font-extrabold rounded-lg"
            >
              {loading ? t("admin.checking") : t("admin.login")}
            </Button>
          </form>
          <Button
            variant="ghost"
            onClick={() => setView({ name: "home" })}
            className="mt-3 text-[#94836f] dark:text-[#8a7a68] hover:bg-[#f6efe6] dark:bg-[#2b241b] font-semibold text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t("admin.backHome")}
          </Button>

        </div>
      </div>
    );
  }

  const pendingVerifications = data?.verifications.filter((v) => v.status === "pending") ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16">
      <div className="pt-6 md:pt-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setView({ name: "home" })}
            className="rounded-lg hover:bg-[#f6efe6] dark:bg-[#2b241b] text-[#574634] dark:text-[#c9bba7]"
            aria-label="Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-[#241c14] dark:text-[#f2ebe2]">{t("admin.title")}</h1>
            <p className="text-xs text-[#94836f] dark:text-[#8a7a68] font-medium mt-0.5">{t("admin.panelSubtitle")}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => load(sessionStorage.getItem("topbid_admin_pw") || password)}
          className="border-[#e8ddd0] text-[#574634] dark:text-[#c9bba7] hover:bg-[#fdeedd] dark:bg-[#3a2c1c] font-bold rounded-lg shrink-0"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          <span className="hidden sm:inline">{t("admin.refresh")}</span>
        </Button>
      </div>

      {/* Umumiy statistika */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-6">
        <MiniStat label={t("admin.statProfiles")} value={`${data?.profiles.length ?? 0}`} />
        <MiniStat
          label={t("admin.statRevenue")}
          value={data ? formatCompactSom(data.revenue.total, lang) : "—"}
          icon={<Wallet className="w-3 h-3" />}
        />
        <MiniStat label={t("admin.statBids")} value={data ? formatCompactSom(data.revenue.bids, lang) : "—"} />
        <MiniStat label={t("admin.statVerify")} value={data ? formatCompactSom(data.revenue.verification, lang) : "—"} />
        <MiniStat label={t("stats.charity")} value={data ? formatCompactSom(data.revenue.charity, lang) : "—"} icon={<Heart className="w-3 h-3" />} />
      </div>

      {/* To'lov kartasi — admin ko'rinishi */}
      <div className="mt-3 bg-gradient-to-br from-[#241c14] via-[#3a2e22] to-[#241c14] rounded-2xl p-4 flex items-center justify-between gap-3 text-white">
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#e9a05c]">To'lov kartasi</p>
          <p className="font-mono text-base md:text-lg font-extrabold tracking-[0.1em] tabular-nums mt-1">{ADMIN_CARD.number}</p>
          <p className="text-[11px] text-white/70 font-bold mt-0.5">{ADMIN_CARD.holder} · {ADMIN_CARD.bank}</p>
        </div>
        <span className="text-[10px] font-bold text-[#e9a05c] bg-white/10 px-2.5 py-1 rounded-full shrink-0">.env: ADMIN_CARD_NUMBER</span>
      </div>

      {/* ===== AKSIYA BOSHQARUVI ===== */}
      <section className="mt-6" aria-label="Aksiya boshqaruvi">
        <h2 className="font-extrabold text-[#241c14] dark:text-[#f2ebe2] flex items-center gap-2 text-sm">
          <Rocket className="w-4 h-4 text-[#d97b29]" />
          Aksiya boshqaruvi
        </h2>
        <div className="mt-3 bg-white dark:bg-[#201a14] border border-border rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-extrabold text-[#241c14] dark:text-[#f2ebe2]">Aksiya faol</p>
              <p className="text-[11px] text-[#94836f] dark:text-[#8a7a68] font-medium mt-0.5">
                O'chirilsa, narxlar to'liq (chegirmasiz) bo'ladi
              </p>
            </div>
            <button
              onClick={() => savePromo({ promoActive: !promoSettings.promoActive })}
              disabled={savingPromo}
              className={cn(
                "relative w-14 h-8 rounded-full transition-colors cursor-pointer shrink-0",
                promoSettings.promoActive ? "bg-[#d97b29]" : "bg-[#e0d3c2]"
              )}
              role="switch"
              aria-checked={promoSettings.promoActive}
              aria-label="Aksiya"
            >
              <span
                className={cn(
                  "absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all",
                  promoSettings.promoActive ? "left-7" : "left-1"
                )}
              />
            </button>
          </div>

          <div>
            <Label className="text-[13px] font-bold text-[#574634] dark:text-[#c9bba7] mb-1.5 block">
              Chegirma foizi: <span className="text-[#d97b29]">{Math.round(promoSettings.promoPercent * 100)}%</span>
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={Math.round(promoSettings.promoPercent * 100)}
                onChange={(e) => setPromoSettings({ ...promoSettings, promoPercent: Number(e.target.value) / 100 })}
                className="flex-1 accent-[#d97b29] cursor-pointer"
                aria-label="Chegirma foizi"
              />
              <span className="text-[11px] text-[#94836f] dark:text-[#8a7a68] font-bold tabular-nums w-8">
                {Math.round(promoSettings.promoPercent * 100)}%
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="promo-end" className="text-[13px] font-bold text-[#574634] dark:text-[#c9bba7] mb-1.5 block">
              Tugash sanasi
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="promo-end"
                type="date"
                value={promoEndInput}
                onChange={(e) => setPromoEndInput(e.target.value)}
                className="h-10 bg-white text-sm font-semibold rounded-lg border-[#e8ddd0] flex-1"
              />
              <Button
                size="sm"
                onClick={() => savePromo({ promoEndsAt: new Date(promoEndInput + "T23:59:59+05:00").toISOString() })}
                disabled={savingPromo || !promoEndInput}
                className="h-10 bg-[#d97b29] hover:bg-[#c2691f] text-white font-extrabold rounded-lg text-xs shrink-0"
              >
                Saqlash
              </Button>
            </div>
            {promoSettings.promoEndsAt && (
              <p className="text-[11px] text-[#94836f] dark:text-[#8a7a68] font-medium mt-1.5">
                Hozir: {new Date(promoSettings.promoEndsAt).toLocaleDateString("ru-RU")} gacha
              </p>
            )}
          </div>

          <Button
            onClick={() => savePromo({ promoPercent: promoSettings.promoPercent })}
            disabled={savingPromo}
            className="w-full h-10 bg-[#241c14] hover:bg-[#3a2e22] text-white font-extrabold rounded-lg text-xs"
          >
            {savingPromo ? "Saqlanmoqda..." : "Foizni saqlash"}
          </Button>

          {promoMsg && (
            <p className={cn("text-xs font-bold text-center", promoMsg.includes("✅") ? "text-green-600" : "text-red-600")}>
              {promoMsg}
            </p>
          )}
        </div>
      </section>

      {/* ===== PENDING PROFILLAR (pul kutilmoqda) ===== */}
      {(data?.pendingProfiles?.length ?? 0) > 0 && (
        <section className="mt-6" aria-label="Pending profillar">
          <h2 className="font-extrabold text-[#241c14] dark:text-[#f2ebe2] flex items-center gap-2 text-sm">
            <Clock3 className="w-4 h-4 text-[#a86a00]" />
            Pul kutilmoqda ({data?.pendingProfiles?.length})
          </h2>
          <div className="mt-3 bg-[#fff8ec] border border-[#f0d5b8] rounded-2xl divide-y divide-[#f5e8d0] overflow-hidden">
            {data!.pendingProfiles!.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3.5">
                <ProfileAvatar name={p.name} imageUrl={p.imageUrl} size={36} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[13px] text-[#241c14] dark:text-[#f2ebe2] truncate">{p.name}</p>
                  <p className="text-[11px] text-[#94836f] dark:text-[#8a7a68] font-medium truncate">
                    {p.city} · {formatSom(p.totalBid, lang)} reytingga
                  </p>
                </div>
                <span className="text-[10px] font-extrabold bg-[#fff4d6] text-[#a86a00] px-2 py-1 rounded-full shrink-0">
                  pul kutilmoqda
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== KUTILAYOTGAN TO'LUVLAR (pul kutilmoqda) ===== */}
      <section className="mt-6" aria-label="Kutilayotgan to'lovlar">
        <h2 className="font-extrabold text-[#241c14] dark:text-[#f2ebe2] flex items-center gap-2 text-sm">
          <Clock3 className="w-4 h-4 text-[#a86a00]" />
          Pul kutilmoqda ({(data?.awaitingBids?.length ?? 0) + (data?.awaitingVerifications?.length ?? 0)})
        </h2>

        {(data?.awaitingBids?.length ?? 0) === 0 && (data?.awaitingVerifications?.length ?? 0) === 0 ? (
          <p className="mt-3 text-center text-xs text-[#94836f] dark:text-[#8a7a68] font-medium bg-white dark:bg-[#201a14] border border-border rounded-xl py-4">
            Kutilayotgan to'lovlar yo'q
          </p>
        ) : (
          <div className="mt-3 bg-white border border-[#f0d5b8] rounded-2xl divide-y divide-[#f5e8d0] overflow-hidden">
            {/* O'rin to'lovlari */}
            {data?.awaitingBids?.map((b) => (
              <div key={b.id} className="flex items-center gap-3 p-3.5 bg-[#fffaf2]">
                <ProfileAvatar name={b.profileName} size={36} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[13px] text-[#241c14] dark:text-[#f2ebe2] truncate">
                    {b.profileName}
                    {b.profileStatus === "pending" && (
                      <span className="ml-1.5 text-[9px] font-extrabold uppercase bg-[#fff4d6] text-[#a86a00] px-1.5 py-0.5 rounded-full">
                        yangi
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-[#94836f] dark:text-[#8a7a68] font-medium truncate">
                    {formatSom(b.amount, lang)} · {b.profileCity} · {timeAgo(b.createdAt, lang)}
                    {b.profileStatus !== "pending" && ` · +${formatSom(b.credit, lang)}`}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => confirmPayment("bid", b.id, b.profileName)}
                  disabled={confirmingId === b.id}
                  className="h-9 bg-[#d97b29] hover:bg-[#c2691f] text-white font-extrabold text-xs rounded-lg px-3 shrink-0"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Pul tushdi ✓
                </Button>
              </div>
            ))}
            {/* Verifikatsiya to'lovlari */}
            {data?.awaitingVerifications?.map((v) => (
              <div key={v.id} className="flex items-center gap-3 p-3.5 bg-[#fffaf2]">
                { }
                <img src="/verify-badge-48.png" alt="verify" className="w-9 h-9 rounded-lg shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[13px] text-[#241c14] dark:text-[#f2ebe2] truncate">
                    {v.profileName}
                    <span className="ml-1.5 text-[9px] font-extrabold uppercase bg-[#fff3df] text-[#b45f14] px-1.5 py-0.5 rounded-full">
                      verifikatsiya
                    </span>
                  </p>
                  <p className="text-[11px] text-[#94836f] dark:text-[#8a7a68] font-medium truncate">
                    {formatSom(v.fee, lang)} · {v.profileContact} · {timeAgo(v.createdAt, lang)}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => confirmPayment("verification", v.id, v.profileName)}
                  disabled={confirmingId === v.id}
                  className="h-9 bg-[#d97b29] hover:bg-[#c2691f] text-white font-extrabold text-xs rounded-lg px-3 shrink-0"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Pul tushdi ✓
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== TO'LUVLAR TARIXI (avtomatik) ===== */}
      <section className="mt-6" aria-label="To'lovlar tarixi">
        <h2 className="font-extrabold text-[#241c14] dark:text-[#f2ebe2] flex items-center gap-2 text-sm">
          <CreditCard className="w-4 h-4 text-[#d97b29]" />
          To'lovlar tarixi
          {(data?.paymentLogs?.length ?? 0) > 0 && (
            <span className="text-[10px] font-extrabold bg-[#d97b29] text-white px-2 py-0.5 rounded-full">
              {data?.paymentLogs?.length}
            </span>
          )}
        </h2>
        {(data?.paymentLogs?.length ?? 0) === 0 ? (
          <p className="mt-3 text-center text-xs text-[#94836f] dark:text-[#8a7a68] font-medium bg-white dark:bg-[#201a14] border border-border rounded-xl py-4">
            Tasdiqlangan to'lovlar shu yerda ko'rinadi
          </p>
        ) : (
          <div className="mt-3 bg-white dark:bg-[#201a14] border border-border rounded-2xl divide-y divide-[#f0e6da] overflow-hidden">
            {data!.paymentLogs!.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3.5">
                <span className={p.matched ? "text-green-600" : "text-[#a86a00]"}>
                  {p.matched ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-[13px] text-[#241c14] dark:text-[#f2ebe2] tabular-nums">
                    {formatSom(p.amount, lang)}
                  </p>
                  <p className="text-[11px] text-[#94836f] dark:text-[#8a7a68] font-medium">
                    {p.cardLast4 ? `****${p.cardLast4} · ` : ""}{timeAgo(p.createdAt, lang)}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-extrabold px-2 py-1 rounded-full shrink-0",
                    p.matched ? "bg-green-50 text-green-700" : "bg-[#fff4d6] text-[#a86a00]"
                  )}
                >
                  {p.matched ? "Match" : "Kutilmoqda"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* VERIFIKATSIYA */}
      <section className="mt-6" aria-label={t("admin.verifySection")}>
        <h2 className="font-extrabold text-[#241c14] dark:text-[#f2ebe2] flex items-center gap-2 text-sm">
          <img src="/verify-badge-48.png" alt="verify" className="w-4 h-4" />
          {t("admin.verifySection")}
          {pendingVerifications.length > 0 && (
            <span className="text-[10px] font-extrabold bg-[#d97b29] text-white px-2 py-0.5 rounded-full">
              {pendingVerifications.length} {t("admin.verifyNew")}
            </span>
          )}
        </h2>

        {loading && !data ? (
          <div className="mt-3 space-y-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl bg-[#f0e6da]" />
            ))}
          </div>
        ) : (data?.verifications.length ?? 0) === 0 ? (
          <p className="mt-3 text-center text-xs text-[#94836f] dark:text-[#8a7a68] font-medium bg-white dark:bg-[#201a14] border border-border rounded-xl py-5">
            {t("admin.verifyEmpty")}
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {data!.verifications.map((v) => (
              <div
                key={v.id}
                className={cn(
                  "bg-white border rounded-xl p-3.5 flex items-center gap-3",
                  v.status === "pending" ? "border-[#f0d5b8] bg-[#fffaf2]" : "border-border"
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                    v.status === "pending" ? "bg-[#fff3df]" : v.status === "approved" ? "bg-green-50" : "bg-[#f6efe6] dark:bg-[#2b241b]"
                  )}
                >
                  {v.status === "approved" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : v.status === "pending" ? (
                     
                    <img src="/verify-badge-48.png" alt="verify" className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-[#94836f] dark:text-[#8a7a68]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[13px] text-[#241c14] dark:text-[#f2ebe2] truncate">{v.profileName}</p>
                  <p className="text-[11px] text-[#94836f] dark:text-[#8a7a68] font-medium truncate">
                    {v.profileContact} • {formatSom(v.fee, lang)} • {timeAgo(v.createdAt, lang)}
                  </p>
                  {v.status === "pending" && (
                    <p className="text-[10px] text-[#b45f14] font-bold mt-0.5">{t("admin.docsNote")}</p>
                  )}
                </div>
                {v.status === "pending" ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleVerifyDecision(v, "approve")}
                      disabled={verifyingId === v.id}
                      className="h-9 bg-[#d97b29] hover:bg-[#c2691f] text-white font-extrabold text-xs rounded-lg px-2.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t("admin.approve")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerifyDecision(v, "reject")}
                      disabled={verifyingId === v.id}
                      className="h-9 border-red-200 text-red-600 hover:bg-red-50 font-extrabold text-xs rounded-lg px-2.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {t("admin.reject")}
                    </Button>
                  </div>
                ) : (
                  <span
                    className={cn(
                      "text-[10px] font-extrabold px-2 py-1 rounded-full shrink-0",
                      v.status === "approved" ? "bg-green-50 text-green-700" : "bg-[#f6efe6] dark:bg-[#2b241b] text-[#94836f] dark:text-[#8a7a68]"
                    )}
                  >
                    {v.status === "approved" ? t("admin.approved") : t("admin.rejected")}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* BILDIRISHNOMALAR */}
      <section className="mt-6" aria-label={t("admin.notifications")}>
        <h2 className="font-extrabold text-[#241c14] dark:text-[#f2ebe2] flex items-center gap-2 text-sm">
          <Bell className="w-4 h-4 text-[#d97b29]" />
          {t("admin.notifications")}
          <span className="text-[10px] font-bold text-[#229ed9] bg-[#e8f4fc] px-2 py-0.5 rounded-full uppercase tracking-wide">
            Telegram
          </span>
        </h2>

        {loading && !data ? (
          <div className="mt-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl bg-[#f0e6da]" />
            ))}
          </div>
        ) : (
          <div className="mt-3 bg-[#eef4f9] rounded-2xl p-3 space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
            {(data?.logs.length ?? 0) === 0 ? (
              <p className="text-center text-xs text-[#94836f] dark:text-[#8a7a68] font-medium py-6">{t("admin.notifEmpty")}</p>
            ) : (
              data!.logs.map((log) => (
                <div key={log.id} className="bg-white dark:bg-[#201a14] rounded-xl rounded-tl-sm px-3.5 py-2.5 shadow-sm max-w-[92%]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#229ed9] uppercase tracking-wide">
                      <Send className="w-3 h-3" />
                      TopBid Bot
                    </span>
                    <span className="text-[10px] text-[#94836f] dark:text-[#8a7a68] font-medium">{timeAgo(log.createdAt, lang)}</span>
                  </div>
                  <p className="text-[13px] text-[#241c14] dark:text-[#f2ebe2] font-medium leading-relaxed mt-1 whitespace-pre-line">
                    {log.message}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* PROILLAR */}
      <section className="mt-6" aria-label={t("admin.profilesSection")}>
        <h2 className="font-extrabold text-[#241c14] dark:text-[#f2ebe2] flex items-center gap-2 text-sm">
          <ShieldAlert className="w-4 h-4 text-[#d97b29]" />
          {t("admin.profilesSection")} ({data?.profiles.length ?? 0})
        </h2>

        <div className="mt-3 bg-white dark:bg-[#201a14] border border-border rounded-2xl divide-y divide-[#f0e6da] overflow-hidden">
          {data?.profiles.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3.5">
              <span className="text-xs font-extrabold text-[#c4b5a1] w-6 text-center shrink-0 tabular-nums">
                {p.position}
              </span>
              <ProfileAvatar name={p.name} imageUrl={p.imageUrl} size={36} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[13px] text-[#241c14] dark:text-[#f2ebe2] truncate">{p.name}</p>
                <p className="text-[11px] text-[#94836f] dark:text-[#8a7a68] font-medium truncate">
                  {p.pool === "education" ? t("admin.eduPool") : t("admin.itPool")} • {p.categoryName} •{" "}
                  {formatSom(p.totalBid, lang)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-full hidden sm:inline",
                    p.verifyStatus === "verified"
                      ? "bg-[#fff3df] text-[#b45f14]"
                      : p.verifyStatus === "pending"
                        ? "bg-[#fff4d6] text-[#a86a00]"
                        : "bg-[#f6efe6] dark:bg-[#2b241b] text-[#94836f] dark:text-[#8a7a68]"
                  )}
                >
                  {p.verifyStatus === "verified"
                    ? t("admin.statusVerified")
                    : p.verifyStatus === "pending"
                      ? t("admin.statusPending")
                      : t("admin.statusNone")}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(p)}
                  disabled={deletingId === p.id}
                  className="w-9 h-9 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600"
                  aria-label={`${p.name} ${t("admin.delete")}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {data?.profiles.length === 0 && (
            <p className="text-center text-xs text-[#94836f] dark:text-[#8a7a68] font-medium py-8">{t("admin.profilesEmpty")}</p>
          )}
        </div>

        <div className="mt-3 flex items-start gap-2 text-[11px] text-[#94836f] dark:text-[#8a7a68] font-medium bg-[#fff9f2] border border-[#f0d5b8] rounded-xl px-3.5 py-3">
          <CheckCircle2 className="w-4 h-4 text-[#d97b29] shrink-0 mt-px" />
          {t("admin.deleteNote")}
        </div>
      </section>
    </div>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#201a14] border border-border rounded-xl px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#94836f] dark:text-[#8a7a68] leading-none flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="text-sm font-extrabold text-[#241c14] dark:text-[#f2ebe2] mt-1.5 truncate tabular-nums">{value}</p>
    </div>
  );
}
