(function () {
  'use strict';
  var script = document.currentScript;
  var root = new URL('../', script.src);
  var here = new URL(window.location.href);
  var key = 'mimidev.language';
  var valid = function (v) { return v === 'en' || v === 'tr' || v === 'auto'; };
  var stored = null;
  try { stored = localStorage.getItem(key); } catch (_) {}
  var query = here.searchParams.get('lang');
  var preference = valid(query) ? query : (valid(stored) ? stored : 'auto');
  if (valid(query)) { try { localStorage.setItem(key, preference); } catch (_) {} }
  var device = String(navigator.language || (navigator.languages || [])[0] || 'en').toLowerCase().split(/[-_]/)[0];
  var language = preference === 'auto' ? (device === 'tr' ? 'tr' : 'en') : preference;
  var relative = decodeURI(here.pathname).slice(decodeURI(root.pathname).length);
  var current = relative.indexOf('tr/') === 0 ? 'tr' : 'en';
  var page = current === 'tr' ? relative.slice(3) : relative;
  if (!page || page.endsWith('/')) page += 'index.html';
  function destination(choice) {
    var chosen = choice === 'auto' ? (device === 'tr' ? 'tr' : 'en') : choice;
    var target = new URL((chosen === 'tr' ? 'tr/' : '') + page, root);
    target.search = here.search;
    target.searchParams.set('lang', choice);
    target.hash = here.hash;
    return target;
  }
  window.SiteLanguage = { language: language, preference: preference, device: device };
  if (current !== language) { window.location.replace(destination(preference).href); return; }
  document.documentElement.lang = language;
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-language-select]').forEach(function (select) {
      select.value = preference;
      select.addEventListener('change', function () {
        var next = select.value;
        if (!valid(next)) return;
        try { localStorage.setItem(key, next); } catch (_) {}
        window.location.assign(destination(next).href);
      });
    });
    // Keep the chosen mode across pages even when browser storage is blocked.
    document.querySelectorAll('a[href]').forEach(function (anchor) {
      var original = anchor.getAttribute('href');
      if (!original || original[0] === '#') return;
      var target;
      try { target = new URL(original, here); } catch (_) { return; }
      if (target.origin === root.origin && target.pathname.indexOf(root.pathname) === 0 && /(?:\.html|\/)$/i.test(target.pathname)) {
        target.searchParams.set('lang', preference);
        anchor.href = target.href;
      }
    });
  });
})();
