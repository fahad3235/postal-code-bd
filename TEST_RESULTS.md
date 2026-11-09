# TEST_RESULTS.md — postal-code-bd (run #285, 15:00 slot, 2026-11-09)

## Unit tests — 38/38 passed

`node test.js` — 2026-11-09 ~15:25 +06. All assertions real, none invented.

- Dataset integrity: 92 entries; 64 distinct districts; 8 divisions; every code a unique 4-digit string; every entry has an English and a Bangla name; GPO codes 1000/4000/6000/9000 (+1100 Metropolitan Dhaka); 23 Dhaka city area entries; Sylhet 3100 present; division counts sum to 92 (Dhaka 37, Chattogram 12, Khulna 11, Rajshahi 10, Barishal 6, Sylhet 4, Rangpur 8, Mymensingh 4).
- Digits: 1207 ↔ ১২০৭ both directions; non-digits untouched.
- Search: "gulshan" → Gulshan 1212; Bangla "গুলশান" → 1; "1207" → Mohammadpur; Bangla digits "১২০৭" → Mohammadpur; multi-word AND "dhaka gulshan" → 1; "khulna" → 11 (whole division); empty → 92; no match → 0; case-insensitive "SYLHET" → 4.
- Filters: Sylhet division → 4; All → 92; kind area → 23, gpo → 4.
- Reverse lookup: 1207 → Mohammadpur; Bangla digits ১০০০ → Dhaka GPO; unknown 9999 → ok, 0 matches; bad formats "12"/"abcd" → error.
- Ranges: 1212 → Dhaka 1000–1399; 4600 → Bandarban; 5400/9999 → null (not in the 14 confirmed ranges).
- Validation: accepts 4 digits (incl. Bangla digits); rejects 3/5 digits, letters, empty. kindLabel EN + BN correct.
- Favourites: toggle add/remove; export/import round-trips; rejects bad JSON, wrong app, unknown code, short code.

### Fixes during testing (test expectations, not app bugs)

- First run: 32/38 — my hand-count said 91 entries / Dhaka 38; the real dataset is 92 entries / Dhaka 37 (14 HQ/GPO/HO rows + 23 areas). Also "khulna" matches all 11 Khulna-division entries (division is in the search text) and "SYLHET" matches all 4 Sylhet-division entries, not 1. Corrected the expectations and the i18n "91 entries" copy to 92; re-ran 38/38.

## Headless-Chrome smoke tests — 30/30 passed

Raw CDP against `file://` (`headless_shell-1187`), `/tmp/smoke-postal.mjs` — 2026-11-09 ~15:30 +06. Desktop 1440×900 and mobile 390×844, 15 checks each:

- Title loads; 92 cards render; 9 division chips (All + 8); ranges table has 14 rows.
- Search "gulshan" → 1 card, code 1212; Bangla search "গুলশান" → 1 card.
- Sylhet chip → 4 cards.
- Reverse lookup 1207 finds Mohammadpur + Dhaka range hint; lookup "12" shows inline error.
- Favourite + favourites-only → 1 card.
- Card click opens modal with a 4-digit code.
- Bangla toggle switches title (পোস্টাল) + Bengali digits; language persists across reload.
- No horizontal overflow at either viewport.
- Zero console/page errors at either viewport.
