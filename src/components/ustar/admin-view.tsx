"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Lock, Send, Trash2, RefreshCw, Bell, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ProfileAvatar } from "./profile-avatar";
import { useUstarStore } from "@/lib/ustar/store";
import { formatSom, timeAgo } from "@/lib/ustar/constants";
import type { AdminLogDTO, ProfileDTO } from "@/lib/ustar/types";
import { cn } from "@/lib/utils";

/** Admin panel: bildirishnomalar (Telegram guruh simulyatsiyasi) + profil boshqaruvi */
export function AdminView() {
  const { setView } = useUstarStore();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [logs, setLogs] = useState<AdminLogDTO[]>([]);
  const [profiles, setProfiles] = useState<ProfileDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback((pw: string) => {
    setLoading(true);
    fetch(`/api/admin?password=${encodeURIComponent(pw)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Parol noto'g'ri");
        return r.json();
      })
      .then((d: { logs: AdminLogDTO[]; profiles: ProfileDTO[] }) => {
        setLogs(d.logs);
        setProfiles(d.profiles);
        setAuthed(true);
        sessionStorage.setItem("ustar_admin_pw", pw);
      })
      .catch(() => {
        toast({ title: "Kirish rad etildi", description: "Admin paroli noto'g'ri", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  // Avvalgi sessiyadan parolni tekshirish
  useEffect(() => {
    const saved = sessionStorage.getItem("ustar_admin_pw");
    if (saved) load(saved);
  }, [load]);

  const handleDelete = async (profile: ProfileDTO) => {
    if (!confirm(`"${profile.name}" profilini o'chirish?\nTo'lovlar qaytariladi: ${formatSom(profile.totalBid)}`)) return;
    setDeletingId(profile.id);
    try {
      const res = await fetch(`/api/profiles/${profile.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword: sessionStorage.getItem("ustar_admin_pw") || password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xatolik");
      toast({
        title: "Profil o'chirildi 🗑",
        description: `${formatSom(data.refunded)} qaytarildi va admin guruhga xabar yuborildi`,
      });
      load(sessionStorage.getItem("ustar_admin_pw") || password);
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

  // ===== Login ekrani =====
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
              className="w-full h-11 bg-[#241c14] hover:bg-[#3a2e22] text-white font-bold rounded-lg"
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

  // ===== Panel =====
  const revenue = profiles.reduce((a, p) => a + p.totalBid, 0);
  const newLogs = logs.filter((l) => l.type === "new_profile").length;

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16">
      <div className="pt-6 md:pt-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
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
              Profillar, to'lovlar va bildirishnomalar
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => load(sessionStorage.getItem("ustar_admin_pw") || password)}
          className="border-[#e8ddd0] text-[#574634] hover:bg-[#fdeedd] font-bold rounded-lg"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          Yangilash
        </Button>
      </div>

      {/* Umumiy */}
      <div className="grid grid-cols-3 gap-2 mt-6">
        <MiniStat label="Profillar" value={`${profiles.length}`} />
        <MiniStat label="Daromad" value={formatSom(revenue)} />
        <MiniStat label="Yangi profil" value={`${newLogs}`} />
      </div>

      {/* Telegram guruh simulyatsiyasi */}
      <section className="mt-6" aria-label="Admin bildirishnomalari">
        <h2 className="font-extrabold text-[#241c14] flex items-center gap-2 text-sm">
          <Bell className="w-4 h-4 text-[#d97b29]" />
          Bildirishnomalar
          <span className="text-[10px] font-bold text-[#229ed9] bg-[#e8f4fc] px-2 py-0.5 rounded-full uppercase tracking-wide">
            Telegram guruh
          </span>
        </h2>

        {loading && logs.length === 0 ? (
          <div className="mt-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl bg-[#f0e6da]" />
            ))}
          </div>
        ) : (
          <div className="mt-3 bg-[#eef4f9] rounded-2xl p-3 space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
            {logs.length === 0 ? (
              <p className="text-center text-xs text-[#94836f] font-medium py-6">
                Hozircha bildirishnoma yo'q
              </p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white rounded-xl rounded-tl-sm px-3.5 py-2.5 shadow-sm max-w-[92%]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#229ed9] uppercase tracking-wide">
                      <Send className="w-3 h-3" />
                      Ustar Bot
                    </span>
                    <span className="text-[10px] text-[#94836f] font-medium">{timeAgo(log.createdAt)}</span>
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

      {/* Profillar jadvali */}
      <section className="mt-6" aria-label="Profillar boshqaruvi">
        <h2 className="font-extrabold text-[#241c14] flex items-center gap-2 text-sm">
          <ShieldAlert className="w-4 h-4 text-[#d97b29]" />
          Profil boshqaruvi ({profiles.length})
        </h2>

        <div className="mt-3 bg-white border border-border rounded-2xl divide-y divide-[#f0e6da] overflow-hidden">
          {profiles.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3.5">
              <span className="text-xs font-extrabold text-[#c4b5a1] w-6 text-center shrink-0 tabular-nums">
                {p.position}
              </span>
              <ProfileAvatar name={p.name} imageUrl={p.imageUrl} size={36} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[13px] text-[#241c14] truncate">{p.name}</p>
                <p className="text-[11px] text-[#94836f] font-medium truncate">
                  {p.pool === "education" ? "Ta'lim" : "IT"} • {p.categoryName} • {formatSom(p.totalBid)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-full",
                    p.verified ? "bg-[#e8f2fc] text-[#1d7ed8]" : "bg-[#f6efe6] text-[#94836f]"
                  )}
                >
                  {p.verified ? "Tekshirilgan" : "Oddiy"}
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
          {profiles.length === 0 && (
            <p className="text-center text-xs text-[#94836f] font-medium py-8">
              Profillar yo'q
            </p>
          )}
        </div>

        <div className="mt-3 flex items-start gap-2 text-[11px] text-[#94836f] font-medium bg-[#fff9f2] border border-[#f0d5b8] rounded-xl px-3.5 py-3">
          <CheckCircle2 className="w-4 h-4 text-[#d97b29] shrink-0 mt-px" />
          Profil o'chirilganda to'lovlar «qaytarildi» deb belgilanadi, jami daromad avtomatik kamayadi va guruhga xabar yuboriladi.
        </div>
      </section>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-border rounded-xl px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#94836f] leading-none">{label}</p>
      <p className="text-sm font-extrabold text-[#241c14] mt-1.5 truncate tabular-nums">{value}</p>
    </div>
  );
}
