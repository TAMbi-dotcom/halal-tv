# Keeping up with couch-tv

Halal TV started from a snapshot of couch-tv, not a GitHub fork, so updates are brought over by
hand from the commit below.

- Upstream: https://github.com/Seagey/couch-tv
- Imported at: `f67d3717d9647f53d4d85b5df9736323c65ebc80` (14 November 2026)

## Bringing in newer couch-tv changes

```sh
git remote add upstream https://github.com/Seagey/couch-tv.git   # once
git fetch upstream main
git diff f67d3717 upstream/main > /tmp/upstream.patch            # what changed since the import
git apply --3way /tmp/upstream.patch                              # resolve conflicts, then test
```

Then update "Imported at" above to the new upstream commit.

## Where Halal TV touches couch-tv's own files

Kept small on purpose, so merges stay easy:

- `tv-home/web/app.js`: the prayer section and card (`prayerRows`, `renderPrayer`), the Halal scenes
  (`halalScene`), the ayat idle action, the streaming question (`streamAsk`, `hideStreaming`), the
  default place (Antalya) and the repository link.
- `tv-home/web/i18n.js`: `S.ru`, `S.ar`, the Halal strings block, `brand()`; Hebrew removed.
- `tv-home/web/index.html`, `app.css` (appended sections at the end), `kids.js` (`prayerLine`).
- `remote/src/i18n.js`: `S.ru`, `S.ar`, brand replacement.
- `bridge/config.py`, `bridge/claude.py`: language lists.
- On-TV app: visible strings say Halal TV; package ids are still couch-tv's for now.
- Tests that count languages.

New files: `tv-home/web/prayer.js`, `ayat.js`, `ayat-data.js`, `vendor/`, `fonts/amiri-quran*`,
`backgrounds/halal/`.
