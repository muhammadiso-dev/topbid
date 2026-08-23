import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const password = req.nextUrl.searchParams.get("password") || "";
  const expected = process.env.ADMIN_PASSWORD || "TOPBID!2026";

  if (password !== expected) {
    return NextResponse.json({ error: "Admin paroli noto'g'ri" }, { status: 401 });
  }

  try {
    const educationCategories = [
      { name: "Ingliz tili (IELTS, CEFR)", pool: "education", groupName: "Chet tillari" },
      { name: "Rus tili", pool: "education", groupName: "Chet tillari" },
      { name: "Koreys tili", pool: "education", groupName: "Chet tillari" },
      { name: "Matematika", pool: "education", groupName: "Maktab fanlari" },
      { name: "Tarix", pool: "education", groupName: "Maktab fanlari" },
      { name: "Ona tili va adabiyot", pool: "education", groupName: "Maktab fanlari" },
      { name: "Fizika", pool: "education", groupName: "Maktab fanlari" },
    ];

    const itCategories = [
      { name: "Frontend (React, Vue, h.k.)", pool: "it", groupName: "Dasturlash" },
      { name: "Backend (Node.js, Python, Java)", pool: "it", groupName: "Dasturlash" },
      { name: "Mobile (Flutter, iOS, Android)", pool: "it", groupName: "Dasturlash" },
      { name: "UI/UX Dizayn", pool: "it", groupName: "Dizayn" },
      { name: "Grafik dizayn (Photoshop, Corel)", pool: "it", groupName: "Dizayn" },
      { name: "SMM va Marketing", pool: "it", groupName: "Marketing" },
      { name: "SEO va Kopirayting", pool: "it", groupName: "Marketing" },
    ];

    const allCats = [...educationCategories, ...itCategories];

    for (const cat of allCats) {
      await db.category.upsert({
        where: { name: cat.name },
        update: {},
        create: cat,
      });
    }

    return NextResponse.json({ success: true, message: "Kategoriyalar muvaffaqiyatli qo'shildi!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
