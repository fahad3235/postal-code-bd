/* postal-code-bd — dataset of Bangladesh post offices.
 * Sources (checked 2026-11-09):
 *  - District head-office codes: bdtradeinfo.com/post-codes-of-bangladesh
 *    (district list, published 2026-11-09), cross-checked against
 *    mediabangladesh.net/post-office-bangladesh-post-code-districts/
 *    (reviewed 28 July 2026, primary source Bangladesh Post) and
 *    en.wikipedia.org/wiki/List_of_postal_codes_in_Bangladesh.
 *  - Sylhet 3100: confirmed by bangladeshpost.net + goroli.com
 *    (bdtradeinfo district list omits Sylhet).
 *  - Dhaka-area codes: bdtradeinfo.com (same page), cross-checked
 *    against mediabangladesh.net (Mohammadpur 1207, Gulshan 1212,
 *    Jigatola 1209, New Market 1205, Wari 1203, Gandaria 1204).
 *  - Code ranges: Wikipedia "List of postal codes in Bangladesh".
 * Each entry: name (EN), bn (Bangla), code (4-digit string),
 * district, division, kind: 'gpo' | 'ho' | 'hq' | 'area'.
 * 'hq' = district head office; 'gpo' = General Post Office;
 * 'ho' = Head Office; 'area' = Dhaka city area post office.
 * This is a reference subset (district HQs + Dhaka areas), NOT the
 * full ~1,500-office national list. The UI says so plainly.
 */
'use strict';

