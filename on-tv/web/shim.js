// On-TV mode only. The TV app adds this script to the phone remote's page before anything else.
// It pairs the phone once (6 digit code shown on the TV), then adds the token to every /api call,
// so the remote itself is unchanged and the same build works with the computer bridge.
(function () {
  'use strict';
  var KEY = 'couchtv.token';
  // Halal TV: the pairing screen in Russian and Arabic too (the remote's own language choice first).
  var LANG = (function () {
    var l = null;
    try { l = localStorage.getItem('tv.lang'); if (!l || l === 'auto') l = localStorage.getItem('tv.lang.tv'); } catch (e) { }
    l = l || navigator.language || 'en';
    return /^ru/i.test(l) ? 'ru' : (/^ar/i.test(l) ? 'ar' : 'en');
  })();
  var TR = {
    ru: { 'Pair this phone': 'Подключите этот телефон', 'Type the 6 digit code shown on the TV.': 'Введите код из 6 цифр с экрана телевизора.',
      'This phone needs to pair with the TV again.': 'Этот телефон нужно снова подключить к телевизору.', 'Code from the TV': 'Код с телевизора',
      'Pair': 'Подключить', 'Show a code on the TV': 'Показать код на телевизоре', 'Asking the TV…': 'Спрашиваем телевизор…',
      'The code is on the TV now.': 'Код уже на экране телевизора.', 'The TV did not answer.': 'Телевизор не ответил.',
      'Can’t reach the TV.': 'Не удаётся связаться с телевизором.', 'The code has 6 digits.': 'В коде 6 цифр.',
      'Pairing…': 'Подключаемся…', 'Paired.': 'Подключено.', 'That did not work.': 'Не получилось.' },
    ar: { 'Pair this phone': 'إقران هذا الهاتف', 'Type the 6 digit code shown on the TV.': 'اكتب الرمز المكوّن من 6 أرقام الظاهر على التلفاز.',
      'This phone needs to pair with the TV again.': 'يحتاج هذا الهاتف إلى الإقران بالتلفاز مرة أخرى.', 'Code from the TV': 'الرمز من التلفاز',
      'Pair': 'إقران', 'Show a code on the TV': 'اعرض رمزًا على التلفاز', 'Asking the TV…': 'جارٍ سؤال التلفاز…',
      'The code is on the TV now.': 'الرمز ظاهر الآن على التلفاز.', 'The TV did not answer.': 'لم يستجب التلفاز.',
      'Can’t reach the TV.': 'تعذّر الوصول إلى التلفاز.', 'The code has 6 digits.': 'الرمز مكوّن من 6 أرقام.',
      'Pairing…': 'جارٍ الإقران…', 'Paired.': 'تم الإقران.', 'That did not work.': 'لم ينجح ذلك.' }
  };
  function tr(s) { return (TR[LANG] && TR[LANG][s]) || s; }
  var token = null;
  try { token = localStorage.getItem(KEY); } catch (e) { /* private mode: the cookie still works */ }
  if (!token) { var m = document.cookie.match(/(?:^|; )couchtv_token=([^;]+)/); if (m) token = decodeURIComponent(m[1]); }

  function isApi(url) {
    try { var u = new URL(url, location.href); return u.origin === location.origin && u.pathname.indexOf('/api/') === 0; } catch (e) { return false; }
  }
  function isPair(url) { return /\/api\/pair/.test(String(url)); }

  var realFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || String(input);
    if (isApi(url) && token) {
      init = Object.assign({}, init || {});
      var h = new Headers(init.headers || (typeof input !== 'string' && input.headers) || {});
      h.set('Authorization', 'Bearer ' + token);
      init.headers = h;
    }
    return realFetch(input, init).then(function (r) {
      if (r.status === 401 && isApi(url) && !isPair(url)) showPairing(tr('This phone needs to pair with the TV again.'));
      return r;
    });
  };

  var RealES = window.EventSource;
  if (RealES) {
    var ES = function (url, cfg) {
      if (token && isApi(url)) url += (String(url).indexOf('?') < 0 ? '?' : '&') + 'token=' + encodeURIComponent(token);
      return new RealES(url, cfg);
    };
    ES.prototype = RealES.prototype; ES.CONNECTING = 0; ES.OPEN = 1; ES.CLOSED = 2;
    window.EventSource = ES;
  }

  function save(t) {
    token = t;
    try { localStorage.setItem(KEY, t); } catch (e) { }
    document.cookie = 'couchtv_token=' + encodeURIComponent(t) + '; path=/; max-age=31536000; SameSite=Strict';
  }

  var shown = false;
  function showPairing(why) {
    if (shown) return; shown = true;
    var css = document.createElement('style');
    css.textContent = '#ctv-pair{position:fixed;top:0;right:0;bottom:0;left:0;z-index:99999;background:#0b0b0d;color:#f2ead8;display:flex;align-items:center;justify-content:center;padding:24px 16px;font:16px/1.4 -apple-system,system-ui,sans-serif}' +
      '#ctv-pair .box{width:100%;max-width:360px}#ctv-pair h1{font-size:26px;margin:0 0 8px}#ctv-pair p{color:#bdb6a7;margin:0 0 18px}' +
      '#ctv-pair input{width:100%;box-sizing:border-box;font-size:34px;letter-spacing:.3em;text-align:center;padding:14px;border-radius:14px;border:1px solid #3a3a40;background:#16161a;color:#f2ead8}' +
      '#ctv-pair button{width:100%;margin-top:12px;padding:15px;border-radius:14px;border:0;font-size:17px;font-weight:600}' +
      '#ctv-pair .go{background:#ffb52e;color:#111}#ctv-pair .ask{background:#222228;color:#f2ead8}#ctv-pair .msg{min-height:22px;margin-top:12px;color:#ffb52e}';
    document.head.appendChild(css);
    var d = document.createElement('div');
    d.id = 'ctv-pair';
    if (LANG === 'ar') d.dir = 'rtl';
    d.innerHTML = '<div class="box"><h1>' + tr('Pair this phone') + '</h1><p>' + (why || tr('Type the 6 digit code shown on the TV.')) + '</p>' +
      '<input id="ctv-pin" inputmode="numeric" autocomplete="one-time-code" maxlength="7" placeholder="000000" aria-label="' + tr('Code from the TV') + '">' +
      '<button class="go" id="ctv-go">' + tr('Pair') + '</button><button class="ask" id="ctv-ask">' + tr('Show a code on the TV') + '</button><div class="msg" id="ctv-msg" role="status"></div></div>';
    (document.body ? Promise.resolve() : new Promise(function (r) { document.addEventListener('DOMContentLoaded', r); })).then(function () {
      document.body.appendChild(d);
      var pin = document.getElementById('ctv-pin'), msg = document.getElementById('ctv-msg');
      document.getElementById('ctv-ask').onclick = function () {
        msg.textContent = tr('Asking the TV…');
        realFetch('/api/pair/start', { method: 'POST' }).then(function (r) { return r.json(); })
          .then(function (j) { msg.textContent = j.ok ? tr('The code is on the TV now.') : (j.error || tr('The TV did not answer.')); })
          .catch(function () { msg.textContent = tr('Can’t reach the TV.'); });
      };
      document.getElementById('ctv-go').onclick = function () {
        var code = (pin.value || '').replace(/\D/g, '');
        if (code.length !== 6) { msg.textContent = tr('The code has 6 digits.'); return; }
        msg.textContent = tr('Pairing…');
        realFetch('/api/pair', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pin: code, name: (navigator.platform || 'Phone') }) })
          .then(function (r) { return r.json(); })
          .then(function (j) { if (j.ok && j.token) { save(j.token); msg.textContent = tr('Paired.'); location.reload(); } else msg.textContent = j.error || tr('That did not work.'); })
          .catch(function () { msg.textContent = tr('Can’t reach the TV.'); });
      };
      pin.addEventListener('keydown', function (e) { if (e.key === 'Enter') document.getElementById('ctv-go').click(); });
    });
  }

  window.couchTv = { token: function () { return token; }, pair: showPairing };
  if (!token) showPairing();
})();
