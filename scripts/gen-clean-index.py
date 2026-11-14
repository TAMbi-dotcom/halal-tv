#!/usr/bin/env python3
"""Builds the box-cleaning index for the on-TV app from CleanYourTV's tested lists.

    scripts/gen-clean-index.py <cleanyourtv checkout>

CleanYourTV (github.com/Gathin23/cleanyourtv, MIT, third_party/cleanyourtv/LICENSE) keeps one tested
list per TV model in examples/<model>/debloat.txt, with what the TV is in examples/<model>/tv.json.
This reads them and writes on-tv/clean/clean-index.json (the app build copies it in):

  models   one entry per list: its name, Android version, the model and device codes found in its
           description and fingerprints (to match the box), and its packages in groups, in list order
           (order matters: on a Mi Box S the updater must go before PatchWall)
  common   packages that many lists switch off as telemetry or ads, for a box with no list of its own

Each group gets a kind from its heading: track (telemetry, tracking, ACR, ads), promo (content rows,
promos, demos, auto-installs), choice (personal choices, preloaded apps, casting, voice) or skip
(stock launchers and setup, which Halal TV never switches off). The TV app still checks every package
against its own safety rules before switching anything off.
"""
import json
import re
import subprocess
import sys
from collections import Counter, defaultdict
from pathlib import Path

PKG = re.compile(r"^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$")
OUT = Path(__file__).resolve().parents[1] / "on-tv/clean/clean-index.json"   # copied into the app by copyWeb


def kind_of(title):
    t = title.lower()
    if re.search(r"launcher|stock home|setup|wizard|home screen", t):
        return "skip"
    if re.search(r"personal|choice|owner|preload|not used|optional|cast|voice|assistant|remote|streaming apps|google extras|features", t):
        return "choice"
    if re.search(r"telemetry|track|analytic|acr|\bads?\b|advert|metric|usage|feedback|log|spy|data|stats|personalis|personaliz", t):
        return "track"
    if re.search(r"promo|content|row|recommend|auto.?install|partner|demo|retail|store|shopping|sponsor|patchwall|bloat|push|update", t):
        return "promo"
    return "choice"


def tokens(tv, text):
    out = set()
    for inside in re.findall(r"\(([^)]*)\)", tv):
        for w in re.split(r"[,;/ ]+", inside):
            w = w.strip()
            if re.fullmatch(r"[A-Za-z0-9_-]{3,}", w) and not re.fullmatch(r"\d{4}|streaming|box|tv|and", w, re.I):
                out.add(w.upper())
    for fp in re.findall(r"[A-Za-z0-9_]+/([A-Za-z0-9_]+)/([A-Za-z0-9_]+):\d", text):
        out.update(x.upper() for x in fp)
    for m in re.findall(r"\bmodel ([A-Z0-9][A-Za-z0-9_-]{2,})", text):
        out.add(m.upper())
    return sorted(out)


def read(path):
    """Groups of (package, note) in list order. A heading is the comment line (or block) right above
    a run of packages; the header notes at the top and commented-out packages are not headings."""
    lines = [l.strip() for l in path.read_text(encoding="utf-8", errors="replace").splitlines()]
    groups, title, last_comment = [], "Other", None
    for line in lines:
        if not line:
            last_comment = None
            continue
        if line.startswith("#"):
            body = line.lstrip("#").strip()
            words = body.split()
            if words and PKG.fullmatch(words[0].rstrip(",")):
                continue                       # a commented-out package: kept on, not a heading
            if last_comment is None and words and not body.startswith("-"):
                last_comment = body            # first line of a comment block
            continue
        name, _, note = line.partition("#")
        name = name.split()[0] if name.split() else ""
        if not PKG.fullmatch(name):
            continue
        if last_comment is not None:
            title = re.sub(r"\s*\(.*$", "", last_comment)[:100] or last_comment[:100]
            title = last_comment[:100]
            last_comment = None
        if not groups or groups[-1]["title"] != title:
            groups.append({"title": title, "kind": kind_of(title), "pkgs": []})
        groups[-1]["pkgs"].append([name, note.strip()[:90]])
    return groups


def main():
    root = Path(sys.argv[1] if len(sys.argv) > 1 else "/tmp/cyt")
    sha = subprocess.run(["git", "-C", str(root), "rev-parse", "HEAD"], capture_output=True, text=True).stdout.strip()
    models, track_count, notes = [], Counter(), defaultdict(str)
    for d in sorted((root / "examples").iterdir()):
        lst, info = d / "debloat.txt", d / "tv.json"
        if not lst.is_file() or not info.is_file():
            continue
        tv = json.loads(info.read_text(encoding="utf-8"))
        text = lst.read_text(encoding="utf-8", errors="replace")
        groups = [g for g in read(lst) if g["pkgs"]]
        if not groups:
            continue
        ver = re.search(r"(\d+)", tv.get("os", ""))
        models.append({"id": d.name, "tv": tv.get("tv", d.name), "os": tv.get("os", ""), "brand": tv.get("brand", ""),
                       "ver": int(ver.group(1)) if ver else 0, "tokens": tokens(tv.get("tv", ""), text), "groups": groups})
        for g in groups:
            if g["kind"] == "track":
                for name, note in g["pkgs"]:
                    track_count[name] += 1
                    if note and not notes[name]:
                        notes[name] = note
    common = [[p, n, notes[p]] for p, n in track_count.most_common() if n >= 3]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"source": "github.com/Gathin23/cleanyourtv@" + sha, "licence": "MIT",
                               "models": models, "common": common}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(models)} lists, {len(common)} common packages -> {OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
