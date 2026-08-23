import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { CategoryDTO } from "@/lib/ustar/types";

export const dynamic = "force-dynamic";

/** GET /api/categories — barcha kategoriyalar (pool bo'yicha) */
export async function GET() {
  const categories = await db.category.findMany({ orderBy: [{ pool: "asc" }, { name: "asc" }] });
  const dto: CategoryDTO[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    pool: c.pool as CategoryDTO["pool"],
  }));
  return NextResponse.json({ categories: dto });
}
