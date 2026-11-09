# Postal Code BD

An offline, bilingual (English / বাংলা) Bangladesh postcode finder. Find the 4-digit postcode of any district head office or Dhaka city area post office — search by place, district, or code, or type a code to reverse-lookup the post office.

**Status:** MVP complete. Unit tests 38/38 green, headless-Chrome smoke tests 30/30 green, zero console/page errors (desktop 1440px + mobile 390px).

**Live demo:** https://fahad3235.github.io/postal-code-bd/ (GitHub Pages)

## Problem

Every official form, courier booking, and parcel in Bangladesh asks for a 4-digit postcode, and the right code depends on the exact post office — not just the district. Existing postcode lists live on ad-heavy pages or need the internet. This app puts the district head offices and Dhaka city areas in one searchable, offline, bilingual list that works from a phone on the field.

## Features

1. **Search** — multi-word AND search across English name, Bangla name, district, division, and code; Bangla text and Bangla digits work too (e.g. `গুলশান`, `১২০৭`).
2. **Reverse lookup** — type any 4-digit code to find its post office, plus a district code-range hint (e.g. `1207` → Mohammadpur, inside Dhaka district's 1000–1399 block).
3. **Division filters** — 8 division chips with counts, plus a post-office type filter (General Post Office / Head Office / District Head Office / Area Post Office).
4. **Favourites** — star any post office; favourites persist in localStorage, with a favourites-only view.
5. **Detail modal** — tap any card for the full record (code, district, division, type) with copy-to-clipboard.
6. **Postcode ranges reference** — 14 Wikipedia-confirmed district code blocks (e.g. 4000–4399 Chattogram, 9000–9299 Khulna).
7. **Data tools** — export/import favourites as JSON (strict format check) and typed-`DELETE` erase-all.
8. **Bilingual** — EN/বাংলা toggle persisted across reloads, Bengali digits in Bangla mode; 390px mobile layout, zero network requests.

## Data

92 entries: all 64 district head offices (including the five General Post Offices — Dhaka 1000, Metropolitan Dhaka 1100, Chattogram 4000, Rajshahi 6000, Khulna 9000) plus 23 Dhaka city area post offices.

Sources (checked 2026-11-09):

- District codes: bdtradeinfo.com/post-codes-of-bangladesh (district list, 2026-11-09)
- Cross-check: mediabangladesh.net/post-office-bangladesh-post-code-districts/ (Bangladesh Post records, reviewed 28 July 2026)
- Sylhet 3100: confirmed by bangladeshpost.net and goroli.com (bdtradeinfo's district list omits Sylhet)
- Code ranges: Wikipedia — "List of postal codes in Bangladesh"

This is a reference subset, not the full national list of post offices. The app and footer say so plainly, and users are told to verify a code with Bangladesh Post before using it on an official form or parcel.

## Stack

- Vanilla HTML + CSS + JavaScript, no build step, no dependencies
- `data.js` — the 92-entry dataset (UMD: works in the browser and under Node)
- `logic.js` — pure search / lookup / filter / range / favourites logic
- `i18n.js` — English + Bangla strings
- `app.js` — DOM wiring and localStorage
- `test.js` — Node unit tests

## Prerequisites

Any modern browser. For tests: Node.js 18+.

## Install

```bash
git clone https://github.com/fahad3235/postal-code-bd.git
cd postal-code-bd
```

No install step — open `index.html` directly, or serve it:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Dev commands

```bash
node test.js          # 38 unit tests (logic + dataset integrity)
node /tmp/smoke-postal.mjs   # headless-Chrome smoke tests (desktop + mobile)
```

## Testing

- `node test.js` — 38/38: dataset integrity (92 entries, 64 districts, unique 4-digit codes, EN+Bangla names, GPO codes, division counts), digit conversion, search (English/Bangla/multi-word/case-insensitive), division + kind filters, reverse lookup (incl. Bangla digits and bad formats), code ranges, validation, favourites toggle + strict import.
- Headless-Chrome smoke (raw CDP, `headless_shell-1187`, `file://`) — 30/30 across desktop 1440×900 and mobile 390×844: 92 cards, 9 chips, 14 range rows, search (EN + Bangla), division filter, reverse lookup + error state, favourite + favourites-only, modal, language toggle + persistence, no horizontal overflow, zero console/page errors.

## Deployment

Static site — any static host works. GitHub Pages: enable Pages on the `main` branch, root folder.

## Limitations

- Reference subset only: district head offices + Dhaka city areas. Upazila and union post offices are not included; the full national list has far more offices.
- Code ranges cover only the 14 district blocks confirmed by Wikipedia; a code outside those ranges still reverse-looks-up fine if it is in the dataset.
- Favourites live in the browser's localStorage on one device; export/import JSON to move them.

## Status

MVP complete and verified 2026-11-09. No user data ships with the app; favourites are stored only on the user's own device.