const POSTCODES = [
  // ---- Dhaka division ----
  { name: 'Dhaka GPO', bn: 'ঢাকা জিপিও', code: '1000', district: 'Dhaka', division: 'Dhaka', kind: 'gpo' },
  { name: 'Dhaka Head Office', bn: 'ঢাকা প্রধান ডাকঘর', code: '1100', district: 'Dhaka', division: 'Dhaka', kind: 'ho' },
  { name: 'Faridpur', bn: 'ফরিদপুর', code: '7800', district: 'Faridpur', division: 'Dhaka', kind: 'hq' },
  { name: 'Gazipur', bn: 'গাজীপুর', code: '1700', district: 'Gazipur', division: 'Dhaka', kind: 'hq' },
  { name: 'Gopalganj', bn: 'গোপালগঞ্জ', code: '8100', district: 'Gopalganj', division: 'Dhaka', kind: 'hq' },
  { name: 'Kishoreganj', bn: 'কিশোরগঞ্জ', code: '2300', district: 'Kishoreganj', division: 'Dhaka', kind: 'hq' },
  { name: 'Madaripur', bn: 'মাদারীপুর', code: '7900', district: 'Madaripur', division: 'Dhaka', kind: 'hq' },
  { name: 'Manikganj', bn: 'মানিকগঞ্জ', code: '1800', district: 'Manikganj', division: 'Dhaka', kind: 'hq' },
  { name: 'Munshiganj', bn: 'মুন্সিগঞ্জ', code: '1500', district: 'Munshiganj', division: 'Dhaka', kind: 'hq' },
  { name: 'Narayanganj', bn: 'নারায়ণগঞ্জ', code: '1400', district: 'Narayanganj', division: 'Dhaka', kind: 'hq' },
  { name: 'Narsingdi', bn: 'নরসিংদী', code: '1600', district: 'Narsingdi', division: 'Dhaka', kind: 'hq' },
  { name: 'Rajbari', bn: 'রাজবাড়ী', code: '7700', district: 'Rajbari', division: 'Dhaka', kind: 'hq' },
  { name: 'Shariatpur', bn: 'শরীয়তপুর', code: '8000', district: 'Shariatpur', division: 'Dhaka', kind: 'hq' },
  { name: 'Tangail', bn: 'টাঙ্গাইল', code: '1900', district: 'Tangail', division: 'Dhaka', kind: 'hq' },
  // ---- Dhaka city areas ----
  { name: 'Banani', bn: 'বনানী', code: '1213', district: 'Dhaka', division: 'Dhaka', kind: 'area' },
  { name: 'Banga Bhaban', bn: 'বঙ্গভবন', code: '1222', district: 'Dhaka', division: 'Dhaka', kind: 'area' },
  { name: 'Bashabo', bn: 'বাসাবো', code: '1214', district: 'Dhaka', division: 'Dhaka', kind: 'area' },
  { name: 'Dhaka Cantonment', bn: 'ঢাকা ক্যান্টনমেন্ট', code: '1206', district: 'Dhaka', division: 'Dhaka', kind: 'area' },
  { name: 'Dhaka Polytechnic', bn: 'ঢাকা পলিটেকনিক', code: '1208', district: 'Dhaka', division: 'Dhaka', kind: 'area' },
  { name: 'Dhania', bn: 'ধনিয়া', code: '1236', district: 'Dhaka', division: 'Dhaka', kind: 'area' },
  { name: 'Dilkusha', bn: 'দিলকুশা', code: '1223', district: 'Dhaka', division: 'Dhaka', kind: 'area' },
  { name: 'Gandaria', bn: 'গেন্ডারিয়া', code: '1204', district: 'Dhaka', division: 'Dhaka', kind: 'area' },
  { name: 'Gulshan', bn: 'গুলশান', code: '1212', district: 'Dhaka', division: 'Dhaka', kind: 'area' },
  { name: 'Jhigatola', bn: 'ঝিগাতলা', code: '1209', district: 'Dhaka', division: 'Dhaka', kind: 'area' },
  { name: 'Khilgaon', bn: 'খিলগাঁও', code: '1219', district: 'Dhaka', division: 'Dhaka', kind: 'area' },
  { name: 'Khilkhet', bn: 'খিলক্ষেত', code: '1229', district: 'Dhaka', division: 'Dhaka', kind: 'area' },
  { name: 'Mirpur Bazar', bn: 'মিরপুর বাজার', code: '1218', district: 'Dhaka', division: 'Dhaka', kind: 'area' },
  { name: 'Mirpur Section-1', bn: 'মিরপুর সেকশন-১', code: '1216', district: 'Dhaka', division: 'Dhaka', kind: 'area' },
  { name: 'Mirpur Section-2', bn: 'মিরপুর সেকশন-২', code: '1221', district: 'Dhaka', division: 'Dhaka', kind: 'area' },
  { name: 'Mohammadpur', bn: 'মোহাম্মদপুর', code: '1207', district: 'Dhaka', division: 'Dhaka', kind: 'area' },
  { name: 'New Market', bn: 'নিউ মার্কেট', code: '1205', district: 'Dhaka', division: 'Dhaka', kind: 'area' },
  { name: 'Posta', bn: 'পোস্তা', code: '1211', district: 'Dhaka', division: 'Dhaka', kind: 'area' },
  { name: 'Sangsad Bhaban', bn: 'সংসদ ভবন', code: '1225', district: 'Dhaka', division: 'Dhaka', kind: 'area' },
  { name: 'Shantinagar', bn: 'শান্তিনগর', code: '1217', district: 'Dhaka', division: 'Dhaka', kind: 'area' },
  { name: 'Tejgaon', bn: 'তেজগাঁও', code: '1215', district: 'Dhaka', division: 'Dhaka', kind: 'area' },
  { name: 'Uttara', bn: 'উত্তরা', code: '1230', district: 'Dhaka', division: 'Dhaka', kind: 'area' },
  { name: 'Wari', bn: 'ওয়ারী', code: '1203', district: 'Dhaka', division: 'Dhaka', kind: 'area' },
  // ---- Chattogram division ----
  { name: 'Bandarban', bn: 'বান্দরবান', code: '4600', district: 'Bandarban', division: 'Chattogram', kind: 'hq' },
  { name: 'Brahmanbaria', bn: 'ব্রাহ্মণবাড়িয়া', code: '3400', district: 'Brahmanbaria', division: 'Chattogram', kind: 'hq' },
  { name: 'Chandpur', bn: 'চাঁদপুর', code: '3600', district: 'Chandpur', division: 'Chattogram', kind: 'hq' },
  { name: 'Chattogram GPO', bn: 'চট্টগ্রাম জিপিও', code: '4000', district: 'Chattogram', division: 'Chattogram', kind: 'gpo' },
  { name: 'Chattogram Head Office', bn: 'চট্টগ্রাম প্রধান ডাকঘর', code: '4100', district: 'Chattogram', division: 'Chattogram', kind: 'ho' },
  { name: 'Cumilla', bn: 'কুমিল্লা', code: '3500', district: 'Cumilla', division: 'Chattogram', kind: 'hq' },
  { name: "Cox's Bazar", bn: 'কক্সবাজার', code: '4700', district: "Cox's Bazar", division: 'Chattogram', kind: 'hq' },
  { name: 'Feni', bn: 'ফেনী', code: '3900', district: 'Feni', division: 'Chattogram', kind: 'hq' },
  { name: 'Khagrachhari', bn: 'খাগড়াছড়ি', code: '4400', district: 'Khagrachhari', division: 'Chattogram', kind: 'hq' },
  { name: 'Lakshmipur', bn: 'লক্ষ্মীপুর', code: '3700', district: 'Lakshmipur', division: 'Chattogram', kind: 'hq' },
  { name: 'Noakhali', bn: 'নোয়াখালী', code: '3800', district: 'Noakhali', division: 'Chattogram', kind: 'hq' },
  { name: 'Rangamati', bn: 'রাঙ্গামাটি', code: '4500', district: 'Rangamati', division: 'Chattogram', kind: 'hq' },
  // ---- Khulna division ----
  { name: 'Bagerhat', bn: 'বাগেরহাট', code: '9300', district: 'Bagerhat', division: 'Khulna', kind: 'hq' },
  { name: 'Chuadanga', bn: 'চুয়াডাঙ্গা', code: '7200', district: 'Chuadanga', division: 'Khulna', kind: 'hq' },
  { name: 'Jashore', bn: 'যশোর', code: '7400', district: 'Jashore', division: 'Khulna', kind: 'hq' },
  { name: 'Jhenaidah', bn: 'ঝিনাইদহ', code: '7300', district: 'Jhenaidah', division: 'Khulna', kind: 'hq' },
  { name: 'Khulna GPO', bn: 'খুলনা জিপিও', code: '9000', district: 'Khulna', division: 'Khulna', kind: 'gpo' },
  { name: 'Khulna Head Office', bn: 'খুলনা প্রধান ডাকঘর', code: '9100', district: 'Khulna', division: 'Khulna', kind: 'ho' },
  { name: 'Kushtia', bn: 'কুষ্টিয়া', code: '7000', district: 'Kushtia', division: 'Khulna', kind: 'hq' },
  { name: 'Magura', bn: 'মাগুরা', code: '7600', district: 'Magura', division: 'Khulna', kind: 'hq' },
  { name: 'Meherpur', bn: 'মেহেরপুর', code: '7100', district: 'Meherpur', division: 'Khulna', kind: 'hq' },
  { name: 'Narail', bn: 'নড়াইল', code: '7500', district: 'Narail', division: 'Khulna', kind: 'hq' },
  { name: 'Satkhira', bn: 'সাতক্ষীরা', code: '9400', district: 'Satkhira', division: 'Khulna', kind: 'hq' },
  // ---- Rajshahi division ----
  { name: 'Bogura', bn: 'বগুড়া', code: '5800', district: 'Bogura', division: 'Rajshahi', kind: 'hq' },
  { name: 'Chapai Nawabganj', bn: 'চাঁপাইনবাবগঞ্জ', code: '6300', district: 'Chapai Nawabganj', division: 'Rajshahi', kind: 'hq' },
  { name: 'Ghoramara', bn: 'ঘোড়ামারা', code: '6100', district: 'Rajshahi', division: 'Rajshahi', kind: 'hq' },
  { name: 'Joypurhat', bn: 'জয়পুরহাট', code: '5900', district: 'Joypurhat', division: 'Rajshahi', kind: 'hq' },
  { name: 'Naogaon', bn: 'নওগাঁ', code: '6500', district: 'Naogaon', division: 'Rajshahi', kind: 'hq' },
  { name: 'Natore', bn: 'নাটোর', code: '6400', district: 'Natore', division: 'Rajshahi', kind: 'hq' },
  { name: 'Pabna', bn: 'পাবনা', code: '6600', district: 'Pabna', division: 'Rajshahi', kind: 'hq' },
  { name: 'Rajshahi GPO', bn: 'রাজশাহী জিপিও', code: '6000', district: 'Rajshahi', division: 'Rajshahi', kind: 'gpo' },
  { name: 'Rajshahi City', bn: 'রাজশাহী শহর', code: '6200', district: 'Rajshahi', division: 'Rajshahi', kind: 'hq' },
  { name: 'Sirajganj', bn: 'সিরাজগঞ্জ', code: '6700', district: 'Sirajganj', division: 'Rajshahi', kind: 'hq' },
  // ---- Barishal division ----
  { name: 'Barguna', bn: 'বরগুনা', code: '8700', district: 'Barguna', division: 'Barishal', kind: 'hq' },
  { name: 'Barishal', bn: 'বরিশাল', code: '8200', district: 'Barishal', division: 'Barishal', kind: 'hq' },
  { name: 'Bhola', bn: 'ভোলা', code: '8300', district: 'Bhola', division: 'Barishal', kind: 'hq' },
  { name: 'Jhalokathi', bn: 'ঝালকাঠি', code: '8400', district: 'Jhalokathi', division: 'Barishal', kind: 'hq' },
  { name: 'Patuakhali', bn: 'পটুয়াখালী', code: '8600', district: 'Patuakhali', division: 'Barishal', kind: 'hq' },
  { name: 'Pirojpur', bn: 'পিরোজপুর', code: '8500', district: 'Pirojpur', division: 'Barishal', kind: 'hq' },
  // ---- Sylhet division ----
  { name: 'Habiganj', bn: 'হবিগঞ্জ', code: '3300', district: 'Habiganj', division: 'Sylhet', kind: 'hq' },
  { name: 'Moulvibazar', bn: 'মৌলভীবাজার', code: '3200', district: 'Moulvibazar', division: 'Sylhet', kind: 'hq' },
  { name: 'Sunamganj', bn: 'সুনামগঞ্জ', code: '3000', district: 'Sunamganj', division: 'Sylhet', kind: 'hq' },
  { name: 'Sylhet', bn: 'সিলেট', code: '3100', district: 'Sylhet', division: 'Sylhet', kind: 'hq' },
  // ---- Rangpur division ----
  { name: 'Dinajpur', bn: 'দিনাজপুর', code: '5200', district: 'Dinajpur', division: 'Rangpur', kind: 'hq' },
  { name: 'Gaibandha', bn: 'গাইবান্ধা', code: '5700', district: 'Gaibandha', division: 'Rangpur', kind: 'hq' },
  { name: 'Kurigram', bn: 'কুড়িগ্রাম', code: '5600', district: 'Kurigram', division: 'Rangpur', kind: 'hq' },
  { name: 'Lalmonirhat', bn: 'লালমনিরহাট', code: '5500', district: 'Lalmonirhat', division: 'Rangpur', kind: 'hq' },
  { name: 'Nilphamari', bn: 'নীলফামারী', code: '5300', district: 'Nilphamari', division: 'Rangpur', kind: 'hq' },
  { name: 'Panchagarh', bn: 'পঞ্চগড়', code: '5000', district: 'Panchagarh', division: 'Rangpur', kind: 'hq' },
  { name: 'Rangpur', bn: 'রংপুর', code: '5400', district: 'Rangpur', division: 'Rangpur', kind: 'hq' },
  { name: 'Thakurgaon', bn: 'ঠাকুরগাঁও', code: '5100', district: 'Thakurgaon', division: 'Rangpur', kind: 'hq' },
  // ---- Mymensingh division ----
  { name: 'Jamalpur', bn: 'জামালপুর', code: '2000', district: 'Jamalpur', division: 'Mymensingh', kind: 'hq' },
  { name: 'Mymensingh', bn: 'ময়মনসিংহ', code: '2200', district: 'Mymensingh', division: 'Mymensingh', kind: 'hq' },
  { name: 'Netrokona', bn: 'নেত্রকোণা', code: '2400', district: 'Netrokona', division: 'Mymensingh', kind: 'hq' },
  { name: 'Sherpur', bn: 'শেরপুর', code: '2100', district: 'Sherpur', division: 'Mymensingh', kind: 'hq' }
];

