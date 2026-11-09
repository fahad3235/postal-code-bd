/* postal-code-bd — pure logic (Node-testable, no DOM).
 * Search / reverse lookup / division filter / code-range lookup
 * over the POSTCODES dataset from data.js.
 */
'use strict';

const BN_DIGITS = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
const BN_TO_EN = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };

/* Convert ASCII digits to Bengali digits; leaves other chars alone. */
function toBnDigits(s) {
  return String(s).replace(/[0-9]/g, (d) => BN_DIGITS[d]);
}

/* Convert Bengali digits to ASCII digits (so a Bangla-typed code still matches). */
function fromBnDigits(s) {
  return String(s).replace(/[০-৯]/g, (d) => BN_TO_EN[d]);
}

/* Normalise a search term: trim, collapse spaces, Bengali digits -> ASCII. */
function normTerm(s) {
  return fromBnDigits(String(s || '').trim()).replace(/\s+/g, ' ').toLowerCase();
}

/* A post office matches a query when EVERY word of the query appears in
 * its searchable text (English name, Bangla name, district, division, code). */
function matchesQuery(entry, query) {
  const q = normTerm(query);
  if (!q) return true;
  const hay = [
    entry.name, entry.bn, entry.district, entry.division, entry.code,
    kindLabel(entry.kind, 'en')
  ].join(' ').toLowerCase();
  return q.split(' ').every((w) => hay.includes(w));
}

function searchPostcodes(list, query) {
  return list.filter((e) => matchesQuery(e, query));
}

function filterByDivision(list, division) {
  if (!division || division === 'All') return list.slice();
  return list.filter((e) => e.division === division);
}

function filterByKind(list, kind) {
  if (!kind || kind === 'all') return list.slice();
  return list.filter((e) => e.kind === kind);
}

function countByDivision(list) {
  const out = {};
  for (const e of list) out[e.division] = (out[e.division] || 0) + 1;
  return out;
}

/* Reverse lookup: exact 4-digit code -> matching entries (usually 1). */
function lookupByCode(list, code) {
  const c = fromBnDigits(String(code || '').trim());
  if (!/^\d{4}$/.test(c)) return { ok: false, error: 'code-format', matches: [] };
  const matches = list.filter((e) => e.code === c);
  return { ok: true, code: c, matches };
}

/* Which confirmed district code-range does a 4-digit code fall in? */
function rangeForCode(ranges, code) {
  const c = fromBnDigits(String(code || '').trim());
  if (!/^\d{4}$/.test(c)) return null;
  const n = parseInt(c, 10);
  return ranges.find((r) => n >= r.from && n <= r.to) || null;
}

function kindLabel(kind, lang) {
  const map = {
    en: { gpo: 'General Post Office', ho: 'Head Office', hq: 'District Head Office', area: 'Area Post Office' },
    bn: { gpo: 'জেনারেল পোস্ট অফিস', ho: 'প্রধান ডাকঘর', hq: 'জেলা প্রধান ডাকঘর', area: 'এলাকার ডাকঘর' }
  };
  return (map[lang] || map.en)[kind] || kind;
}

/* Validate a postcode string typed by the user. Returns {ok, code} or {ok:false, error}. */
function validateCodeInput(raw) {
  const c = fromBnDigits(String(raw || '').trim());
  if (!c) return { ok: false, error: 'empty' };
  if (!/^\d{4}$/.test(c)) return { ok: false, error: 'format' };
  return { ok: true, code: c };
}

/* Favourites are stored as an array of codes. Pure helpers for tests. */
function toggleFav(favs, code) {
  const i = favs.indexOf(code);
  if (i >= 0) return favs.slice(0, i).concat(favs.slice(i + 1));
  return favs.concat([code]);
}

/* Strict favourites import: must be {app:'postal-code-bd', version:1, favourites:[codes]}
 * where every code is a 4-digit string present in the dataset. */
function parseFavouritesImport(text, list) {
  let data;
  try { data = JSON.parse(text); } catch (e) { return { ok: false, error: 'bad-json' }; }
  if (!data || typeof data !== 'object' || data.app !== 'postal-code-bd' || data.version !== 1) {
    return { ok: false, error: 'bad-format' };
  }
  if (!Array.isArray(data.favourites)) return { ok: false, error: 'bad-format' };
  const known = new Set(list.map((e) => e.code));
  const clean = [];
  for (const c of data.favourites) {
    if (typeof c !== 'string' || !/^\d{4}$/.test(c) || !known.has(c)) return { ok: false, error: 'bad-code' };
    if (!clean.includes(c)) clean.push(c);
  }
  return { ok: true, favourites: clean };
}

function buildFavouritesExport(favs) {
  return JSON.stringify({ app: 'postal-code-bd', version: 1, exportedAt: new Date().toISOString(), favourites: favs }, null, 2);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    toBnDigits, fromBnDigits, normTerm, matchesQuery, searchPostcodes,
    filterByDivision, filterByKind, countByDivision, lookupByCode,
    rangeForCode, kindLabel, validateCodeInput, toggleFav,
    parseFavouritesImport, buildFavouritesExport
  };
}
