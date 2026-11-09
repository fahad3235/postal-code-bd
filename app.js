/* postal-code-bd — DOM wiring. Depends on data.js, logic.js, i18n.js. */
'use strict';

(function () {
  var LS_LANG = 'pcb-lang';
  var LS_FAVS = 'pcb-favs';
  var DATA = window.POSTCODES || [];
  var RANGES = window.CODE_RANGES || [];
  var DIVS = window.DIVISIONS || [];

  var state = {
    lang: 'en',
    query: '',
    division: 'All',
    kind: 'all',
    favOnly: false,
    favs: []
  };

  function $(id) { return document.getElementById(id); }

  function loadState() {
    try {
      var l = localStorage.getItem(LS_LANG);
      if (l === 'bn' || l === 'en') state.lang = l;
      var f = JSON.parse(localStorage.getItem(LS_FAVS) || '[]');
      if (Array.isArray(f)) state.favs = f.filter(function (c) { return /^\d{4}$/.test(c); });
    } catch (e) { /* storage unavailable: keep defaults */ }
  }
  function saveLang() { try { localStorage.setItem(LS_LANG, state.lang); } catch (e) {} }
  function saveFavs() { try { localStorage.setItem(LS_FAVS, JSON.stringify(state.favs)); } catch (e) {} }

  function t(key) { return (window.I18N[state.lang] || window.I18N.en)[key]; }
  function dispCode(code) { return state.lang === 'bn' ? toBnDigits(code) : code; }
  function dispNum(n) { return state.lang === 'bn' ? toBnDigits(String(n)) : String(n); }
  function divName(d) { return state.lang === 'bn' ? (window.DIVISION_BN[d] || d) : d; }
  function entryName(e) { return state.lang === 'bn' ? e.bn : e.name; }

  var toastTimer = null;
  function toast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2200);
  }

  function copyText(text, doneMsg) {
    function done() { toast(doneMsg || t('copied')); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else { fallbackCopy(text); done(); }
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  function filteredList() {
    var list = DATA;
    list = filterByDivision(list, state.division);
    list = filterByKind(list, state.kind);
    list = searchPostcodes(list, state.query);
    if (state.favOnly) list = list.filter(function (e) { return state.favs.indexOf(e.code) >= 0; });
    return list;
  }

  function renderStatic() {
    $('appTitle').textContent = t('title');
    $('appSubtitle').textContent = t('subtitle');
    $('searchLabel').textContent = t('searchLabel');
    $('searchInput').placeholder = t('searchPh');
    $('lookupLabel').textContent = t('lookupLabel');
    $('lookupInput').placeholder = t('lookupPh');
    $('lookupBtn').textContent = t('lookupBtn');
    $('favOnlyLabel').textContent = t('favOnly');
    $('emptyTitle').textContent = state.favOnly ? t('noFavs') : t('noResults');
    $('emptyHint').textContent = t('noResultsHint');
    $('rangesTitle').textContent = t('rangesTitle');
    $('rangesIntro').textContent = t('rangesIntro');
    $('aboutTitle').textContent = t('aboutTitle');
    $('about1').textContent = t('about1');
    $('about2').textContent = t('about2');
    $('about3').textContent = t('about3');
    $('dataTitle').textContent = t('dataTitle');
    $('exportBtn').textContent = t('exportBtn');
    $('importBtn').textContent = t('importBtn');
    $('eraseBtn').textContent = t('eraseBtn');
    $('footerNote').textContent = t('footer');
    $('sourcesNote').textContent = t('sources');
    $('thRange').textContent = t('code');
    $('thDistrict').textContent = t('district');
    $('thDivision').textContent = t('division');
    $('modalDistrictLabel').textContent = t('district');
    $('modalDivisionLabel').textContent = t('division');
    $('modalTypeLabel').textContent = t('type');
    $('modalCopy').textContent = t('copy');
    $('langToggle').textContent = state.lang === 'bn' ? 'English' : 'বাংলা';
    document.documentElement.lang = state.lang === 'bn' ? 'bn' : 'en';

    // Division chips
    var counts = countByDivision(DATA);
    var chips = $('divisionChips');
    chips.innerHTML = '';
    var all = document.createElement('button');
    all.type = 'button';
    all.className = 'chip' + (state.division === 'All' ? ' active' : '');
    all.textContent = t('allDivisions') + ' (' + dispNum(DATA.length) + ')';
    all.addEventListener('click', function () { state.division = 'All'; render(); });
    chips.appendChild(all);
    DIVS.forEach(function (d) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (state.division === d ? ' active' : '');
      b.textContent = divName(d) + ' (' + dispNum(counts[d] || 0) + ')';
      b.addEventListener('click', function () { state.division = d; render(); });
      chips.appendChild(b);
    });

    // Kind select
    var sel = $('kindSelect');
    sel.innerHTML = '';
    [['all', t('allKinds')], ['gpo', t('kind_gpo')], ['ho', t('kind_ho')], ['hq', t('kind_hq')], ['area', t('kind_area')]].forEach(function (pair) {
      var o = document.createElement('option');
      o.value = pair[0];
      o.textContent = pair[1];
      if (state.kind === pair[0]) o.selected = true;
      sel.appendChild(o);
    });

    // Ranges table
    var tbody = document.querySelector('#rangesTable tbody');
    tbody.innerHTML = '';
    RANGES.forEach(function (r) {
      var tr = document.createElement('tr');
      var td1 = document.createElement('td'); td1.className = 'code-cell';
      td1.textContent = dispCode(String(r.from)) + '–' + dispCode(String(r.to));
      var td2 = document.createElement('td'); td2.textContent = r.district;
      var td3 = document.createElement('td'); td3.textContent = divName(r.division);
      tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3);
      tbody.appendChild(tr);
    });
  }

  function cardEl(e) {
    var card = document.createElement('article');
    card.className = 'card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', entryName(e) + ' ' + e.code);

    var top = document.createElement('div');
    top.className = 'card-top';
    var name = document.createElement('div');
    var n1 = document.createElement('div'); n1.className = 'card-name'; n1.textContent = entryName(e);
    var n2 = document.createElement('div'); n2.className = 'card-bn';
    n2.textContent = state.lang === 'bn' ? e.name : e.bn;
    name.appendChild(n1); name.appendChild(n2);
    var star = document.createElement('button');
    star.type = 'button';
    star.className = 'star' + (state.favs.indexOf(e.code) >= 0 ? ' on' : '');
    star.textContent = state.favs.indexOf(e.code) >= 0 ? '★' : '☆';
    star.setAttribute('aria-label', 'Favourite ' + e.name);
    star.addEventListener('click', function (ev) {
      ev.stopPropagation();
      state.favs = toggleFav(state.favs, e.code);
      saveFavs();
      render();
    });
    top.appendChild(name); top.appendChild(star);

    var code = document.createElement('div');
    code.className = 'card-code';
    code.textContent = dispCode(e.code);
    var meta = document.createElement('div');
    meta.className = 'card-meta';
    meta.textContent = divName(e.division) + ' · ' + e.district + ' · ' + kindLabel(e.kind, state.lang);

    var actions = document.createElement('div');
    actions.className = 'card-actions';
    var copyBtn = document.createElement('button');
    copyBtn.type = 'button'; copyBtn.className = 'mini-btn'; copyBtn.textContent = t('copy');
    copyBtn.addEventListener('click', function (ev) { ev.stopPropagation(); copyText(e.code); });
    var detBtn = document.createElement('button');
    detBtn.type = 'button'; detBtn.className = 'mini-btn'; detBtn.textContent = t('details');
    detBtn.addEventListener('click', function (ev) { ev.stopPropagation(); openModal(e); });
    actions.appendChild(copyBtn); actions.appendChild(detBtn);

    card.appendChild(top); card.appendChild(code); card.appendChild(meta); card.appendChild(actions);
    card.addEventListener('click', function () { openModal(e); });
    card.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openModal(e); }
    });
    return card;
  }

  function renderCards() {
    var list = filteredList();
    var wrap = $('cards');
    wrap.innerHTML = '';
    list.forEach(function (e) { wrap.appendChild(cardEl(e)); });
    $('emptyState').hidden = list.length !== 0;
    $('emptyTitle').textContent = state.favOnly ? t('noFavs') : t('noResults');
    $('resultCount').textContent = dispNum(list.length) + ' ' + (list.length === 1 ? t('resultOne') : t('results'));
  }

  function render() {
    renderStatic();
    renderCards();
  }

  var modalEntry = null;
  function openModal(e) {
    modalEntry = e;
    $('modalKind').textContent = kindLabel(e.kind, state.lang);
    $('modalName').textContent = e.name;
    $('modalBn').textContent = e.bn;
    $('modalCode').textContent = dispCode(e.code);
    $('modalDistrict').textContent = e.district;
    $('modalDivision').textContent = divName(e.division);
    $('modalType').textContent = kindLabel(e.kind, state.lang);
    syncModalFav();
    $('modal').hidden = false;
  }
  function syncModalFav() {
    if (!modalEntry) return;
    var on = state.favs.indexOf(modalEntry.code) >= 0;
    $('modalFav').textContent = (on ? '★ ' : '☆ ') + (state.lang === 'bn' ? 'প্রিয়' : 'Favourite');
  }
  function closeModal() { $('modal').hidden = true; modalEntry = null; }

  function doLookup() {
    var raw = $('lookupInput').value;
    var v = validateCodeInput(raw);
    var err = $('lookupError');
    var res = $('lookupResult');
    err.hidden = true;
    res.hidden = true;
    res.innerHTML = '';
    if (!v.ok) {
      err.textContent = t('lookupInvalid');
      err.hidden = false;
      return;
    }
    var found = lookupByCode(DATA, v.code);
    var range = rangeForCode(RANGES, v.code);
    var title = document.createElement('p');
    title.className = 'lr-title';
    title.textContent = found.matches.length ? t('lookupFound') : t('lookupNotFound');
    res.appendChild(title);
    found.matches.forEach(function (e) {
      var row = document.createElement('div');
      row.className = 'lr-row';
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'mini-btn';
      b.textContent = entryName(e) + ' — ' + dispCode(e.code) + ' (' + divName(e.division) + ', ' + e.district + ')';
      b.addEventListener('click', function () { openModal(e); });
      row.appendChild(b);
      res.appendChild(row);
    });
    var hint = document.createElement('p');
    hint.className = 'lr-hint muted';
    hint.textContent = range
      ? t('lookupRange') + ': ' + dispCode(String(range.from)) + '–' + dispCode(String(range.to)) + ' — ' + range.district + ', ' + divName(range.division)
      : t('lookupRangeNone');
    res.appendChild(hint);
    res.hidden = false;
  }

  function bind() {
    $('langToggle').addEventListener('click', function () {
      state.lang = state.lang === 'bn' ? 'en' : 'bn';
      saveLang();
      render();
    });
    $('searchInput').addEventListener('input', function (ev) {
      state.query = ev.target.value;
      renderCards();
    });
    $('kindSelect').addEventListener('change', function (ev) {
      state.kind = ev.target.value;
      render();
    });
    $('favOnly').addEventListener('change', function (ev) {
      state.favOnly = ev.target.checked;
      renderCards();
    });
    $('lookupBtn').addEventListener('click', doLookup);
    $('lookupInput').addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') doLookup();
    });
    $('modalClose').addEventListener('click', closeModal);
    $('modal').addEventListener('click', function (ev) { if (ev.target === $('modal')) closeModal(); });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') closeModal(); });
    $('modalCopy').addEventListener('click', function () {
      if (modalEntry) copyText(modalEntry.code);
    });
    $('modalFav').addEventListener('click', function () {
      if (!modalEntry) return;
      state.favs = toggleFav(state.favs, modalEntry.code);
      saveFavs();
      syncModalFav();
      renderCards();
      renderStatic();
    });
    $('exportBtn').addEventListener('click', function () {
      if (!state.favs.length) { $('dataMsg').textContent = t('exportEmpty'); return; }
      var blob = new Blob([buildFavouritesExport(state.favs)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'postal-code-bd-favourites.json';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      $('dataMsg').textContent = '';
    });
    $('importBtn').addEventListener('click', function () { $('importFile').click(); });
    $('importFile').addEventListener('change', function (ev) {
      var file = ev.target.files && ev.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var r = parseFavouritesImport(String(reader.result || ''), DATA);
        if (r.ok) {
          state.favs = r.favourites;
          saveFavs();
          $('dataMsg').textContent = t('importOk');
          render();
        } else {
          $('dataMsg').textContent = t('importBad');
        }
        ev.target.value = '';
      };
      reader.readAsText(file);
    });
    $('eraseBtn').addEventListener('click', function () {
      var ans = window.prompt(t('eraseConfirm'));
      if (ans === 'DELETE') {
        state.favs = [];
        saveFavs();
        $('dataMsg').textContent = t('eraseDone');
        render();
      }
    });
  }

  loadState();
  bind();
  render();
})();
