# Halal TV

**A calm home screen for Android TV and TV boxes, made for Muslim families.**
Prayer times on the home, an ayat screensaver instead of adverts, the Hijri date, Ramadan and Friday
reminders, a Beautiful Name of Allah each day. No ads, no analytics. English, Russian, Arabic and 11
more languages.

**[Русская версия ниже](#русский)**

> **Status: early version, in development.** Tested on a Xiaomi Mi Box S (Android TV 9).

## What it does

- **Prayer times** on the home: Fajr, sunrise, Dhuhr, Asr, Maghrib, Isha, with the next one
  highlighted and a countdown. Computed on the box itself, no internet needed.
  - Methods: Diyanet (default), Spiritual Administration of Muslims of Russia, Muslim World League,
    Umm al-Qura, Egypt, Karachi, ISNA, Moonsighting Committee, Dubai, Kuwait, Qatar, Singapore, Tehran.
  - Asr madhab (standard or Hanafi), a high-latitude rule, and a per-prayer offset in minutes to
    match your mosque's timetable.
  - The city is chosen in Home settings → Place (Antalya by default).
- **A note at prayer time** and **a reminder before** (5 to 30 minutes), with no adhan sound: on the
  home, and as a small card over any app (YouTube, films, live TV).
- **Hijri date**, with a ±2 day correction (the start of the month is decided differently in
  different places).
- **Ramadan:** countdown to suhur and iftar. **Friday:** a reminder of Surah al-Kahf and Jumu'ah.
- **Adhkar reminder** after Fajr and after Asr (can be switched off).
- **The Beautiful Names of Allah:** one Name each day on the prayer card, and the Names in the
  ayat screensaver (can be switched off).
- **Events of the year** (Islamic New Year, Ashura, Ramadan, Eid al-Fitr, the days of Dhul-Hijjah,
  Arafah, Eid al-Adha), with the note that the dates are expected and only Allah knows exactly when
  they come.
- **Ayat screensaver:** after 10 minutes of quiet, short ayat over calm backgrounds, in Arabic with
  the translation of the meanings in the home's language. Any key closes it.
- **Backgrounds** for the home: a desert night, a mosque courtyard, a misty valley, an Andalusian
  garden, a winter village, an autumn lake, a city at dusk, an olive grove, a spring meadow, an oasis,
  a valley of rock chimneys.
- **Kids mode** with a parent PIN and chosen apps; the background and prayer times stay.
- **Streaming services** (Netflix, Prime Video and the like) can be hidden at first run. Nothing is
  uninstalled, and one button brings them back. YouTube stays.
- **Phone remote** (a web page, no app store) for iPhone and Android.
- **Box clean-up:** switches off the maker's tracking, adverts and pushed services (see below).
- Everything else from couch-tv: your apps in your order, Keep watching, quick buttons, settings on
  the TV itself.

## Trust

- No ads, no analytics, no accounts. Prayer times and the Hijri date are computed on the device.
- The network is used only for the weather and the city search (Open-Meteo), and for checking
  GitHub for updates if you switch that on.
- Open source, MIT licence.

## Install

From a Windows computer, with one command (box and computer on the same Wi-Fi):

1. On the box: Settings → Device Preferences → About, press Build 7 times, then Developer options →
   USB debugging.
2. On the computer, download `install-windows.ps1` from the Releases page and run it in PowerShell:
   `powershell -ExecutionPolicy Bypass -File install-windows.ps1 -Tv <box IP address>`.
   It downloads Google's adb and the latest Halal TV, installs or updates it and makes it the home
   screen. The box asks "Allow USB debugging?" once: tick Always and press Allow.
3. On the box, in Halal TV, press **Connect ADB**.

Updates install over the top and keep your settings. Early test builds (before 14 November 2026)
used the id `dev.couchtv.ontv`: the script offers to remove one, because two copies would both answer
the Home button.

Phone remote: open the address the box shows in the phone's browser, type the code from the TV, and
add the page to the home screen (Share → Add to Home Screen on iPhone, ⋮ → Add to Home screen on
Android). The setup page is the same address with `/setup` on the end.

To remove it: Settings → Apps → Halal TV → Uninstall on the box. The box's own home comes back by
itself. Without a computer: [on-tv/README.md](on-tv/README.md).

## Box clean-up

Home settings → Clean the box switches off the maker's tracking, adverts and pushed services, from
the checked list for your model in [CleanYourTV](https://github.com/Gathin23/cleanyourtv) (the Mi Box S
has one). Nothing is uninstalled, and Restore switches everything back on. Home screens, setup, the
remote, voice and Android's own parts are never switched off.

## Sources

- **Quran:** the screensaver quotes single ayat with the translator named, never the book as a whole.
  Arabic text (Uthmani): The Noble Qur'an Encyclopedia (quranenc.com). Translations of the meanings:
  Russian, Elmir Kuliev; English, Saheeh International; Turkish, Diyanet İşleri Başkanlığı; French,
  Muhammad Hamidullah; Spanish, Muhammad Isa García; from QuranEnc, where translations are reviewed under
  the Rowwad Translation Center: German, Frank Bubenheim and Nadeem Elyas; Portuguese, Helmi Nasr; Dutch
  and Serbian, Rowwad Translation Center. Italian, Polish and Czech show the English translation for now;
  suggestions of translations approved by scholars are welcome.
- **The Beautiful Names of Allah:** the list, Russian transliteration, meanings and Quran references
  from the Encyclopedia of the Quran, Quran Academy
  ([Имена Аллаха](https://ru.quranacademy.org/encyclopedia/article/Asma-Husna)). The meanings exist
  there in Russian only, so other languages show the Arabic Name and the verses.

## Languages

English, Russian, Arabic (right to left), Turkish, Spanish (and Mexican Spanish), Italian, German,
French, Dutch, Polish, Czech, Portuguese (Brazil), Serbian.

## Based on couch-tv

Halal TV is a fork of [couch-tv](https://github.com/Seagey/couch-tv) (Seagey, MIT licence). Almost all
of the home screen, the remote and the install comes from there: thank you to its author and
contributors. The original README: [docs/COUCH-TV-README.md](docs/COUCH-TV-README.md). Pulling in
couch-tv updates: [UPSTREAM.md](UPSTREAM.md). Who made what, and under which licences:
[NOTICE.md](NOTICE.md). Hebrew is not included in this fork.

---

## Русский

**Спокойный главный экран для Android TV и приставок, сделанный для мусульманской семьи.**
Время намазов на главном экране, заставка с аятами вместо рекламы, хиджри-дата, Рамадан и пятница,
одно из Прекрасных имён Аллаха каждый день. Без рекламы и без аналитики.

> **Статус: ранняя версия, в разработке.** Проверяется на Xiaomi Mi Box S (Android TV 9).

### Что умеет

- **Время намазов** на главном экране: фаджр, восход, зухр, аср, магриб, иша, ближайший намаз
  подсвечен, рядом обратный отсчёт. Считается прямо на приставке, без интернета.
  - Способы расчёта: Diyanet (по умолчанию), ДУМ РФ, Muslim World League, Умм аль-Кура, Египет,
    Карачи, ISNA, Moonsighting Committee, Дубай, Кувейт, Катар, Сингапур, Тегеран.
  - Мазхаб для асра (стандартный или ханафитский), правило для высоких широт, поправка каждого
    времени по минутам под расписание вашей мечети.
  - Город выбирается в «Настройки главного экрана» → «Место» (по умолчанию Анталья).
- **Уведомление о намазе** и **напоминание заранее** (5–30 минут), без звука азана: на главном экране
  и небольшой карточкой поверх любого приложения (YouTube, фильмы, ТВ).
- **Хиджри-дата** с поправкой ±2 дня (начало месяца определяют по-разному).
- **Рамадан:** обратный отсчёт до сухура и ифтара. **Пятница:** напоминание о суре «Аль-Кахф» и джума.
- **Напоминание об азкарах** после фаджра и после асра (можно выключить).
- **Прекрасные имена Аллаха:** одно Имя в день на карточке намазов и Имена в заставке с аятами
  (можно выключить).
- **События года** (Исламский Новый год, Ашура, Рамадан, Ураза-байрам, дни Зуль-хиджжа, Арафа,
  Курбан-байрам) с оговоркой: даты ожидаемые, точное время их наступления знает только Аллах.
- **Заставка с аятами:** через 10 минут бездействия — короткие аяты на спокойных фонах, арабский
  текст и перевод смыслов на языке экрана. Любая кнопка закрывает.
- **Фоны** главного экрана: пустыня ночью, двор мечети, туманная долина, андалусский сад, зимняя
  деревня, осеннее озеро, город в сумерках, оливковая роща, весенний луг, оазис, долина каменных столбов.
- **Детский режим** с родительским PIN и разрешёнными приложениями; фон и время намазов остаются.
- **Стриминговые сервисы** (Netflix, Prime Video и подобные) при первом запуске предлагается скрыть.
  Они не удаляются и возвращаются одной кнопкой. YouTube остаётся.
- **Пульт на телефоне** (веб-страница, без магазина приложений) для iPhone и Android.
- Всё остальное из couch-tv: ваши приложения в вашем порядке, «Продолжить просмотр», быстрые кнопки,
  настройки прямо на телевизоре.

### Доверие

- Нет рекламы, нет аналитики, нет учётных записей. Время намазов и хиджри считаются на устройстве.
- Сеть нужна только для погоды и поиска города (Open-Meteo) и для проверки обновлений на GitHub,
  если вы её включили.
- Код открыт, лицензия MIT.

### Установка

С компьютера на Windows, одной командой (приставка и ПК в одной сети Wi-Fi):

1. На приставке: «Настройки → Настройки устройства → Об устройстве», 7 раз нажать «Сборка», затем
   «Для разработчиков» → «Отладка по USB».
2. На ПК скачайте `install-windows.ps1` со страницы выпусков и запустите в PowerShell:
   `powershell -ExecutionPolicy Bypass -File install-windows.ps1 -Tv <IP приставки>`.
   Скрипт сам скачает adb от Google и последнюю версию Halal TV, установит или обновит её и сделает
   главным экраном. Приставка один раз спросит «Разрешить отладку по USB?» — «Всегда» и «Разрешить».
3. На приставке в Halal TV нажмите **Connect ADB**.

Обновления ставятся поверх, настройки сохраняются. Ранние тестовые сборки (до 14 ноября 2026) стояли
под именем `dev.couchtv.ontv`: скрипт спросит, удалить ли такую сборку, потому что две копии спорят за
кнопку «Домой».

Пульт на телефоне: откройте в браузере телефона адрес, который показывает приставка, введите код с
экрана и добавьте страницу на домашний экран («Поделиться → На экран „Домой“» на iPhone, «⋮ → Добавить
на главный экран» на Android). Страница настройки — тот же адрес с `/setup` на конце.

Удалить: «Настройки → Приложения → Halal TV → Удалить» на приставке. Главный экран приставки при этом
возвращается сам. Без компьютера: [on-tv/README.md](on-tv/README.md).

### Очистка приставки

«Настройки главного экрана → Очистка приставки» отключает слежку, рекламу и навязанные службы
производителя по проверенному списку для вашей модели из [CleanYourTV](https://github.com/Gathin23/cleanyourtv)
(для Mi Box S список есть). Ничего не удаляется, кнопка «Вернуть» включает всё обратно. Главные
экраны, настройка, пульт, голос и системные части Android не отключаются никогда.

### Источники

- **Коран:** аяты на заставке — цитаты отдельных аятов с указанием переводчика, не книга целиком.
  Арабский текст (усмановский) — The Noble Qur'an Encyclopedia (quranenc.com). Переводы смыслов:
  русский — Эльмир Кулиев; английский — Saheeh International; турецкий — Diyanet İşleri Başkanlığı;
  французский — Мухаммад Хамидуллах; испанский — Мухаммад Иса Гарсия; из QuranEnc, где переводы
  проверяются под руководством Rowwad Translation Center: немецкий — Франк Бубенхайм и Надим Элиас;
  португальский — Хельми Наср; нидерландский и сербский — Rowwad Translation Center. Для итальянского,
  польского и чешского пока показывается английский перевод: предложения переводов, одобренных учёными,
  приветствуются.
- **Прекрасные имена Аллаха:** список, транслитерация, значения и ссылки на аяты — из «Энциклопедии
  Корана» Академии Корана ([Имена Аллаха](https://ru.quranacademy.org/encyclopedia/article/Asma-Husna)).
  Значения там есть только на русском, поэтому на других языках показываются арабское Имя и аяты.

### Языки

Русский, арабский (справа налево), английский, турецкий, испанский (и мексиканский), итальянский,
немецкий, французский, нидерландский, польский, чешский, португальский (Бразилия), сербский.

### Основано на couch-tv

Halal TV — форк [couch-tv](https://github.com/Seagey/couch-tv) (Seagey, лицензия MIT). Почти всё
устройство главного экрана, пульта и установки — оттуда, спасибо автору и участникам. Оригинальный
README: [docs/COUCH-TV-README.md](docs/COUCH-TV-README.md). Как подтягивать обновления couch-tv:
[UPSTREAM.md](UPSTREAM.md). Кто что сделал и под какими лицензиями: [NOTICE.md](NOTICE.md).
