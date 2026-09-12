"""Crop, isolate, enhance, and studio-frame Numac product photos."""
from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source-photos"
OUT = ROOT / "assets" / "products"
CANVAS = 1200
BG = (255, 252, 247)


def enhance_rgb(im: Image.Image) -> Image.Image:
    im = ImageOps.exif_transpose(im).convert("RGB")
    im = ImageOps.autocontrast(im, cutoff=0.8)
    im = ImageEnhance.Brightness(im).enhance(1.05)
    im = ImageEnhance.Contrast(im).enhance(1.12)
    im = ImageEnhance.Color(im).enhance(1.14)
    im = ImageEnhance.Sharpness(im).enhance(1.5)
    return im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=95, threshold=3))


def crop_frac(im: Image.Image, box: tuple[float, float, float, float]) -> Image.Image:
    w, h = im.size
    l, t, r, b = box
    return im.crop((int(w * l), int(h * t), int(w * r), int(h * b)))


def trim_alpha(im: Image.Image, pad: int = 8) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(im.width, r + pad)
    b = min(im.height, b + pad)
    return im.crop((l, t, r, b))


def studio(cut: Image.Image, pad: float = 0.1) -> Image.Image:
    max_inner = int(CANVAS * (1 - 2 * pad))
    cut = cut.copy()
    cut.thumbnail((max_inner, max_inner), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (CANVAS, CANVAS), BG)
    x = (CANVAS - cut.width) // 2
    y = (CANVAS - cut.height) // 2
    canvas.paste(cut, (x, y), cut if cut.mode == "RGBA" else None)
    return canvas


def save(im: Image.Image, name: str) -> None:
    path = OUT / f"{name}.jpg"
    im.save(path, "JPEG", quality=88, optimize=True, progressive=True, subsampling=1)
    print("wrote", path.relative_to(ROOT))


def src(name: str) -> Path:
    return SOURCE / name


# filename, slug, crop, isolate_background
JOBS: list[tuple[str, str, tuple[float, float, float, float], bool]] = [
    ("11.jpeg", "nhc-pmt", (0.08, 0.04, 0.92, 0.98), True),
    ("11111.jpeg", "piranum-nh", (0.02, 0.06, 0.98, 0.96), True),
    ("WhatsApp Image 2026-08-20 .jpeg", "panzonum-dsr", (0.06, 0.04, 0.88, 0.96), True),
    ("WhatsApp Image 2026-08-20 at 15.47.09.jpeg", "abinj", (0.04, 0.52, 0.96, 0.99), False),
    ("WhatsApp Image 2026-08-20 at 15.47.11.jpeg", "mbspas", (0.02, 0.08, 0.98, 0.96), True),
    ("WhatsApp Image 2026-08-20 at 15.47.12.jpeg", "meconum-injection", (0.02, 0.52, 0.52, 0.98), False),
    ("WhatsApp Image 2026-08-20 at 15.47.12n.jpeg", "numal-150", (0.00, 0.08, 0.36, 0.95), True),
    ("WhatsApp Image 2026-08-20 at 15.47.12n.jpeg", "numal-rt-60", (0.32, 0.06, 0.67, 0.96), True),
    ("WhatsApp Image 2026-08-20 at 15.47.12n.jpeg", "numal-rt-120", (0.63, 0.06, 0.995, 0.96), True),
    ("WhatsApp Image 2026-08-20 at 15.47.131.jpeg", "nhclin-600", (0.08, 0.18, 0.92, 0.82), True),
    ("WhatsApp Image 2026-08-20 at 15.47.1311.jpeg", "calcinum", (0.10, 0.12, 0.90, 0.90), True),
    ("WhatsApp Image 2026-08-20 at 15.47.141.jpeg", "fast-grow", (0.10, 0.08, 0.90, 0.92), False),
    ("WhatsApp Image 2026-08-20 at 15.47.1411.jpeg", "grohep", (0.04, 0.10, 0.96, 0.94), True),
    ("WhatsApp Image 2026-08-20 at 15.47.1411111.jpeg", "nhfero-cv", (0.06, 0.10, 0.94, 0.92), True),
    ("WhatsApp Image 2026-08-20 at 15.47.15.jpeg", "nch-dx", (0.12, 0.08, 0.88, 0.92), True),
    ("WhatsApp Image 2026-08-20 at 15.47.1511.jpeg", "platonorm-syrup", (0.04, 0.08, 0.96, 0.94), True),
    ("WhatsApp Image 2026-08-20 at 15.47.16.jpeg", "mbrraft", (0.16, 0.06, 0.84, 0.94), True),
    ("WhatsApp Image 2026-08-27 at 00.05.54.jpeg", "d3-micro", (0.06, 0.10, 0.94, 0.92), True),
    ("WhatsApp Image 2026-08-27 at 00.05.57.jpeg", "nhcort", (0.16, 0.08, 0.42, 0.92), False),
    ("WhatsApp Image 2026-08-27 at 00.05.59.jpeg", "mblac", (0.06, 0.04, 0.94, 0.96), True),
    ("WhatsApp Image 2026-08-27 at 00.06.00.jpeg", "nutrapeg", (0.10, 0.04, 0.90, 0.92), True),
    ("WhatsApp Image 2026-08-27 at 00.06.03.jpeg", "cefunum-500", (0.04, 0.08, 0.96, 0.94), True),
    ("WhatsApp Image 2026-08-27 at 00.06.04.jpeg", "macflu-150", (0.01, 0.06, 0.50, 0.96), True),
    ("WhatsApp Image 2026-08-27 at 00.06.04.jpeg", "momenum", (0.52, 0.06, 0.97, 0.30), True),
    ("WhatsApp Image 2026-08-27 at 00.06.04.jpeg", "terbinum", (0.52, 0.29, 0.97, 0.51), True),
    ("WhatsApp Image 2026-08-27 at 00.06.04.jpeg", "lulinum", (0.50, 0.46, 0.99, 0.78), False),
]


def collect_sources() -> None:
    SOURCE.mkdir(parents=True, exist_ok=True)
    for f in ROOT.glob("*.jpeg"):
        dest = SOURCE / f.name
        if not dest.exists():
            shutil.move(str(f), str(dest))


def main() -> None:
    collect_sources()
    OUT.mkdir(parents=True, exist_ok=True)
    print("loading u2net session…")
    session = new_session("u2net")
    for filename, slug, box, isolate in JOBS:
        path = src(filename)
        if not path.exists():
            print("MISSING", filename)
            continue
        im = Image.open(path)
        cropped = enhance_rgb(crop_frac(im, box))
        if isolate:
            cut = trim_alpha(remove(cropped, session=session).convert("RGBA"))
            framed = studio(cut)
        else:
            framed = studio(cropped.convert("RGBA"))
        save(framed, slug)


if __name__ == "__main__":
    main()
