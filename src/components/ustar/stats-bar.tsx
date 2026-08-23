"use client";

import { useEffect, useState } from "react";
import { Users, Eye, Wallet, Heart } from "lucide-react";
import { formatCompactNumber, formatCompactSom } from "@/lib/ustar/constants";
import type { SiteStatsDTO } from "@/lib/ustar/types";
import { getSessionId } from "@/lib/ustar/store";
import { useI18n } from "@/lib/ustar/i18n";

/** Statistika paneli — ijtimoiy isbot */
export function StatsBar() {
  const [stats, setStats] = useState<SiteStatsDTO | null>(null);
  const { t, lang } = useI18n();

  useEffect(() => {
    let mounted = true;

    const sessionId = getSessionId();
    fetch("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, visit: true }),
    }).catch(() => null);

    const load = () => {
      fetch("/api/stats")
        .then((r) => r.json())
        .then((d: SiteStatsDTO) => {
          if (mounted) setStats(d);
        })
        .catch(() => null);
    };
    load();

    const hb = setInterval(() => {
      fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }).catch(() => null);
      load();
    }, 30_000);

    return () => {
      mounted = false;
      clearInterval(hb);
    };
  }, []);

  const items = [
    {
      icon: Users,
      label: t("stats.online"),
      value: stats ? `${formatCompactNumber(stats.online)} ${t("stats.people")}` : "—",
      pulse: true,
    },
    {
      icon: Eye,
      label: t("stats.visits"),
      value: stats ? formatCompactNumber(stats.visits) : "—",
    },
    {
      icon: Wallet,
      label: t("stats.revenue"),
      value: stats ? formatCompactSom(stats.revenue, lang) : "—",
    },
    {
      icon: Heart,
      label: t("stats.charity"),
      value: stats ? formatCompactSom(stats.charity, lang) : "—",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white border border-border rounded-xl px-3 py-2.5 md:px-4 md:py-3 flex items-center gap-2.5 md:gap-3"
        >
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-[#fdeedd] flex items-center justify-center shrink-0">
            <item.icon className="w-4 h-4 md:w-[18px] md:h-[18px] text-[#d97b29]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {item.pulse && stats && stats.online > 0 && (
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
              )}
              <p className="text-sm md:text-[15px] font-extrabold leading-none text-[#241c14] truncate tabular-nums">
                {item.value}
              </p>
            </div>
            <p className="text-[11px] md:text-xs text-[#6b5d4d] font-semibold mt-1 leading-none">
              {item.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
