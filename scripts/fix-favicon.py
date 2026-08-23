"""Favicon'ni qayta ishlash — logo CRUQ MARKAZDA bo'lishi kerak.
Muammo: bbox crop asimmetrik bo'lgani uchun logo tepaga surilgan.
Yechim: bbox markazini canvas markaziga qo'yish + kichik margin.
"""
from PIL import Image
import os

SRC = "/home/z/my-project/upload/logo-symbol.png"
OUT = "/home/z/my-project/public"

logo = Image.open(SRC).convert("RGBA")
alpha = logo.split()[-1]
bbox = alpha.getbbox()
cropped = logo.crop(bbox)
w, h = cropped.size
print(f"Crop: {w}x{h}, bbox: {bbox}")

# Asimmetriya tekshiruvi: bbox markazi rasm markazidan qancha surilgan
cx_src, cy_src = logo.width / 2, logo.height / 2
cx_bbox = bbox[0] + w / 2
cy_bbox = bbox[1] + h / 2
print(f"Rasm markazi: ({cx_src:.0f},{cy_src:.0f}), bbox markazi: ({cx_bbox:.0f},{cy_bbox:.0f})")
print(f"Siljish: x={cx_bbox-cx_src:.0f}, y={cy_bbox-cy_src:.0f}")

def make_centered(size: int, margin_ratio: float = 0.06):
    """Logo bbox MARKAZINI canvas markaziga joylash"""
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    avail = int(size * (1 - margin_ratio * 2))
    ratio = min(avail / w, avail / h)
    nw, nh = int(w * ratio), int(h * ratio)
    resized = cropped.resize((nw, nh), Image.LANCZOS)
    x = (size - nw) // 2
    y = (size - nh) // 2
    canvas.paste(resized, (x, y), resized)
    return canvas

# Faviconlar — markazlangan
make_centered(32).save(f"{OUT}/favicon-32.png", optimize=True)
make_centered(180).save(f"{OUT}/favicon-180.png", optimize=True)
make_centered(512).save(f"{OUT}/favicon-512.png", optimize=True)
make_centered(96).save(f"{OUT}/logo-96.png", optimize=True)
make_centered(192).save(f"{OUT}/logo-192.png", optimize=True)

# ICO (16/32/48)
canvas32 = make_centered(32)
canvas32.save(f"{OUT}/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

# Verify badge ham markazlab qo'yamiz
badge = Image.open("/home/z/my-project/upload/verify-badge.png").convert("RGBA")
ab = badge.split()[-1].getbbox()
bc = badge.crop(ab)
bw, bh = bc.size
for size in [48, 96, 192]:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ratio = (size * 0.94) / max(bw, bh)
    nw, nh = int(bw * ratio), int(bh * ratio)
    r = bc.resize((nw, nh), Image.LANCZOS)
    canvas.paste(r, ((size - nw) // 2, (size - nh) // 2), r)
    canvas.save(f"{OUT}/verify-badge-{size}.png", optimize=True)

# Markazlashni tekshirish: 32px favicon'da massa markazi
test = make_centered(200)
a = test.split()[-1]
b = a.getbbox()
tw, th = b[2] - b[0], b[3] - b[1]
print(f"\n200px test: bbox {b} — o'ng/chap bo'shliq: {b[0]}px / {200-b[2]}px, tepa/past: {b[1]}px / {200-b[3]}px")

for f in ["favicon-32.png", "favicon-180.png", "favicon.ico", "logo-96.png"]:
    p = f"{OUT}/{f}"
    print(f"  {f}: {os.path.getsize(p)/1024:.1f} KB")
print("Faviconlar markazlangan holda saqlandi")
