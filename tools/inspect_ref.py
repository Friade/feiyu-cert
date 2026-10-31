from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
REF = ROOT / "ref" / "reference.webp"
OUT = ROOT / "ref"

img = Image.open(REF).convert("RGB")
W, H = img.size
print("size:", W, H)

# 3x upscale with a coordinate grid for picking points
scale = 3
big = img.resize((W * scale, H * scale), Image.Resampling.LANCZOS)
d = ImageDraw.Draw(big)
try:
    font = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 18)
except Exception:
    font = ImageFont.load_default()

for x in range(0, W, 20):
    xx = x * scale
    color = (255, 0, 0) if x % 100 == 0 else (0, 160, 255)
    d.line([(xx, 0), (xx, H * scale)], fill=color, width=1)
    if x % 40 == 0:
        d.text((xx + 2, 2), str(x), fill=(180, 0, 0), font=font)
for y in range(0, H, 20):
    yy = y * scale
    color = (255, 0, 0) if y % 100 == 0 else (0, 160, 255)
    d.line([(0, yy), (W * scale, yy)], fill=color, width=1)
    if y % 40 == 0:
        d.text((2, yy + 1), str(y), fill=(180, 0, 0), font=font)

big.save(OUT / "grid.png")

# crops of key areas, 4x
crops = {
    "title": (120, 80, 320, 130),
    "body": (110, 130, 340, 270),
    "photos": (60, 260, 260, 370),
    "seal": (290, 340, 390, 430),
    "bottom": (55, 415, 380, 465),
}
for name, box in crops.items():
    c = img.crop(box)
    c = c.resize((c.width * 4, c.height * 4), Image.Resampling.LANCZOS)
    c.save(OUT / f"crop_{name}.png")

# perspective rectification (approximate corners; hands occlude the bottom)
quad = (58, 78, 76, 442, 372, 452, 392, 95)  # UL, LL, LR, UR
rect = img.transform((1000, 1400), Image.Transform.QUAD, quad, resample=Image.Resampling.BICUBIC)
rect.save(OUT / "rectified.png")

# color samples
samples = {
    "paper_center": (200, 220),
    "paper_top": (230, 130),
    "border_left": (62, 220),
    "title_blue": (200, 108),
    "body_dark": (200, 172),
    "seal_red": (340, 390),
    "photo_bg": (120, 300),
    "fish_bg": (300, 300),
}
for name, (x, y) in samples.items():
    print(name, img.getpixel((x, y)), "#%02x%02x%02x" % img.getpixel((x, y)))