/* postal-code-bd — Node unit tests for logic.js + data.js. Run: node test.js */
'use strict';
const assert = require('node:assert');
const { POSTCODES, CODE_RANGES, DIVISIONS } = require('./data.js');
const {
  toBnDigits, fromBnDigits, searchPostcodes, filterByDivision, filterByKind,
  countByDivision, lookupByCode, rangeForCode, kindLabel, validateCodeInput,
  toggleFav, parseFavouritesImport, buildFavouritesExport
} = require('./logic.js');

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; console.log('ok - ' + name); }
  catch (e) { console.error('FAIL - ' + name + ': ' + e.message); process.exitCode = 1; }
}

// --- dataset integrity ---
check('dataset: 92 entries', () => assert.strictEqual(POSTCODES.length, 92));
check('dataset: all 64 districts present as HQ/GPO rows', () => {
  const districts = new Set(POSTCODES.map((e) => e.district));
  assert.strictEqual(districts.size, 64);
});
check('dataset: 8 divisions', () => {
  assert.deepStrictEqual([...new Set(POSTCODES.map((e) => e.division))].sort(), [...DIVISIONS].sort());
});
check('dataset: every code is a unique 4-digit string', () => {
  const codes = POSTCODES.map((e) => e.code);
  assert.strictEqual(new Set(codes).size, codes.length);
  codes.forEach((c) => assert.match(c, /^\d{4}$/));
});
check('dataset: every entry has EN + Bangla names', () => {
  POSTCODES.forEach((e) => {
    assert.ok(e.name && e.name.length > 1, e.code);
    assert.ok(e.bn && /[\u0980-\u09FF]/.test(e.bn), e.code);
  });
});
check('dataset: GPO codes are 1000/4000/6000/9000 (+1100 metro)', () => {
  const byCode = Object.fromEntries(POSTCODES.map((e) => [e.code, e]));
  assert.strictEqual(byCode['1000'].kind, 'gpo');
  assert.strictEqual(byCode['4000'].kind, 'gpo');
  assert.strictEqual(byCode['6000'].kind, 'gpo');
  assert.strictEqual(byCode['9000'].kind, 'gpo');
  assert.strictEqual(byCode['1100'].district, 'Dhaka');
});
check('dataset: 23 Dhaka city area entries', () => {
  assert.strictEqual(POSTCODES.filter((e) => e.kind === 'area').length, 23);
});
check('dataset: Sylhet 3100 present', () => {
  const s = POSTCODES.find((e) => e.district === 'Sylhet');
  assert.ok(s && s.code === '3100' && s.division === 'Sylhet');
});
check('dataset: division counts sum to 92', () => {
  const counts = countByDivision(POSTCODES);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  assert.strictEqual(total, 92);
  assert.strictEqual(counts.Dhaka, 37); // 14 HQ/GPO/HO rows + 23 areas
  assert.strictEqual(counts.Chattogram, 12);
  assert.strictEqual(counts.Khulna, 11);
  assert.strictEqual(counts.Rajshahi, 10);
  assert.strictEqual(counts.Barishal, 6);
  assert.strictEqual(counts.Sylhet, 4);
  assert.strictEqual(counts.Rangpur, 8);
  assert.strictEqual(counts.Mymensingh, 4);
});

// --- digits ---
check('toBnDigits: 1207 -> ১২০৭', () => assert.strictEqual(toBnDigits('1207'), '১২০৭'));
check('fromBnDigits: ১২০৭ -> 1207', () => assert.strictEqual(fromBnDigits('১২০৭'), '1207'));
check('toBnDigits leaves non-digits alone', () => assert.strictEqual(toBnDigits('Dhaka 1000'), 'Dhaka ১০০০'));

// --- search ---
check('search: "gulshan" finds Gulshan 1212', () => {
  const r = searchPostcodes(POSTCODES, 'gulshan');
  assert.strictEqual(r.length, 1);
  assert.strictEqual(r[0].code, '1212');
});
check('search: Bangla "গুলশান" finds Gulshan', () => {
  const r = searchPostcodes(POSTCODES, 'গুলশান');
  assert.strictEqual(r.length, 1);
  assert.strictEqual(r[0].code, '1212');
});
check('search: "1207" finds Mohammadpur', () => {
  const r = searchPostcodes(POSTCODES, '1207');
  assert.strictEqual(r.length, 1);
  assert.strictEqual(r[0].name, 'Mohammadpur');
});
check('search: Bangla digits "১২০৭" find Mohammadpur', () => {
  const r = searchPostcodes(POSTCODES, '১২০৭');
  assert.strictEqual(r.length, 1);
  assert.strictEqual(r[0].name, 'Mohammadpur');
});
check('search: multi-word AND "dhaka gulshan" -> 1', () => {
  assert.strictEqual(searchPostcodes(POSTCODES, 'dhaka gulshan').length, 1);
});
check('search: "khulna" finds all 11 Khulna-division entries', () => {
  assert.strictEqual(searchPostcodes(POSTCODES, 'khulna').length, 11);
});
check('search: empty query returns all', () => {
  assert.strictEqual(searchPostcodes(POSTCODES, '').length, 92);
});
check('search: no match returns empty', () => {
  assert.strictEqual(searchPostcodes(POSTCODES, 'zzzqqq').length, 0);
});
check('search: case-insensitive "SYLHET" finds all 4 Sylhet-division entries', () => {
  assert.strictEqual(searchPostcodes(POSTCODES, 'SYLHET').length, 4);
});

