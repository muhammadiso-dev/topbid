import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { heartbeat, getOnlineCount } from "@/lib/ustar/online";
import { computeRevenue } from "@/lib/ustar/server";
import type { SiteStatsDTO } from "@/lib/ustar/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const [stats, revenue, profilesCount] = await Promise.all([
    db.siteStats.findUnique({ where: { id: "main" } }),
    computeRevenue(),
    db.profile.count(),
  ]);
  const dto: SiteStatsDTO = {
    online: getOnlineCount(),
    visits: stats?.visits ?? 0,
    revenue: revenue.total,
    charity: revenue.charity, // bidlar 10% + verify 50%
    profilesCount,
  };
  return NextResponse.json(dto);
}

/**
 * POST — heartbeat va tashriflarni hisoblash.
 * Body: { sessionId: string, visit?: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionId = String(body?.sessionId || "");
    const visit = Boolean(body?.visit);
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId talab qilinadi" }, { status: 400 });
    }
    heartbeat(sessionId);
    if (visit) {
      await db.siteStats.upsert({
        where: { id: "main" },
        update: { visits: { increment: 1 } },
        create: { id: "main", visits: 1 },
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }
}
