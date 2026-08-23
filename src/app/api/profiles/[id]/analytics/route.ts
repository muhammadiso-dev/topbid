import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface DailyRow {
  date: string;
  views: number;
  clicks: number;
}

/**
 * GET /api/profiles/[id]/analytics — chuqur analitika:
 * jami ko'rishlar, CTR, kunlik dinamika (14 kun), shaharlar, qurilmalar, referrerlar.
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const profile = await db.profile.findUnique({ where: { id }, select: { id: true } });
  if (!profile) {
    return NextResponse.json({ error: "Profil topilmadi" }, { status: 404 });
  }

  const since = new Date(Date.now() - 14 * 86_400_000);
  const events = await db.profileView.findMany({
    where: { profileId: id, createdAt: { gte: since } },
    select: { type: true, sessionId: true, city: true, country: true, device: true, referrer: true, createdAt: true },
  });

  // Kunlik dinamika (14 kun)
  const daily: DailyRow[] = [];
  const dayMap = new Map<string, DailyRow>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    const row = { date: key, views: 0, clicks: 0 };
    daily.push(row);
    dayMap.set(key, row);
  }

  const cityCount = new Map<string, number>();
  const deviceCount = new Map<string, number>();
  const refCount = new Map<string, number>();
  const sessions = new Set<string>();
  let views = 0;
  let clicks = 0;

  for (const e of events) {
    const key = e.createdAt.toISOString().slice(0, 10);
    const row = dayMap.get(key);
    if (e.type === "click") {
      clicks++;
      if (row) row.clicks++;
    } else {
      views++;
      if (row) row.views++;
    }
    sessions.add(e.sessionId);
    const city = e.city ? e.city : "Noma'lum";
    cityCount.set(city, (cityCount.get(city) || 0) + 1);
    deviceCount.set(e.device, (deviceCount.get(e.device) || 0) + 1);
    const ref = e.referrer || "direct";
    refCount.set(ref, (refCount.get(ref) || 0) + 1);
  }

  const dailyFmt = daily.map((d) => ({
    ...d,
    label: d.date.slice(8, 10) + "." + d.date.slice(5, 7),
  }));

  const byCount = (m: Map<string, number>) =>
    Array.from(m.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    totals: {
      views,
      clicks,
      unique: sessions.size,
      ctr: views > 0 ? Math.round((clicks / views) * 1000) / 10 : 0,
    },
    daily: dailyFmt,
    cities: byCount(cityCount).slice(0, 6),
    devices: byCount(deviceCount),
    referrers: byCount(refCount).slice(0, 5),
  });
}
