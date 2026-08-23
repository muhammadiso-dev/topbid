import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = "/home/z/my-project/uploads";
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * POST /api/upload — logo/rasm yuklash (multipart/form-data, maydon "file").
 * Natija: { url: "/api/media/<nom>" }
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 });
    }
    const ext = ALLOWED[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Faqat PNG, JPG, WEBP yoki GIF ruxsat etiladi" },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Fayl hajmi 2MB dan oshmasin" }, { status: 400 });
    }

    const name = `${crypto.randomUUID()}.${ext}`;
    await mkdir(UPLOAD_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, name), buffer);

    return NextResponse.json({ ok: true, url: `/api/media/${name}` });
  } catch (e) {
    console.error("Fayl yuklashda xato:", e);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
