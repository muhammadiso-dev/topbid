"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Loader2, Copy, CheckCircle2, Send, Globe } from "lucide-react";
import { useI18n } from "@/lib/ustar/i18n";
import { saveEditToken } from "@/lib/ustar/store";
import type { ProfileDTO } from "@/lib/ustar/types";

interface ClaimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ProfileDTO;
  onClaimed: (token: string) => void;
}

interface ClaimResponse {
  ok: boolean;
  code?: string;
  method?: "telegram" | "site";
  instructions?: string;
  editToken?: string;
  error?: string;
}

/** Egalik da'vo modali: kanalga kod yozish / saytga meta teg orqali tasdiq */
export function ClaimModal({ open, onOpenChange, profile, onClaimed }: ClaimModalProps) {
  const { t } = useI18n();
  const { toast } = useToast();

  const [phase, setPhase] = useState<"intro" | "code" | "checking" | "done">("intro");
  const [code, setCode] = useState("");
  const [method, setMethod] = useState<"telegram" | "site">("telegram");
  const [copied, setCopied] = useState(false);

  const start = async () => {
    try {
      const res = await fetch(`/api/profiles/${profile.id}/claim`, { method: "POST" });
      const data: ClaimResponse = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Xatolik");
      setCode(data.code || "");
      setMethod(data.method || "telegram");
      setPhase("code");
    } catch (e) {
      toast({
        title: t("err.generic"),
        description: e instanceof Error ? e.message : t("err.server"),
        variant: "destructive",
      });
    }
  };

  const check = async () => {
    setPhase("checking");
    try {
      const res = await fetch(`/api/profiles/${profile.id}/claim`, { method: "PUT" });
      const data: ClaimResponse = await res.json();
      if (data.ok && data.editToken) {
        saveEditToken(profile.id, data.editToken);
        setPhase("done");
        toast({ title: `🎉 ${t("claim.success")}`, description: t("claim.successDesc") });
        setTimeout(() => {
          onOpenChange(false);
          onClaimed(data.editToken!);
        }, 1200);
      } else {
        setPhase("code");
        toast({
          title: t("claim.notFound"),
          variant: "destructive",
        });
      }
    } catch {
      setPhase("code");
      toast({ title: t("err.generic"), description: t("err.server"), variant: "destructive" });
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setTimeout(() => setPhase("intro"), 200);
      }}
    >
      <DialogContent className="bg-white border-[#e8ddd0] rounded-2xl max-w-md p-0 overflow-hidden gap-0 block">
        <DialogHeader className="p-5 pb-4 border-b border-[#f0e6da]">
          <DialogTitle className="text-lg font-extrabold text-[#241c14] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1d7ed8]" />
            {t("claim.title")}
          </DialogTitle>
          <DialogDescription className="text-[#6b5d4d] text-sm">{t("claim.desc")}</DialogDescription>
        </DialogHeader>

        {phase === "intro" && (
          <div className="p-5 space-y-4">
            <div className="bg-[#f0f9ff] border border-[#cbe9f8] rounded-xl p-4 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <Send className="w-4 h-4 text-[#229ed9] shrink-0 mt-0.5" />
                <p className="text-[13px] text-[#1a6da8] font-semibold leading-snug">
                  Telegram: {t("claim.telegramHint")} <b>{profile.contactUrl}</b>
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-[#229ed9] shrink-0 mt-0.5" />
                <p className="text-[13px] text-[#1a6da8] font-semibold leading-snug">{t("claim.siteHint")}</p>
              </div>
            </div>
            <Button
              onClick={start}
              className="w-full h-12 bg-[#1d7ed8] hover:bg-[#1769b8] text-white font-extrabold rounded-xl text-sm"
            >
              {t("claim.codeLabel")} →
            </Button>
          </div>
        )}

        {phase === "code" && (
          <div className="p-5 space-y-4">
            <p className="text-[13px] text-[#6b5d4d] font-medium leading-relaxed whitespace-pre-line">
              {method === "telegram"
                ? `${t("claim.telegramHint")} ${profile.contactUrl.replace("@", "")}:`
                : t("claim.siteHint")}
            </p>
            <div className="bg-[#241c14] rounded-xl p-4 flex items-center justify-between gap-3">
              <code className="text-2xl font-extrabold text-[#e9a05c] tracking-widest">{code}</code>
              <button
                onClick={copyCode}
                className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors shrink-0"
                aria-label={t("editlink.copy")}
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-[#94836f] font-medium">
              {method === "telegram"
                ? `${t("claim.telegramHint")} @${profile.contactUrl.replace("@", "")}`
                : `<meta name="topbid" content="${code}">`}
            </p>
            <Button
              onClick={check}
              className="w-full h-12 bg-[#d97b29] hover:bg-[#c2691f] text-white font-extrabold rounded-xl text-sm"
            >
              {t("claim.check")}
            </Button>
          </div>
        )}

        {phase === "checking" && (
          <div className="p-12 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#1d7ed8] animate-spin" />
            <p className="font-bold text-[#241c14] text-sm">{t("claim.checking")}</p>
          </div>
        )}

        {phase === "done" && (
          <div className="p-8 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-lg font-extrabold text-[#241c14]">{t("claim.success")}</h3>
            <p className="text-sm text-[#6b5d4d]">{t("claim.successDesc")}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
