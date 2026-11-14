# Notice: what Halal TV is built from

Halal TV is released under the MIT licence ([LICENSE](LICENSE)). It contains work by others, each
under its own licence.

| Part | Where | By | Licence |
|---|---|---|---|
| couch-tv (the home screen, phone remote, bridge, on-TV app, tools, docs) | everything not listed below | Seagey and contributors, github.com/Seagey/couch-tv | MIT |
| adhan (prayer time calculation) | `tv-home/web/vendor/adhan.min.js` | Batoul Apps, github.com/batoulapps/adhan-js | MIT (`tv-home/web/vendor/adhan.LICENSE`) |
| Quran text and translations of the meanings | `tv-home/web/ayat-data.js` | quran-json by Risan Bagja (CC BY 4.0), from The Noble Qur'an Encyclopedia (Uthmani text) and tanzil.net (translations) | CC BY 4.0 for the compilation; see below for the translators |
| Amiri Quran font | `tv-home/web/fonts/amiri-quran-arabic-400-normal.woff2` | The Amiri Project Authors | SIL Open Font Licence 1.1 (`tv-home/web/fonts/amiri-quran.LICENSE`) |
| Inter and Antonio fonts | `tv-home/web/fonts/` | their authors (via couch-tv) | SIL Open Font Licence 1.1 |
| Scene and screensaver backgrounds | `tv-home/web/backgrounds/halal/` | made for Halal TV with ComfyUI (Z-Image) | free to use with Halal TV |
| Weather and place search | runtime, Open-Meteo | open-meteo.com | free, attribution |

## Translations of the meanings of the Quran

The screensaver quotes single short ayat, each shown with the translator's name, never the whole
work: Russian, Elmir Kuliev; English, Saheeh International; Turkish, Diyanet İşleri Başkanlığı;
French, Muhammad Hamidullah; Spanish, Muhammad Isa García. Russian quotations rely on the right to
quote published works for informational and educational purposes with the translator and source
named (the project owner's reading of the law); keep any written permission you obtain in this
repository.

## Changes from couch-tv

Prayer times, Hijri date, Ramadan, Friday, adhkar and events (`tv-home/web/prayer.js`), the ayat
screensaver (`tv-home/web/ayat.js`), new scenes, Russian and Arabic, Hebrew removed at the owner's
request, the streaming-services question, the Halal TV name and update source. Everything else is
couch-tv as of the commit named in [UPSTREAM.md](UPSTREAM.md).
