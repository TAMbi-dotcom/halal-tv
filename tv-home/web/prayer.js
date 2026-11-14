// Halal TV: prayer times on the home, worked out on the TV itself with the adhan library
// (vendor/adhan.min.js, MIT, Batoul Apps). No network: only the place (lat, lon, time zone) that
// Home settings, Location already keeps. app.js calls HalalPrayer.render() every minute and asks it
// for the Prayer times section of Home settings (HalalPrayer.rows()).
//
// Settings live in ST.prayer (Home settings, kept on the TV and by the bridge when there is one):
//   method     adhan method name, or "Russia" (fajr 16°, isha 15°, as the Spiritual Administration
//              of Muslims of Russia is listed by common prayer time services)
//   madhab     "shafi" (Asr when the shadow equals the object) or "hanafi" (twice)
//   high       "auto" | "middle" | "seventh" | "angle": the rule for high latitudes
//   adj        minutes added to each time, to match the local mosque's timetable
//   hijri_adj  days added to the Hijri date (-2..2), since the month's start is decided by sighting
//   notify     a note on the home at each prayer time; before: minutes ahead for a reminder (0: none)
//   show       the card on the home
(function () {
  "use strict";

  var KEYS = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
  var PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

  // The names of the times, in every language the home speaks.
  var NAMES = {
    en: ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"],
    ru: ["Фаджр", "Восход", "Зухр", "Аср", "Магриб", "Иша"],
    ar: ["الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء"],
    tr: ["İmsak", "Güneş", "Öğle", "İkindi", "Akşam", "Yatsı"],
    es: ["Fajr", "Amanecer", "Dhuhr", "Asr", "Magrib", "Isha"],
    it: ["Fajr", "Sorgere del sole", "Dhuhr", "Asr", "Maghrib", "Isha"],
    de: ["Fadschr", "Sonnenaufgang", "Dhuhr", "Asr", "Maghrib", "Ischa"],
    fr: ["Fajr", "Lever du soleil", "Dhuhr", "Asr", "Maghrib", "Isha"],
    nl: ["Fajr", "Zonsopkomst", "Dhuhr", "Asr", "Maghrib", "Isha"],
    pl: ["Fadżr", "Wschód słońca", "Zuhr", "Asr", "Maghrib", "Isza"],
    cs: ["Fadžr", "Východ slunce", "Zuhr", "Asr", "Maghrib", "Iša"],
    pt: ["Fajr", "Nascer do sol", "Dhuhr", "Asr", "Maghrib", "Isha"],
    "sr-Latn-RS": ["Sabah", "Izlazak sunca", "Podne", "Ikindija", "Akšam", "Jacija"]
  };

  // The card's and the settings' own words. Languages not listed here fall back to English.
  var TXT = {
    en: {
      sec: "Prayer times", in_h_m: "{name} in {h} h {m} min", in_m: "{name} in {m} min", now: "Time for {name}",
      soon: "{name} in {m} min", note_now: "It is time for {name}", note_soon: "{name} in {m} minutes",
      friday: "Friday: Surah al-Kahf · Jumu'ah {time}", ram_iftar: "Iftar in {left}", ram_suhur: "Suhur ends in {left}",
      left_h_m: "{h} h {m} min", left_m: "{m} min", event_in: "{name}: expected in {d} days", event_today: "{name}: expected today",
      event_note: "Expected dates. Only Allah knows exactly when they come; follow the announcement where you live.",
      show: "Show on the home", method: "Calculation method", madhab: "Asr", shafi: "Standard", madhab_sub: "Standard: Shafi'i, Maliki and Hanbali. Hanafi: later Asr.",
      hanafi: "Hanafi", high: "High latitudes", high_auto: "Automatic", high_middle: "Middle of the night",
      high_seventh: "One seventh of the night", high_angle: "Twilight angle", adj_head: "Adjust to your mosque",
      adj_sub: "Left and right change it by a minute.", min: "{n} min", hijri_adj: "Hijri date correction",
      days: "{n} days", notify: "Note at prayer time", before: "Reminder before", before_none: "None",
      place: "Place", place_note: "Prayer times use the place from Location.", events: "Events of the year",
      on: "On", off: "Off", russia: "Spiritual Administration of Muslims of Russia"
    },
    ru: {
      sec: "Время намазов", in_h_m: "{name} через {h} ч {m} мин", in_m: "{name} через {m} мин", now: "Время намаза {name}",
      soon: "{name} через {m} мин", note_now: "Наступило время намаза {name}", note_soon: "{name} через {m} мин",
      friday: "Пятница: сура «Аль-Кахф» · джума {time}", ram_iftar: "До ифтара {left}", ram_suhur: "До конца сухура {left}",
      left_h_m: "{h} ч {m} мин", left_m: "{m} мин", event_in: "{name}: ожидается через {d} дн.", event_today: "{name}: ожидается сегодня",
      event_note: "Ожидаемые даты. Точное время их наступления знает только Аллах; ориентируйтесь на объявление в вашей местности.",
      show: "Показывать на главном экране", method: "Способ расчёта", madhab: "Аср", shafi: "Стандартный", madhab_sub: "Стандартный: шафиитский, маликитский, ханбалитский мазхабы. Ханафитский: аср позже.",
      hanafi: "Ханафитский", high: "Высокие широты", high_auto: "Автоматически", high_middle: "Середина ночи",
      high_seventh: "Седьмая часть ночи", high_angle: "Угол сумерек", adj_head: "Поправка под вашу мечеть",
      adj_sub: "Влево и вправо меняют на минуту.", min: "{n} мин", hijri_adj: "Поправка даты по хиджре",
      days: "{n} дн.", notify: "Уведомление о намазе", before: "Напоминание заранее", before_none: "Нет",
      place: "Место", place_note: "Время намазов считается для места из раздела «Место».", events: "События года",
      on: "Вкл.", off: "Выкл.", russia: "ДУМ РФ"
    },
    ar: {
      sec: "مواقيت الصلاة", in_h_m: "{name} بعد {h} س {m} د", in_m: "{name} بعد {m} د", now: "حان وقت {name}",
      soon: "{name} بعد {m} د", note_now: "حان الآن وقت صلاة {name}", note_soon: "{name} بعد {m} دقيقة",
      friday: "الجمعة: سورة الكهف · صلاة الجمعة {time}", ram_iftar: "الإفطار بعد {left}", ram_suhur: "ينتهي السحور بعد {left}",
      left_h_m: "{h} س {m} د", left_m: "{m} د", event_in: "{name}: متوقع بعد {d} يومًا", event_today: "{name}: متوقع اليوم",
      event_note: "تواريخ متوقعة، والله وحده يعلم وقتها على التحقيق؛ اتبع الإعلان الرسمي في بلدك.",
      show: "إظهار على الشاشة الرئيسية", method: "طريقة الحساب", madhab: "العصر", shafi: "الجمهور", madhab_sub: "الجمهور: الشافعي والمالكي والحنبلي. الحنفي: العصر متأخر.",
      hanafi: "الحنفي", high: "خطوط العرض العليا", high_auto: "تلقائي", high_middle: "منتصف الليل",
      high_seventh: "سُبع الليل", high_angle: "زاوية الشفق", adj_head: "ضبط حسب مسجدك",
      adj_sub: "اليمين واليسار يغيّران دقيقة.", min: "{n} د", hijri_adj: "تصحيح التاريخ الهجري",
      days: "{n} يوم", notify: "تنبيه عند وقت الصلاة", before: "تذكير قبل الصلاة", before_none: "بلا",
      place: "المكان", place_note: "تُحسب المواقيت للمكان المختار في قسم الموقع.", events: "مناسبات العام",
      on: "تشغيل", off: "إيقاف", russia: "الإدارة الدينية لمسلمي روسيا"
    },
    tr: {
      sec: "Namaz vakitleri", in_h_m: "{name} vaktine {h} sa {m} dk", in_m: "{name} vaktine {m} dk", now: "{name} vakti",
      soon: "{name} vaktine {m} dk", note_now: "{name} vakti girdi", note_soon: "{name} vaktine {m} dakika",
      friday: "Cuma: Kehf suresi · Cuma namazı {time}", ram_iftar: "İftara {left}", ram_suhur: "İmsaka {left}",
      left_h_m: "{h} sa {m} dk", left_m: "{m} dk", event_in: "{name}: tahminen {d} gün sonra", event_today: "{name}: tahminen bugün",
      event_note: "Tahmini tarihler. Doğrusunu yalnızca Allah bilir; bulunduğunuz yerdeki resmî duyuruyu esas alın.",
      show: "Ana ekranda göster", method: "Hesaplama yöntemi", madhab: "İkindi", shafi: "Standart", madhab_sub: "Standart: Şafii, Maliki ve Hanbeli. Hanefi: ikindi daha geç.",
      hanafi: "Hanefi", high: "Yüksek enlemler", high_auto: "Otomatik", high_middle: "Gece yarısı",
      high_seventh: "Gecenin yedide biri", high_angle: "Şafak açısı", adj_head: "Camiinize göre ayarlayın",
      adj_sub: "Sağ ve sol bir dakika değiştirir.", min: "{n} dk", hijri_adj: "Hicri tarih düzeltmesi",
      days: "{n} gün", notify: "Vakit bildirimi", before: "Önceden hatırlatma", before_none: "Yok",
      place: "Konum", place_note: "Vakitler Konum bölümündeki yere göre hesaplanır.", events: "Yılın dini günleri",
      on: "Açık", off: "Kapalı", russia: "Rusya Müslümanları Dini İdaresi"
    }
  };

  // The year's days, by Hijri month and day. Mawlid and the kandils are left out on purpose: scholars
  // differ about marking them.
  var EVENTS = [
    { m: 1, d: 1, n: { en: "Islamic New Year", ru: "Исламский Новый год", ar: "رأس السنة الهجرية", tr: "Hicri yılbaşı" } },
    { m: 1, d: 10, n: { en: "Day of Ashura", ru: "День Ашура", ar: "يوم عاشوراء", tr: "Aşure günü" } },
    { m: 9, d: 1, n: { en: "Start of Ramadan", ru: "Начало Рамадана", ar: "بداية رمضان", tr: "Ramazan başlangıcı" } },
    { m: 10, d: 1, n: { en: "Eid al-Fitr", ru: "Ураза-байрам", ar: "عيد الفطر", tr: "Ramazan Bayramı" } },
    { m: 12, d: 1, n: { en: "First ten days of Dhul-Hijjah", ru: "Первые десять дней Зуль-хиджжа", ar: "العشر الأوائل من ذي الحجة", tr: "Zilhicce'nin ilk on günü" } },
    { m: 12, d: 9, n: { en: "Day of Arafah", ru: "День Арафа", ar: "يوم عرفة", tr: "Arefe günü" } },
    { m: 12, d: 10, n: { en: "Eid al-Adha", ru: "Курбан-байрам", ar: "عيد الأضحى", tr: "Kurban Bayramı" } }
  ];

  // [id, adhan method, label key or plain label]. The first is the default.
  var METHODS = [
    ["Turkey", "Diyanet (Türkiye)"], ["Russia", "@russia"], ["MuslimWorldLeague", "Muslim World League"],
    ["UmmAlQura", "Umm al-Qura (Makkah)"], ["Egyptian", "Egyptian General Authority"], ["Karachi", "University of Karachi"],
    ["NorthAmerica", "ISNA (North America)"], ["MoonsightingCommittee", "Moonsighting Committee"], ["Dubai", "Dubai"],
    ["Kuwait", "Kuwait"], ["Qatar", "Qatar"], ["Singapore", "Singapore (MUIS)"], ["Tehran", "Tehran"]
  ];
  var HIGH = ["auto", "middle", "seventh", "angle"];
  var BEFORE = [0, 5, 10, 15, 20, 30];
  var DEFAULTS = { method: "Turkey", madhab: "shafi", high: "auto", adj: {}, hijri_adj: 0, notify: true, before: 10, show: true };

  function lang() { var l = window.I18N ? window.I18N.lang() : "en"; return l === "es-MX" ? "es" : l; }
  function tx(key, vars) {
    var s = (TXT[lang()] || {})[key];
    if (s == null) s = TXT.en[key];
    if (s == null) s = key;
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return s;
  }
  function name(key) { var n = NAMES[lang()] || NAMES.en; return n[KEYS.indexOf(key)]; }
  function evName(e) { return e.n[lang()] || e.n.en; }
  function locale() { return window.I18N ? window.I18N.locale() : "en-AU"; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }

  function settings(ST) {
    var p = ST && ST.prayer && typeof ST.prayer === "object" ? ST.prayer : {}, out = {};
    for (var k in DEFAULTS) out[k] = p[k] != null ? p[k] : DEFAULTS[k];
    if (!METHODS.some(function (m) { return m[0] === out.method; })) out.method = DEFAULTS.method;
    if (out.madhab !== "hanafi") out.madhab = "shafi";
    if (HIGH.indexOf(out.high) < 0) out.high = "auto";
    out.adj = out.adj && typeof out.adj === "object" ? out.adj : {};
    out.hijri_adj = Math.max(-2, Math.min(2, Math.round(+out.hijri_adj || 0)));
    if (BEFORE.indexOf(out.before) < 0) out.before = DEFAULTS.before;
    return out;
  }

  function params(c, lat) {
    var A = window.adhan, p;
    if (c.method === "Russia") { p = A.CalculationMethod.Other(); p.fajrAngle = 16; p.ishaAngle = 15; }
    else p = A.CalculationMethod[c.method]();
    p.madhab = c.madhab === "hanafi" ? A.Madhab.Hanafi : A.Madhab.Shafi;
    p.highLatitudeRule = c.high === "middle" ? A.HighLatitudeRule.MiddleOfTheNight :
      c.high === "seventh" ? A.HighLatitudeRule.SeventhOfTheNight :
      c.high === "angle" ? A.HighLatitudeRule.TwilightAngle : A.HighLatitudeRule.recommended(new A.Coordinates(lat, 0));
    var adj = {};
    KEYS.forEach(function (k) { adj[k] = Math.max(-30, Math.min(30, Math.round(+c.adj[k] || 0))); });
    // adhan's own method adjustments (Diyanet's, for one) stay; ours are added on top
    KEYS.forEach(function (k) { p.adjustments[k] = (p.adjustments[k] || 0) + adj[k]; });
    return p;
  }

  // The calendar date at the place, which may not be the TV's own time zone.
  function ymd(date, tz) {
    try {
      var parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "numeric", day: "numeric" }).formatToParts(date), o = {};
      parts.forEach(function (x) { o[x.type] = +x.value; });
      if (o.year && o.month && o.day) return [o.year, o.month, o.day];
    } catch (e) {}
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()];
  }
  function tzOf(place) { return place && place.timezone && place.timezone !== "auto" ? place.timezone : undefined; }

  function timesFor(c, place, date) {
    var A = window.adhan;
    if (!A || !place || !isFinite(place.lat) || !isFinite(place.lon)) return null;
    var d = ymd(date, tzOf(place));
    var pt = new A.PrayerTimes(new A.Coordinates(place.lat, place.lon), new Date(d[0], d[1] - 1, d[2], 12), params(c, place.lat));
    var out = {};
    KEYS.forEach(function (k) { out[k] = pt[k]; });
    return out;
  }

  function fmt(date, place, clock24) {
    var o = { hour: "2-digit", minute: "2-digit", hour12: !clock24 };
    if (tzOf(place)) o.timeZone = tzOf(place);
    try { return date.toLocaleTimeString(locale(), o); } catch (e) {
      var h = date.getHours(), m = date.getMinutes();
      return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
    }
  }

  // Hijri: Umm al-Qura from the WebView's own calendar, moved by the correction in Home settings.
  function hijriParts(date, c, place) {
    var d = new Date(date.getTime() + c.hijri_adj * 864e5);
    try {
      var o = { year: "numeric", month: "numeric", day: "numeric" };
      if (tzOf(place)) o.timeZone = tzOf(place);
      var parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", o).formatToParts(d), r = {};
      parts.forEach(function (x) { if (x.type === "year" || x.type === "month" || x.type === "day") r[x.type] = parseInt(x.value, 10); });
      if (r.year && r.month && r.day) return r;
    } catch (e) {}
    return null;
  }
  function hijriText(date, c, place) {
    var d = new Date(date.getTime() + c.hijri_adj * 864e5);
    try {
      var o = { year: "numeric", month: "long", day: "numeric" };
      if (tzOf(place)) o.timeZone = tzOf(place);
      var s = new Intl.DateTimeFormat(locale() + "-u-ca-islamic-umalqura", o).format(d);
      // drop the era the WebView adds ("AH", "г. х.", "هـ"), then put Arabic's own back
      for (var i = 0; i < 3; i++) s = s.replace(/\s*(AH|A\.H\.|г\.(\s*х\.)?|هـ|H\.?)\s*$/i, "").trim();
      s = s.replace(/^Hicri\s+/i, "");
      return s + (lang() === "ar" ? " هـ" : "");
    } catch (e) { return ""; }
  }

  function left(ms) {
    var m = Math.max(0, Math.ceil(ms / 60000)), h = Math.floor(m / 60);
    return h ? tx("left_h_m", { h: h, m: m % 60 }) : tx("left_m", { m: m });
  }

  // Today's times, the next prayer (tomorrow's Fajr after Isha) and how long until it.
  function state(ST, place, now) {
    var c = settings(ST), today = timesFor(c, place, now);
    if (!today) return null;
    var next = null;
    for (var i = 0; i < PRAYERS.length; i++) if (today[PRAYERS[i]] > now) { next = { key: PRAYERS[i], at: today[PRAYERS[i]] }; break; }
    if (!next) { var tm = timesFor(c, place, new Date(now.getTime() + 864e5)); next = { key: "fajr", at: tm.fajr }; }
    return { c: c, today: today, next: next };
  }

  function upcomingEvent(c, place, now) {
    for (var i = 0; i <= 30; i++) {
      var h = hijriParts(new Date(now.getTime() + i * 864e5), c, place);
      if (!h) return null;
      for (var j = 0; j < EVENTS.length; j++) if (EVENTS[j].m === h.month && EVENTS[j].d === h.day) return { e: EVENTS[j], d: i };
    }
    return null;
  }

  function extras(s, place, now) {
    var out = [], h = hijriParts(now, s.c, place);
    var wd = (function () { try { return new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: tzOf(place) }).format(now); } catch (e) { return ""; } })();
    if (h && h.month === 9) {
      if (now < s.today.fajr) out.push(tx("ram_suhur", { left: left(s.today.fajr - now) }));
      else if (now < s.today.maghrib) out.push(tx("ram_iftar", { left: left(s.today.maghrib - now) }));
    }
    if (wd === "Fri" && now < s.today.asr) out.push(tx("friday", { time: fmt(s.today.dhuhr, place, true) }));
    var ev = upcomingEvent(s.c, place, now);
    if (ev && ev.d <= 14) out.push(ev.d === 0 ? tx("event_today", { name: evName(ev.e) }) : tx("event_in", { name: evName(ev.e), d: ev.d }));
    return out;
  }

  // The card: Hijri date and the next prayer on top, the six times, then Friday, Ramadan or an event.
  function cardHTML(ST, place, now, clock24) {
    var s = state(ST, place, now);
    if (!s || !s.c.show) return "";
    var mins = Math.ceil((s.next.at - now) / 60000), h = Math.floor(mins / 60);
    var nx = h ? tx("in_h_m", { name: name(s.next.key), h: h, m: mins % 60 }) : tx("in_m", { name: name(s.next.key), m: mins });
    var rows = KEYS.map(function (k) {
      var cls = "pr-row" + (k === "sunrise" ? " sun" : "") + (k === s.next.key && s.next.at - now < 864e5 && s.today[k] === s.next.at ? " next" : "") +
        (s.today[k] <= now ? " past" : "");
      return '<li class="' + cls + '"><span class="pr-n">' + esc(name(k)) + '</span><span class="pr-t">' + esc(fmt(s.today[k], place, clock24)) + "</span></li>";
    }).join("");
    var ex = extras(s, place, now).map(function (x) { return '<div class="pr-x">' + esc(x) + "</div>"; }).join("");
    return '<div class="pr-card"><div class="pr-head"><span class="pr-hijri">' + esc(hijriText(now, s.c, place)) + '</span><span class="pr-next">' +
      esc(nx) + '</span></div><ul class="pr-list">' + rows + "</ul>" + ex + "</div>";
  }

  // One line for the idle screen and kids mode: the next prayer and its time.
  function lineText(ST, place, now, clock24) {
    var s = state(ST, place, now);
    if (!s || !s.c.show) return "";
    return name(s.next.key) + " " + fmt(s.next.at, place, clock24) + " · " + hijriText(now, s.c, place);
  }

  // A note when a prayer time comes, and a reminder the chosen minutes before. Each fires once.
  var fired = {};
  function due(ST, place, now) {
    var s = state(ST, place, now);
    if (!s || !s.c.notify) return null;
    for (var i = 0; i < PRAYERS.length; i++) {
      var k = PRAYERS[i], at = s.today[k], d = now - at, id = k + "@" + at.getTime();
      if (d >= 0 && d < 90000 && !fired[id]) { fired[id] = 1; return tx("note_now", { name: name(k) }); }
      var b = s.c.before * 60000, id2 = "b" + id;
      if (s.c.before && at - now <= b && at - now > b - 90000 && !fired[id2]) { fired[id2] = 1; return tx("note_soon", { name: name(k), m: s.c.before }); }
    }
    return null;
  }

  // Home settings, Prayer times. ctx: { ST, save, info, head, place, refresh }.
  function rows(ctx) {
    var c = settings(ctx.ST);
    function set(k, v) { var p = ctx.ST.prayer && typeof ctx.ST.prayer === "object" ? ctx.ST.prayer : {}; p[k] = v; ctx.ST.prayer = p; ctx.save(); ctx.refresh(); }
    function onoff(v) { return v ? tx("on") : tx("off"); }
    function step(list, v, d) { var i = list.indexOf(v); return list[(i + d + list.length) % list.length]; }
    var mIds = METHODS.map(function (m) { return m[0]; });
    var mLabel = function (id) { var m = METHODS.filter(function (x) { return x[0] === id; })[0]; return m[1].charAt(0) === "@" ? tx(m[1].slice(1)) : m[1]; };
    var out = [
      ctx.info("pr-place", tx("place"), ctx.place && ctx.place.place ? ctx.place.place : "—", tx("place_note")),
      { kind: "toggle", key: "pr-show", label: tx("show"), value: onoff(c.show), act: function () { set("show", !c.show); } },
      { kind: "cycle", key: "pr-method", label: tx("method"), value: mLabel(c.method),
        adjust: function (d) { set("method", step(mIds, c.method, d)); }, act: function () { set("method", step(mIds, c.method, 1)); } },
      { kind: "cycle", key: "pr-madhab", label: tx("madhab"), sub: tx("madhab_sub"), value: tx(c.madhab),
        act: function () { set("madhab", c.madhab === "hanafi" ? "shafi" : "hanafi"); } },
      { kind: "cycle", key: "pr-high", label: tx("high"), value: tx("high_" + c.high),
        adjust: function (d) { set("high", step(HIGH, c.high, d)); }, act: function () { set("high", step(HIGH, c.high, 1)); } },
      { kind: "toggle", key: "pr-notify", label: tx("notify"), value: onoff(c.notify), act: function () { set("notify", !c.notify); } },
      { kind: "cycle", key: "pr-before", label: tx("before"), value: c.before ? tx("min", { n: c.before }) : tx("before_none"),
        adjust: function (d) { set("before", step(BEFORE, c.before, d)); }, act: function () { set("before", step(BEFORE, c.before, 1)); } },
      { kind: "cycle", key: "pr-hijri", label: tx("hijri_adj"), value: tx("days", { n: (c.hijri_adj > 0 ? "+" : "") + c.hijri_adj }),
        adjust: function (d) { set("hijri_adj", Math.max(-2, Math.min(2, c.hijri_adj + d))); },
        act: function () { set("hijri_adj", c.hijri_adj >= 2 ? -2 : c.hijri_adj + 1); } },
      ctx.head(tx("adj_head"))
    ];
    KEYS.forEach(function (k) {
      var v = Math.round(+c.adj[k] || 0);
      var put = function (n) { var a = {}; for (var x in c.adj) a[x] = c.adj[x]; a[k] = Math.max(-30, Math.min(30, n)); set("adj", a); };
      out.push({ kind: "cycle", key: "pr-adj-" + k, label: name(k), sub: tx("adj_sub"), value: tx("min", { n: (v > 0 ? "+" : "") + v }),
        adjust: function (d) { put(v + d); }, act: function () { put(v >= 30 ? -30 : v + 1); } });
    });
    out.push(ctx.head(tx("events")));
    var now = new Date();
    EVENTS.forEach(function (e, i) {
      var d = null;
      for (var j = 0; j <= 400 && d == null; j++) {
        var hp = hijriParts(new Date(now.getTime() + j * 864e5), c, ctx.place);
        if (!hp) break;
        if (hp.month === e.m && hp.day === e.d) d = new Date(now.getTime() + j * 864e5);
      }
      var when = "";
      if (d) try { when = d.toLocaleDateString(locale(), { day: "numeric", month: "long", year: "numeric", timeZone: tzOf(ctx.place) }); } catch (er) { when = d.toDateString(); }
      out.push(ctx.info("pr-ev-" + i, evName(e), when));
    });
    out.push(ctx.info("pr-ev-note", tx("event_note")));
    return out;
  }

  window.HalalPrayer = {
    settings: settings, state: state, timesFor: timesFor, cardHTML: cardHTML, lineText: lineText,
    due: due, rows: rows, title: function () { return tx("sec"); }, hijriText: hijriText, names: NAMES
  };
})();
