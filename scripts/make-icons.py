#!/usr/bin/env python3
"""Draw Halal TV's app icon and TV banner as Android vector drawables (and SVG previews).

A pointed arch (mihrab) in gold, a crescent and a small star inside it, on deep green.
The banner adds the name, drawn as paths from Inter (SIL OFL 1.1), so no font ships in the app.

  python3 scripts/make-icons.py            # writes the drawables of both apps and build/icons/*.svg
"""
import math
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
FONT = "/usr/share/fonts/opentype/inter/InterDisplay-SemiBold.otf"
BG, ARCH, GOLD, CREAM = "#0B2A22", "#123B30", "#D9B45A", "#F2EAD8"
DRAWABLES = [ROOT / "on-tv/android/app/src/main/res/drawable",
             ROOT / "tv-home/android/app/src/main/res/drawable"]


def f(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def arch(x0, x1, base, spring, top):
    """A pointed arch: straight sides up to `spring`, two curves meeting at `top`."""
    cx, w = (x0 + x1) / 2, x1 - x0
    k = (spring - top) * 0.55
    return (f"M{f(x0)},{f(base)} L{f(x0)},{f(spring)} "
            f"C{f(x0)},{f(spring - k)} {f(cx - w * 0.22)},{f(top + (spring - top) * 0.25)} {f(cx)},{f(top)} "
            f"C{f(cx + w * 0.22)},{f(top + (spring - top) * 0.25)} {f(x1)},{f(spring - k)} {f(x1)},{f(spring)} "
            f"L{f(x1)},{f(base)} Z")


def crescent(cx, cy, r, dx, dy, r2):
    """Outer circle (cx, cy, r) minus inner circle (cx+dx, cy+dy, r2), as two arcs."""
    ix, iy = cx + dx, cy + dy
    d = math.hypot(dx, dy)
    a = (r * r - r2 * r2 + d * d) / (2 * d)
    h = math.sqrt(r * r - a * a)
    mx, my = cx + a * dx / d, cy + a * dy / d
    p1 = (mx + h * dy / d, my - h * dx / d)
    p2 = (mx - h * dy / d, my + h * dx / d)
    return (f"M{f(p1[0])},{f(p1[1])} A{f(r)},{f(r)} 0 1,0 {f(p2[0])},{f(p2[1])} "
            f"A{f(r2)},{f(r2)} 0 0,1 {f(p1[0])},{f(p1[1])} Z")


def star(cx, cy, r, inner=0.42, rot=-90):
    pts = []
    for i in range(10):
        rr = r if i % 2 == 0 else r * inner
        t = math.radians(rot + i * 36)
        pts.append(f"{f(cx + rr * math.cos(t))},{f(cy + rr * math.sin(t))}")
    return "M" + " L".join(pts) + " Z"


def motif(s, ox, oy):
    """The arch, crescent and star in a 48-unit box, scaled by s and moved to (ox, oy)."""
    g = []
    g.append(("arch", arch(ox + 12 * s, ox + 36 * s, oy + 41 * s, oy + 22 * s, oy + 6.5 * s)))
    g.append(("moon", crescent(ox + 23 * s, oy + 26 * s, 8 * s, 3.4 * s, -2.6 * s, 6.6 * s)))
    g.append(("star", star(ox + 28.6 * s, oy + 22.2 * s, 2.3 * s)))
    return g


def text_path(text, x, baseline, size, tracking=0.0):
    font = TTFont(FONT)
    gs, cmap, hmtx = font.getGlyphSet(), font.getBestCmap(), font["hmtx"]
    upm = font["head"].unitsPerEm
    k = size / upm
    pen = SVGPathPen(gs, ntos=lambda v: f(v))
    cur = 0.0
    for ch in text:
        name = cmap[ord(ch)]
        gs[name].draw(TransformPen(pen, (k, 0, 0, -k, x + cur, baseline)))
        cur += hmtx[name][0] * k + tracking
    return pen.getCommands(), cur - tracking


def vector(w, h, paths, note):
    body = "\n".join(f'    <path {attrs} android:pathData="{d}" />' for attrs, d in paths)
    return (f'<?xml version="1.0" encoding="utf-8"?>\n<!-- {note} Made by scripts/make-icons.py. -->\n'
            f'<vector xmlns:android="http://schemas.android.com/apk/res/android"\n'
            f'    android:width="{w}dp" android:height="{h}dp"\n'
            f'    android:viewportWidth="{w}" android:viewportHeight="{h}">\n{body}\n</vector>\n')


def svg(w, h, paths):
    def conv(attrs):
        return (attrs.replace('android:fillColor', 'fill').replace('android:strokeColor', 'stroke')
                .replace('android:strokeWidth', 'stroke-width').replace('android:strokeLineJoin', 'stroke-linejoin'))
    body = "\n".join(f'  <path {conv(a)} d="{d}"/>' for a, d in paths)
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w * 4}" height="{h * 4}">\n{body}\n</svg>\n'


def layers(s, ox, oy):
    m = dict(motif(s, ox, oy))
    return [
        (f'android:fillColor="{ARCH}" android:strokeColor="{GOLD}" android:strokeWidth="{f(1.7 * s)}" '
         f'android:strokeLineJoin="round"', m["arch"]),
        (f'android:fillColor="{GOLD}"', m["moon"]),
        (f'android:fillColor="{GOLD}"', m["star"]),
    ]


def main():
    k = 1.14   # the motif a little larger than its 48-unit box, so it reads at launcher size
    icon = [(f'android:fillColor="{BG}"', "M0,0h48v48h-48z")] + layers(k, 24 - 24 * k, 24 - 24.5 * k)

    W, H = 320, 180
    s = 2.55
    size = 46
    halal, wh = text_path("Halal", 0, 0, size)
    gap = size * 0.28
    _, wt = text_path("TV", 0, 0, size)
    group = 48 * s * 0.62 + 14 + wh + gap + wt
    x0 = (W - group) / 2
    mox = x0 - 12 * s + 1
    banner = [(f'android:fillColor="{BG}"', f"M0,0h{W}v{H}h-{W}z")] + layers(s, mox, (H - 48 * s) / 2 + 2)
    tx = x0 + 48 * s * 0.62 + 14
    base = H / 2 + size * 0.36
    halal, _ = text_path("Halal", tx, base, size)
    tv, _ = text_path("TV", tx + wh + gap, base, size)
    banner += [(f'android:fillColor="{CREAM}"', halal), (f'android:fillColor="{GOLD}"', tv)]

    prev = ROOT / "build/icons"
    prev.mkdir(parents=True, exist_ok=True)
    (prev / "icon.svg").write_text(svg(48, 48, icon))
    (prev / "banner.svg").write_text(svg(W, H, banner))
    for d in DRAWABLES:
        (d / "icon.xml").write_text(vector(48, 48, icon, "Halal TV icon: a gold arch, crescent and star on deep green."))
        (d / "banner.xml").write_text(vector(W, H, banner, "320x180 TV banner: the icon's arch and the name."))
    print("wrote", ", ".join(str(d.relative_to(ROOT)) for d in DRAWABLES), "and", prev.relative_to(ROOT))


if __name__ == "__main__":
    main()
