import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRankedProfiles } from "@/lib/ustar/server";
import type { AdminLogDTO } from "@/lib/ustar/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin?password=... — admin panel ma'lumotlari: bildirishnomalar + profillar.
 */
export async function GET(req: NextRequest) {
  const password = req.nextUrl.searchParams.get("password") || "";
  const expected = process.env.ADMIN_PASSWORD || "ustar2024";
  if (password !== expected) {
    return NextResponse.json({ error: "Admin paroli noto'g'ri" }, { status: 401 });
  }
  const [logs, profiles] = await Promise.all([
    db.adminLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    getRankedProfiles(),
  ]);
  const logsDto: AdminLogDTO[] = logs.map((l) => ({
    id: l.id,
    type: l.type,
    message: l.message,
    profileId: l.profileId,
    createdAt: l.createdAt.toISOString(),
  }));
  return NextResponse.json({ logs: logsDto, profiles, revenue: undefined });
}