// --- filters ---
check('filterByDivision: Sylhet -> 4', () => {
  assert.strictEqual(filterByDivision(POSTCODES, 'Sylhet').length, 4);
});
check('filterByDivision: All -> 92', () => {
  assert.strictEqual(filterByDivision(POSTCODES, 'All').length, 92);
});
check('filterByKind: area -> 23; gpo -> 4', () => {
  assert.strictEqual(filterByKind(POSTCODES, 'area').length, 23);
  assert.strictEqual(filterByKind(POSTCODES, 'gpo').length, 4);
});

// --- reverse lookup ---
check('lookupByCode: 1207 -> Mohammadpur', () => {
  const r = lookupByCode(POSTCODES, '1207');
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.matches.length, 1);
  assert.strictEqual(r.matches[0].name, 'Mohammadpur');
});
check('lookupByCode: Bangla digits ১০০০ -> Dhaka GPO', () => {
  const r = lookupByCode(POSTCODES, '১০০০');
  assert.strictEqual(r.matches[0].kind, 'gpo');
});
check('lookupByCode: unknown code 9999 -> ok, 0 matches', () => {
  const r = lookupByCode(POSTCODES, '9999');
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.matches.length, 0);
});
check('lookupByCode: bad format "12" -> error', () => {
  assert.strictEqual(lookupByCode(POSTCODES, '12').ok, false);
});
check('lookupByCode: bad format "abcd" -> error', () => {
  assert.strictEqual(lookupByCode(POSTCODES, 'abcd').ok, false);
});

// --- ranges ---
check('rangeForCode: 1212 -> Dhaka district 1000-1399', () => {
  const r = rangeForCode(CODE_RANGES, '1212');
  assert.strictEqual(r.district, 'Dhaka');
  assert.strictEqual(r.from, 1000);
});
check('rangeForCode: 5400 -> no confirmed range (Rangpur not in range list)', () => {
  assert.strictEqual(rangeForCode(CODE_RANGES, '5400'), null);
});
check('rangeForCode: 4600 -> Bandarban', () => {
  assert.strictEqual(rangeForCode(CODE_RANGES, '4600').district, 'Bandarban');
});
check('rangeForCode: 9999 -> null', () => {
  assert.strictEqual(rangeForCode(CODE_RANGES, '9999'), null);
});

// --- validation + labels ---
check('validateCodeInput: accepts 4 digits, rejects 3/5/letters/empty', () => {
  assert.deepStrictEqual(validateCodeInput('1207'), { ok: true, code: '1207' });
  assert.deepStrictEqual(validateCodeInput('১২০৭'), { ok: true, code: '1207' });
  assert.strictEqual(validateCodeInput('120').ok, false);
  assert.strictEqual(validateCodeInput('12077').ok, false);
  assert.strictEqual(validateCodeInput('abcd').ok, false);
  assert.strictEqual(validateCodeInput('').ok, false);
});
check('kindLabel: en + bn', () => {
  assert.strictEqual(kindLabel('gpo', 'en'), 'General Post Office');
  assert.strictEqual(kindLabel('hq', 'bn'), 'জেলা প্রধান ডাকঘর');
});

// --- favourites ---
check('toggleFav: add then remove', () => {
  assert.deepStrictEqual(toggleFav([], '1207'), ['1207']);
  assert.deepStrictEqual(toggleFav(['1207'], '1207'), []);
  assert.deepStrictEqual(toggleFav(['1000'], '1207'), ['1000', '1207']);
});
check('favourites import: valid file round-trips', () => {
  const text = buildFavouritesExport(['1000', '1207']);
  const r = parseFavouritesImport(text, POSTCODES);
  assert.strictEqual(r.ok, true);
  assert.deepStrictEqual(r.favourites, ['1000', '1207']);
});
check('favourites import: rejects bad json / wrong app / unknown code', () => {
  assert.strictEqual(parseFavouritesImport('not json', POSTCODES).ok, false);
  assert.strictEqual(parseFavouritesImport('{"app":"other","version":1,"favourites":[]}', POSTCODES).ok, false);
  assert.strictEqual(parseFavouritesImport('{"app":"postal-code-bd","version":1,"favourites":["9999"]}', POSTCODES).ok, false);
  assert.strictEqual(parseFavouritesImport('{"app":"postal-code-bd","version":1,"favourites":["120"]}', POSTCODES).ok, false);
});

console.log('\n' + passed + ' tests passed.');
