import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CATEGORY_GROUP_ORDER } from "@/lib/ustar/constants";
import type { CategoryDTO } from "@/lib/ustar/types";

export const dynamic = "force-dynamic";

/** GET /api/categories — barcha kategoriyalar (ASOSIY guruhlar birinchi, bolalar eng pastda) */
export async function GET() {
  const categories = await db.category.findMany();
  // Guruh tartibi: CATEGORY_GROUP_ORDER bo'yicha, noma'lum guruhlar oxirida
  const orderMap = new Map(CATEGORY_GROUP_ORDER.map((g, i) => [g, i]));
  categories.sort((a, b) => {
    const ga = orderMap.get(a.groupName) ?? 99;
    const gb = orderMap.get(b.groupName) ?? 99;
    if (ga !== gb) return ga - gb;
    return a.name.localeCompare(b.name);
  });
  const dto: CategoryDTO[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    pool: c.pool as CategoryDTO["pool"],
    group: c.groupName,
  }));
  return NextResponse.json({ categories: dto });
}
