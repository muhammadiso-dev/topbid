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
  BadgeCheck,
  XCircle,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ProfileAvatar } from "./profile-avatar";
import { useUstarStore } from "@/lib/ustar/store";
import { formatCompactSom, formatSom, timeAgo } from "@/lib/ustar/constants";
import type { AdminLogDTO, ProfileDTO, VerificationRequestDTO } from "@/lib/ustar/types";
import { cn } from "@/lib/utils";

interface AdminData {
  logs: AdminLogDTO[];
  profiles: ProfileDTO[];
  verifications: VerificationRequestDTO[];
  revenue: { bids: number; verification: number; total: number };
}

/** Admin panel: bildirishnomalar + profil boshqaruvi + verifikatsiya */
export function AdminView() {
  const { setView } = useUstarStore();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const load = useCallback(
    (pw: string) => {
      setLoading(true);
      fetch(`/api/admin?password=${encodeURIComponent(pw)}`)
        .then((r) => {
          if (!r.ok) throw new Error("Parol noto'g'ri");
          return r.json();
        })
        .then((d: AdminData) => {
          setData(d);
          setAuthed(true);
          sessionStorage.setItem("topbid_admin_pw", pw);
        })
        .catch(() => {
          toast({
            title: "Kirish rad etildi",
            description: "Admin paroli noto'g'ri",
            variant: "destructive",
          });
        })
        .finally(() => setLoading(false));
    },
    [toast]
  );

  useEffect(() => {
    const saved = sessionStorage.getItem("topbid_admin_pw");
    if (saved) load(saved);
  }, [load]);

  const handleDelete = async (profile: ProfileDTO) => {
    if (
      !confirm(
        `"${profile.name}" profilini o'chirish?\nBarcha to'lovlar qaytariladi.`
      )
    )
      return;
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
      if (!res.ok) throw new Error(json.error || "Xatolik");
      toast({
        title: "Profil o'chirildi 🗑",
        description: "Barcha to'lovlar qaytarildi va guruhga xabar yuborildi",
      });
      load(sessionStorage.getItem("topbid_admin_pw") || password);
    } catch (e) {
      toast({
        title: "Xatolik",
        description: e instanceof Error ? e.message : "O'chirishda xatolik",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleVerifyDecision = async (req: VerificationRequestDTO, decision: "approve" | "reject") => {
    if (
      decision === "reject" &&
      !confirm(`"${req.profileName}" verifikatsiyasini rad etish?\nTo'lov qaytariladi: ${formatSom(req.fee)}`)
    )
      return;
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
      if (!res.ok) throw new Error(json.error || "Xatolik");
      toast({
        title: decision === "approve" ? "Verifikatsiya tasdiqlandi ✅" : "Verifikatsiya rad etildi",
        description:
          decision === "approve"
            ? `${req.profileName} profiliga ko'k belgi berildi`
            : `${formatSom(req.fee)} qaytarildi`,
      });
      load(sessionStorage.getItem("topbid_admin_pw") || password);
    } catch (e) {
      toast({
        title: "Xatolik",
        description: e instanceof Error ? e.message : "Qaror berishda xatolik",
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
        <div className="bg-white border border-border rounded-2xl p-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#241c14] flex items-center justify-center">
            <Lock className="w-6 h-6 text-[#e9a05c]" />
          </div>
          <h1 className="mt-4 font-extrabold text-lg text-[#241c14]">Admin panel</h1>
          <p className="text-xs text-[#94836f] font-medium mt-1">
            Faqat platforma administratori uchun
          </p>
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
              <Label htmlFor="admin-pw" className="text-[13px] font-bold text-[#574634] mb-1.5 block">
                Admin paroli
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
              {loading ? "Tekshirilmoqda..." : "Kirish"}
            </Button>
          </form>
          <Button
            variant="ghost"
            onClick={() => setView({ name: "home" })}
            className="mt-3 text-[#94836f] hover:bg-[#f6efe6] font-semibold text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Bosh sahifaga qaytish
          </Button>
          <p className="text-[10px] text-[#c4b5a1] font-medium mt-4">
            Demo parol: ustar2024 (.env orqali o'zgartiriladi)
          </p>
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
            className="rounded-lg hover:bg-[#f6efe6] text-[#574634]"
            aria-label="Bosh sahifa"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-[#241c14]">Admin panel</h1>
            <p className="text-xs text-[#94836f] font-medium mt-0.5">
              Profillar, verifikatsiya va bildirishnomalar
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => load(sessionStorage.getItem("topbid_admin_pw") || password)}
          className="border-[#e8ddd0] text-[#574634] hover:bg-[#fdeedd] font-bold rounded-lg shrink-0"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          <span className="hidden sm:inline">Yangilash</span>
        </Button>
      </div>

      {/* Umumiy statistika */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6">
        <MiniStat label="Profillar" value={`${data?.profiles.length ?? 0}`} />
        <MiniStat
          label="Daromad (umumi)"
          value={data ? formatCompactSom(data.revenue.total) : "—"}
          icon={<Wallet className="w-3 h-3" />}
        />
        <MiniStat label="Bidlar" value={data ? formatCompactSom(data.revenue.bids) : "—"} />
        <MiniStat
          label="Verifikatsiya"
          value={data ? formatCompactSom(data.revenue.verification) : "—"}
        />
      </div>

      {/* ===== VERIFIKATSIYA ===== */}
      <section className="mt-6" aria-label="Verifikatsiya so'rovlari">
        <h2 className="font-extrabold text-[#241c14] flex items-center gap-2 text-sm">
          <BadgeCheck className="w-4 h-4 text-[#1d7ed8]" />
          Verifikatsiya so'rovlari
          {pendingVerifications.length > 0 && (
            <span className="text-[10px] font-extrabold bg-[#1d7ed8] text-white px-2 py-0.5 rounded-full">
              {pendingVerifications.length} yangi
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
          <p className="mt-3 text-center text-xs text-[#94836f] font-medium bg-white border border-border rounded-xl py-5">
            Verifikatsiya so'rovlari yo'q
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {data!.verifications.map((v) => (
              <div
                key={v.id}
                className={cn(
                  "bg-white border rounded-xl p-3.5 flex items-center gap-3",
                  v.status === "pending" ? "border-[#cbe9f8] bg-[#f8fcff]" : "border-border"
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                    v.status === "pending"
                      ? "bg-[#e8f2fc]"
                      : v.status === "approved"
                        ? "bg-green-50"
                        : "bg-[#f6efe6]"
                  )}
                >
                  <BadgeCheck
                    className={cn(
                      "w-5 h-5",
                      v.status === "pending"
                        ? "text-[#1d7ed8]"
                        : v.status === "approved"
                          ? "text-green-600"
                          : "text-[#94836f]"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[13px] text-[#241c14] truncate">{v.profileName}</p>
                  <p className="text-[11px] text-[#94836f] font-medium truncate">
                    {v.profileContact} • {formatSom(v.fee)} • {timeAgo(v.createdAt)}
                  </p>
                  {v.status === "pending" && (
                    <p className="text-[10px] text-[#1d7ed8] font-bold mt-0.5">
                      Hujjatlar Telegram orqali so'naladi
                    </p>
                  )}
                </div>
                {v.status === "pending" ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleVerifyDecision(v, "approve")}
                      disabled={verifyingId === v.id}
                      className="h-8 bg-[#1d7ed8] hover:bg-[#1769b8] text-white font-extrabold text-xs rounded-lg px-2.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tasdiqlash
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerifyDecision(v, "reject")}
                      disabled={verifyingId === v.id}
                      className="h-8 border-red-200 text-red-600 hover:bg-red-50 font-extrabold text-xs rounded-lg px-2.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Rad etish
                    </Button>
                  </div>
                ) : (
                  <span
                    className={cn(
                      "text-[10px] font-extrabold px-2 py-1 rounded-full shrink-0",
                      v.status === "approved"
                        ? "bg-green-50 text-green-700"
                        : "bg-[#f6efe6] text-[#94836f]"
                    )}
                  >
                    {v.status === "approved" ? "Tasdiqlangan" : "Rad etilgan"}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== BILDIRISHNOMALAR ===== */}
      <section className="mt-6" aria-label="Admin bildirishnomalari">
        <h2 className="font-extrabold text-[#241c14] flex items-center gap-2 text-sm">
          <Bell className="w-4 h-4 text-[#d97b29]" />
          Bildirishnomalar
          <span className="text-[10px] font-bold text-[#229ed9] bg-[#e8f4fc] px-2 py-0.5 rounded-full uppercase tracking-wide">
            Telegram guruh
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
              <p className="text-center text-xs text-[#94836f] font-medium py-6">
                Hozircha bildirishnoma yo'q
              </p>
            ) : (
              data!.logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white rounded-xl rounded-tl-sm px-3.5 py-2.5 shadow-sm max-w-[92%]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#229ed9] uppercase tracking-wide">
                      <Send className="w-3 h-3" />
                      TopBid Bot
                    </span>
                    <span className="text-[10px] text-[#94836f] font-medium">
                      {timeAgo(log.createdAt)}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#241c14] font-medium leading-relaxed mt-1 whitespace-pre-line">
                    {log.message}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* ===== PROILLAR ===== */}
      <section className="mt-6" aria-label="Profillar boshqaruvi">
        <h2 className="font-extrabold text-[#241c14] flex items-center gap-2 text-sm">
          <ShieldAlert className="w-4 h-4 text-[#d97b29]" />
          Profil boshqaruvi ({data?.profiles.length ?? 0})
        </h2>

        <div className="mt-3 bg-white border border-border rounded-2xl divide-y divide-[#f0e6da] overflow-hidden">
          {data?.profiles.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3.5">
              <span className="text-xs font-extrabold text-[#c4b5a1] w-6 text-center shrink-0 tabular-nums">
                {p.position}
              </span>
              <ProfileAvatar name={p.name} imageUrl={p.imageUrl} size={36} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[13px] text-[#241c14] truncate">{p.name}</p>
                <p className="text-[11px] text-[#94836f] font-medium truncate">
                  {p.pool === "education" ? "O'rganish" : "Yollash"} • {p.categoryName} •{" "}
                  {formatSom(p.totalBid)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-full hidden sm:inline",
                    p.verifyStatus === "verified"
                      ? "bg-[#e8f2fc] text-[#1d7ed8]"
                      : p.verifyStatus === "pending"
                        ? "bg-[#fff4d6] text-[#a86a00]"
                        : "bg-[#f6efe6] text-[#94836f]"
                  )}
                >
                  {p.verifyStatus === "verified"
                    ? "Tekshirilgan"
                    : p.verifyStatus === "pending"
                      ? "Kutilmoqda"
                      : "Oddiy"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(p)}
                  disabled={deletingId === p.id}
                  className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600"
                  aria-label={`${p.name} profilini o'chirish`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {data?.profiles.length === 0 && (
            <p className="text-center text-xs text-[#94836f] font-medium py-8">Profillar yo'q</p>
          )}
        </div>

        <div className="mt-3 flex items-start gap-2 text-[11px] text-[#94836f] font-medium bg-[#fff9f2] border border-[#f0d5b8] rounded-xl px-3.5 py-3">
          <CheckCircle2 className="w-4 h-4 text-[#d97b29] shrink-0 mt-px" />
          Profil o'chirilganda to'lovlar «qaytarildi» deb belgilanadi, jami daromad avtomatik
          kamayadi va guruhga xabar yuboriladi.
        </div>
      </section>
    </div>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-white border border-border rounded-xl px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#94836f] leading-none flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="text-sm font-extrabold text-[#241c14] mt-1.5 truncate tabular-nums">{value}</p>
    </div>
  );
}
