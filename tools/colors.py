from pathlib import Path
from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
img = np.array(Image.open(ROOT / "ref" / "rectified.png").convert("RGB")).astype(int)

def median_color(region, mask, name):
    px = region[mask]
    if len(px) == 0:
        print(name, "no pixels")
        return
    med = np.median(px, axis=0).astype(int)
    print(name, "n=", len(px), "median", tuple(int(v) for v in med), "#%02x%02x%02x" % tuple(int(v) for v in med))

for x, y in [(500, 500), (850, 500), (500, 1000), (200, 1200)]:
    print("paper", (x, y), tuple(img[y, x]), "#%02x%02x%02x" % tuple(img[y, x]))

region = img[80:230, 240:760]
r, g, b = region[:, :, 0], region[:, :, 1], region[:, :, 2]
mask = (b > r + 8) & (b > g + 2) & (r < 180)
median_color(region, mask, "title blue")
mask2 = (r + g + b < 450) & (b > r)
median_color(region, mask2, "title dark")

region = img[260:610, 250:750]
r, g, b = region[:, :, 0], region[:, :, 1], region[:, :, 2]
mask = (r + g + b < 420)
median_color(region, mask, "body ink")

region = img[100:1200, 20:55]
r, g, b = region[:, :, 0], region[:, :, 1], region[:, :, 2]
mask = (r + g + b < 500)
median_color(region, mask, "border")

region = img[1040:1230, 740:920]
r, g, b = region[:, :, 0], region[:, :, 1], region[:, :, 2]
mask = (r > g + 25) & (r > b + 25) & (r > 100)
median_color(region, mask, "seal red")

print("fish bg", tuple(int(v) for v in img[700, 600]), "#%02x%02x%02x" % tuple(int(v) for v in img[700, 600]))
print("photo bg", tuple(int(v) for v in img[700, 150]), "#%02x%02x%02x" % tuple(int(v) for v in img[700, 150]))