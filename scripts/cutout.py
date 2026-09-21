"""
Lift a portrait off a flat studio background into a transparent PNG.

Written for a specific, common case: a person shot against a smooth neutral
backdrop. A plain brightness key fails here because dark hair and a dark
background sit at the same luminance — measured on the source photo, the hair
averaged 0.123 and the backdrop 0.13.

Two things do separate them:
  * warmth  — skin and hair are warm (R minus B of +12 to +77), the neutral
              backdrop is not (about 0)
  * texture — hair has detail (local deviation 15 to 35), the backdrop is
              almost perfectly smooth (0.7 to 2.9)

So the matte is built from warmth, texture and brightness together, then
cleaned up and softened.

Usage:
    python3 scripts/cutout.py <input> <output.png> [--width 1100]
"""

import sys
from PIL import Image, ImageFilter
import numpy as np


def build_matte(rgb: np.ndarray) -> np.ndarray:
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    gray = 0.299 * r + 0.587 * g + 0.114 * b

    # Warmth: positive for skin and hair, ~0 for a neutral backdrop.
    warmth = np.clip((r - b) / 26.0, 0.0, 1.0)

    # Texture: difference from a blurred copy. Smooth backdrop -> near zero.
    blurred = np.asarray(
        Image.fromarray(gray.astype(np.uint8)).filter(ImageFilter.GaussianBlur(3.0)),
        dtype=np.float32,
    )
    texture = np.clip(np.abs(gray - blurred) / 9.0, 0.0, 1.0)

    # Brightness above the backdrop level carries the face on its own.
    brightness = np.clip((gray - 46.0) / 55.0, 0.0, 1.0)

    score = np.clip(0.55 * warmth + 0.5 * texture + 1.0 * brightness, 0.0, 1.0)
    return score


def clean(mask: Image.Image) -> Image.Image:
    # Close speckle, then open to drop isolated grain in the backdrop.
    mask = mask.filter(ImageFilter.MaxFilter(9))
    mask = mask.filter(ImageFilter.MinFilter(9))
    mask = mask.filter(ImageFilter.MinFilter(5))
    mask = mask.filter(ImageFilter.MaxFilter(5))
    return mask


def fill_holes(mask: np.ndarray) -> np.ndarray:
    """Flood the outside, then treat everything unreached as subject."""
    h, w = mask.shape
    outside = np.zeros((h, w), dtype=bool)
    stack = []

    for x in range(w):
        for y in (0, h - 1):
            if not mask[y, x]:
                stack.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if not mask[y, x]:
                stack.append((y, x))

    while stack:
        y, x = stack.pop()
        if y < 0 or y >= h or x < 0 or x >= w or outside[y, x] or mask[y, x]:
            continue
        outside[y, x] = True
        stack.extend(((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)))

    return ~outside


def main() -> None:
    src, dst = sys.argv[1], sys.argv[2]
    width = 1100
    if "--width" in sys.argv:
        width = int(sys.argv[sys.argv.index("--width") + 1])

    im = Image.open(src).convert("RGB")
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)

    rgb = np.asarray(im, dtype=np.float32)
    score = build_matte(rgb)

    binary = Image.fromarray(((score > 0.34) * 255).astype(np.uint8))
    binary = clean(binary)
    solid = fill_holes(np.asarray(binary) > 127)

    alpha = Image.fromarray((solid * 255).astype(np.uint8))
    # Soft edge so hair and shoulders dissolve instead of cutting out.
    alpha = alpha.filter(ImageFilter.GaussianBlur(1.6))

    out = im.convert("RGBA")
    out.putalpha(alpha)
    out.save(dst)

    a = np.asarray(alpha, dtype=np.float32) / 255.0
    print(f"wrote {dst}  {out.width}x{out.height}  coverage={a.mean()*100:.1f}%")


if __name__ == "__main__":
    main()