/* Postcode ranges confirmed by Wikipedia
 * ("List of postal codes in Bangladesh"): district code blocks. */
const CODE_RANGES = [
  { from: 1000, to: 1399, district: 'Dhaka', division: 'Dhaka' },
  { from: 1400, to: 1499, district: 'Narayanganj', division: 'Dhaka' },
  { from: 1900, to: 1999, district: 'Tangail', division: 'Dhaka' },
  { from: 2000, to: 2099, district: 'Jamalpur', division: 'Mymensingh' },
  { from: 3000, to: 3099, district: 'Sunamganj', division: 'Sylhet' },
  { from: 4000, to: 4399, district: 'Chattogram', division: 'Chattogram' },
  { from: 4400, to: 4499, district: 'Khagrachhari', division: 'Chattogram' },
  { from: 4500, to: 4599, district: 'Rangamati', division: 'Chattogram' },
  { from: 4600, to: 4699, district: 'Bandarban', division: 'Chattogram' },
  { from: 4700, to: 4799, district: "Cox's Bazar", division: 'Chattogram' },
  { from: 5000, to: 5099, district: 'Panchagarh', division: 'Rangpur' },
  { from: 6000, to: 6299, district: 'Rajshahi', division: 'Rajshahi' },
  { from: 7000, to: 7099, district: 'Kushtia', division: 'Khulna' },
  { from: 9000, to: 9299, district: 'Khulna', division: 'Khulna' }
];

const DIVISIONS = ['Dhaka', 'Chattogram', 'Khulna', 'Rajshahi', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { POSTCODES, CODE_RANGES, DIVISIONS };
}
if (typeof window !== 'undefined') {
  window.POSTCODES = POSTCODES;
  window.CODE_RANGES = CODE_RANGES;
  window.DIVISIONS = DIVISIONS;
}
