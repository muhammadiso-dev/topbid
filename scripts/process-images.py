"""TopBid logo va verify badge fayllarini qayta ishlash:
- tight-crop (shaffof padding olib tashlash)
- favicon o'lchamlari (32, 180, 512)
- navbar logo va kichik badge versiyalari
"""
from PIL import Image
import os

SRC = "/home/z/my-project/upload"
OUT = "/home/z/my-project/public"

def tight_crop(img: Image.Image, pad: int = 0) -> Image.Image:
    """Shaffof bo'lmagan piksellarning bounding box ini topib kesish."""
    alpha = img.split()[-1]
    bbox = alpha.getbbox()
    if bbox:
        img = img.crop(bbox)
    if pad > 0:
        w, h = img.size
        new = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
        new.paste(img, (pad, pad))
        img = new
    return img

def save_sizes(img: Image.Image, base_name: str, sizes: list[int], square: bool = False):
    """Har xil o'lchamlarda saqlash (kvadrat canvas'ga joylashtirib)."""
    for size in sizes:
        if square:
            canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
            ratio = min(size, size) / max(img.size)
            w = int(img.width * ratio * 0.98)
            h = int(img.height * ratio * 0.98)
            resized = img.resize((w, h), Image.LANCZOS)
            canvas.paste(resized, ((size - w) // 2, (size - h) // 2), resized)
            canvas.save(f"{OUT}/{base_name}-{size}.png", optimize=True)
        else:
            img.resize((size, size), Image.LANCZOS).save(f"{OUT}/{base_name}-{size}.png", optimize=True)

# ===== 1. LOGO SYMBOL =====
logo = Image.open(f"{SRC}/logo-symbol.png").convert("RGBA")
logo_cropped = tight_crop(logo)
print(f"Logo: {logo.size} -> crop: {logo_cropped.size}")

# Faviconlar (kvadrat canvas, biroz padding bilan)
save_sizes(logo_cropped, "favicon", [32, 180, 512], square=True)
# Navbar uchun tight versiya
save_sizes(logo_cropped, "logo", [96, 192], square=False)
print("Logo saqlandi: favicon-32/180/512, logo-96/192")

# ===== 2. VERIFY BADGE =====
badge = Image.open(f"{SRC}/verify-badge.png").convert("RGBA")
badge_cropped = tight_crop(badge)
print(f"Badge: {badge.size} -> crop: {badge_cropped.size}")
save_sizes(badge_cropped, "verify-badge", [48, 96, 192], square=True)
print("Verify badge saqlandi: verify-badge-48/96/192")

# ===== 3. .ico favicon =====
ico_sizes = [(16, 16), (32, 32), (48, 48)]
canvas32 = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
ratio = 32 / max(logo_cropped.size)
w, h = int(logo_cropped.width * ratio), int(logo_cropped.height * ratio)
small = logo_cropped.resize((w, h), Image.LANCZOS)
canvas32.paste(small, ((32 - w) // 2, (32 - h) // 2), small)
canvas32.save(f"{OUT}/favicon.ico", sizes=ico_sizes)
print("favicon.ico saqlandi")

# Hajmlarni ko'rsatish
for f in sorted(os.listdir(OUT)):
    if f.endswith((".png", ".ico")):
        size_kb = os.path.getsize(f"{OUT}/{f}") / 1024
        if size_kb > 0.5:
            print(f"  {f}: {size_kb:.1f} KB")
