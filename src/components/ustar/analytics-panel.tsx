"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Eye, MousePointerClick, Users, Target, TrendingUp, MapPin, Smartphone, Globe } from "lucide-react";
import { useI18n } from "@/lib/ustar/i18n";
import { formatCompactNumber } from "@/lib/ustar/constants";
import type { AnalyticsDTO } from "@/lib/ustar/types";

const ORANGE = "#d97b29";
const LIGHT_ORANGE = "#f0c9a5";
const PALETTE = ["#d97b29", "#e9a05c", "#f3c9a5", "#c4b5a1", "#8a7361", "#e5d5c2"];

/** Chuqur analitika paneli — kunlik dinamika, shaharlar, qurilmalar, referrerlar */
export function AnalyticsPanel({ profileId }: { profileId: string }) {
  const { t, lang } = useI18n();
  const [data, setData] = useState<AnalyticsDTO | null>(null);

  useEffect(() => {
    fetch(`/api/profiles/${profileId}/analytics`)
      .then((r) => r.json())
      .then((d: AnalyticsDTO) => setData(d))
      .catch(() => null);
  }, [profileId]);

  if (!data) {
    return (
      <div className="bg-white border border-border rounded-2xl p-5 md:p-6">
        <h2 className="font-extrabold text-lg text-[#241c14] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#d97b29]" />
          {t("analytics.title")}
        </h2>
        <p className="text-sm text-[#94836f] font-medium mt-4">{t("analytics.empty")}</p>
      </div>
    );
  }

  const deviceLabel = (d: string) =>
    d === "mobile" ? t("analytics.device.mobile") : d === "tablet" ? t("analytics.device.tablet") : t("analytics.device.desktop");
  const refLabel = (r: string) => (r === "direct" ? t("analytics.referrer.direct") : r);
  const maxDaily = Math.max(...data.daily.map((d) => d.views), 1);

  return (
    <div className="bg-white border border-border rounded-2xl p-5 md:p-6 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-extrabold text-lg text-[#241c14] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#d97b29]" />
          {t("analytics.title")}
        </h2>
        <span className="text-[11px] font-bold text-[#94836f] bg-[#f6efe6] px-2.5 py-1 rounded-full">
          {t("analytics.last14")}
        </span>
      </div>

      {/* Umumiy ko'rsatkichlar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard icon={<Eye className="w-4 h-4" />} label={t("analytics.views")} value={formatCompactNumber(data.totals.views)} />
        <StatCard icon={<MousePointerClick className="w-4 h-4" />} label={t("analytics.clicks")} value={formatCompactNumber(data.totals.clicks)} />
        <StatCard icon={<Users className="w-4 h-4" />} label={t("analytics.unique")} value={formatCompactNumber(data.totals.unique)} />
        <StatCard icon={<Target className="w-4 h-4" />} label={t("analytics.ctr")} value={`${data.totals.ctr}%`} accent />
      </div>

      {/* Kunlik dinamika */}
      <div>
        <h3 className="text-[13px] font-extrabold text-[#574634] mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-[#d97b29]" />
          {t("analytics.daily")}
        </h3>
        <div className="h-44 md:h-52 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.daily} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ORANGE} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={ORANGE} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#94836f", fontWeight: 600 }}
                tickFormatter={(v: string, i: number) => (i % 2 === 0 ? v : "")}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis
                width={30}
                domain={[0, maxDaily]}
                tick={{ fontSize: 10, fill: "#c4b5a1" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : `${v}`)}
              />
              <Tooltip
                contentStyle={{
                  background: "#241c14",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                }}
                labelStyle={{ color: "#e9a05c" }}
                formatter={(value: number | string, name: string) => [
                  value,
                  name === "views" ? t("analytics.views") : t("analytics.clicks"),
                ]}
              />
              <Area type="monotone" dataKey="views" stroke={ORANGE} strokeWidth={2.5} fill="url(#viewsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Shaharlar */}
        <div>
          <h3 className="text-[13px] font-extrabold text-[#574634] mb-3 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#d97b29]" />
            {t("analytics.cities")}
          </h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.cities} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={82}
                  tick={{ fontSize: 11, fill: "#574634", fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#241c14",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                  cursor={{ fill: "rgba(217,123,41,0.08)" }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
                  {data.cities.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Qurilmalar + referrerlar */}
        <div className="space-y-5">
          <div>
            <h3 className="text-[13px] font-extrabold text-[#574634] mb-2 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-[#d97b29]" />
              {t("analytics.devices")}
            </h3>
            <div className="flex items-center gap-3">
              <div className="h-24 w-24 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.devices} dataKey="count" nameKey="name" innerRadius={26} outerRadius={44} paddingAngle={2} strokeWidth={0}>
                      {data.devices.map((_, i) => (
                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1.5 min-w-0">
                {data.devices.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between gap-2 text-[12px]">
                    <span className="flex items-center gap-1.5 font-bold text-[#574634] min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
                      <span className="truncate">{deviceLabel(d.name)}</span>
                    </span>
                    <span className="font-extrabold text-[#241c14] tabular-nums">
                      {Math.round((d.count / Math.max(data.totals.views + data.totals.clicks, 1)) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Referrerlar */}
          <div>
            <h3 className="text-[13px] font-extrabold text-[#574634] mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#d97b29]" />
              {t("analytics.referrers")}
            </h3>
            <div className="space-y-1.5">
              {data.referrers.map((r) => {
                const maxRef = data.referrers[0]?.count || 1;
                return (
                  <div key={r.name} className="flex items-center gap-2 text-[12px]">
                    <span className="w-20 truncate font-bold text-[#574634] shrink-0">{refLabel(r.name)}</span>
                    <div className="flex-1 h-2 bg-[#f6efe6] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#d97b29] to-[#e9a05c]"
                        style={{ width: `${Math.round((r.count / maxRef) * 100)}%` }}
                      />
                    </div>
                    <span className="font-extrabold text-[#241c14] tabular-nums w-8 text-right">{r.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <span className="hidden">{lang}</span>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        "rounded-xl px-3 py-2.5 border " +
        (accent ? "bg-[#fff9f2] border-[#f0d5b8]" : "bg-[#fffdfa] border-[#f0e6da]")
      }
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#94836f] leading-none flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p
        className={
          "text-lg font-extrabold mt-1.5 tabular-nums " + (accent ? "text-[#b25e14]" : "text-[#241c14]")
        }
      >
        {value}
      </p>
    </div>
  );
}
