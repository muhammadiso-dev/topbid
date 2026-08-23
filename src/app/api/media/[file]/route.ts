import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = "/home/z/my-project/uploads";
const NAME_RE = /^[a-f0-9-]{36}\.(png|jpg|jpeg|webp|gif|svg)$/;
const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

/** GET /api/media/[file] — yuklangan logotiplarni xavfsiz serve qilish */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  if (!NAME_RE.test(file)) {
    return NextResponse.json({ error: "Noto'g'ri fayl nomi" }, { status: 400 });
  }
  try {
    const buffer = await readFile(path.join(UPLOAD_DIR, file));
    const ext = file.split(".").pop()!.toLowerCase();
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fayl topilmadi" }, { status: 404 });
  }
}
