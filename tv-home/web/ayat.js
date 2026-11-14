// Halal TV: the ayat screensaver. When the home has been left alone (Home settings, Look, "When the
// home sits idle": Ayat), app.js opens the idle overlay and calls HalalAyat.start(). Each ayah stays
// 30 seconds over one of the calm backgrounds in backgrounds/halal/ss-*.jpg, in Arabic with the
// translation of its meanings in the home's language (ayat-data.js says whose). Any key closes it.
(function () {
  "use strict";

  var BGS = ["ss-sea", "ss-ridges", "ss-pattern", "ss-clouds", "ss-lanterns"];
  var EVERY = 30000;
  var layer = null, timer = null, i = 0, b = 0, front = 0;

  function lang() { var l = window.I18N ? window.I18N.lang() : "en"; return l === "es-MX" ? "es" : l; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }
  function list() { return window.HALAL_AYAT || []; }

  function build(host) {
    layer = document.createElement("div");
    layer.className = "ayat-layer";
    layer.innerHTML = '<div class="ayat-bg"></div><div class="ayat-bg"></div><div class="ayat-shade"></div>' +
      '<div class="ayat-card"><p class="ayat-ar" lang="ar" dir="rtl"></p><p class="ayat-tr"></p><p class="ayat-ref"></p></div>' +
      '<div class="ayat-foot"><span class="ayat-clock"></span><span class="ayat-prayer"></span></div><p class="ayat-by"></p>';
    host.appendChild(layer);
  }

  function show() {
    var all = list();
    if (!all.length || !layer) return;
    var a = all[i % all.length], l = lang();
    var tr = l === "ar" ? "" : (a[l] || a.en || "");
    var card = layer.querySelector(".ayat-card");
    card.classList.remove("in");
    void card.offsetWidth;
    layer.querySelector(".ayat-ar").textContent = a.ar;
    var trEl = layer.querySelector(".ayat-tr");
    trEl.textContent = tr;
    trEl.style.display = tr ? "" : "none";
    layer.querySelector(".ayat-ref").textContent = "سورة " + a.name + " · " + a.s + ":" + a.v;
    var by = window.HALAL_AYAT_BY || {};
    layer.querySelector(".ayat-by").textContent = l === "ar" ? "" : (by[l] || by.en || "");
    card.classList.add("in");
    // the background changes every second ayah, cross-fading between two layers
    if (i % 2 === 0) {
      var bgs = layer.querySelectorAll(".ayat-bg");
      front = 1 - front;
      bgs[front].style.backgroundImage = 'url("backgrounds/halal/' + BGS[b % BGS.length] + '.jpg")';
      bgs[front].classList.add("on");
      bgs[1 - front].classList.remove("on");
      b++;
    }
    i++;
  }

  function foot(clock, prayer) {
    if (!layer) return;
    layer.querySelector(".ayat-clock").textContent = clock || "";
    layer.querySelector(".ayat-prayer").textContent = prayer || "";
  }

  function start(host) {
    if (!host) return;
    if (!layer || layer.parentNode !== host) build(host);
    var all = list();
    i = all.length ? Math.floor(Math.random() * all.length) : 0;
    b = Math.floor(Math.random() * BGS.length);
    layer.classList.add("on");
    show();
    clearInterval(timer);
    timer = setInterval(show, EVERY);
  }
  function stop() {
    clearInterval(timer);
    timer = null;
    if (layer) layer.classList.remove("on");
  }

  window.HalalAyat = { start: start, stop: stop, foot: foot, count: function () { return list().length; } };
})();
