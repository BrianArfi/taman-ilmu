// Pantau rekursif Taman Ilmu: tiap jalan, catat 1 baris snapshot ke tren.jsonl
// (satu baris per tanggal; jalan ulang di tanggal sama = timpa baris itu),
// lalu cetak delta vs snapshot sebelumnya. Dipanggil tiap siklus -> tren
// kualitas + cakupan data + skor promo tercatat otomatis.
// Pakai: node tools/improve/tren.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const rep = path.resolve(here, 'reports');
const TREN = path.join(rep, 'tren.jsonl');
const tgl = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);

const statics = fs.readdirSync(rep).filter((f) => /^static-\d+\.json$/.test(f)).sort();
const R = JSON.parse(fs.readFileSync(path.join(rep, statics[statics.length - 1]), 'utf8'));
const kelas = (n) => (n >= 85 ? 'A' : n >= 70 ? 'B' : n >= 50 ? 'C' : 'D');
const hit = { A: 0, B: 0, C: 0, D: 0 };
let sum = 0;
for (const g of R.games) { hit[kelas(g.static100)]++; sum += g.static100; }

let cakupan = 0, nStats = 0;
for (const f of fs.readdirSync(rep).filter((x) => /^stats-.*\.json$/.test(x))) {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(rep, f), 'utf8'));
    const pg = raw.perGame || raw.per_game || raw;
    nStats++;
    cakupan = Math.max(cakupan, Object.keys(pg).length);
  } catch (e) { /* abaikan */ }
}
let topPromo = [];
try {
  const p = JSON.parse(fs.readFileSync(path.join(rep, 'promo-20261107.json'), 'utf8'));
  topPromo = p.top.slice(0, 5).map((g) => `${g.id}:${g.skor}`);
} catch (e) { /* promo belum jalan */ }

const snap = { tgl, A: hit.A, B: hit.B, C: hit.C, D: hit.D,
  rerata: Math.round((sum / R.games.length) * 10) / 10,
  berkasStats: nStats, cakupanStats: cakupan, topPromo };
let baris = [];
if (fs.existsSync(TREN)) baris = fs.readFileSync(TREN, 'utf8').split('\n').filter(Boolean);
const lama = baris.map((b) => JSON.parse(b));
const sblm = lama.filter((s) => s.tgl < tgl).pop() || lama[lama.length - 1];
const baru = [...lama.filter((s) => s.tgl !== tgl), snap];
fs.writeFileSync(TREN, baru.map((s) => JSON.stringify(s)).join('\n') + '\n');

console.log(`TREN ${tgl}: A${snap.A} B${snap.B} C${snap.C} D${snap.D} rerata ${snap.rerata} stats ${snap.berkasStats} berkas/${snap.cakupanStats} game`);
if (sblm && sblm.tgl !== tgl) {
  const d = (a, b) => (a - b >= 0 ? '+' : '') + (a - b);
  console.log(`delta vs ${sblm.tgl}: A${d(snap.A, sblm.A)} B${d(snap.B, sblm.B)} C${d(snap.C, sblm.C)} D${d(snap.D, sblm.D)} rerata${d(snap.rerata, sblm.rerata)} cakupan${d(snap.cakupanStats, sblm.cakupanStats)}`);
  const masuk = snap.topPromo.filter((t) => !sblm.topPromo.includes(t));
  const keluar = (sblm.topPromo || []).filter((t) => !snap.topPromo.includes(t));
  if (masuk.length || keluar.length) console.log(`top promo: masuk [${masuk}] keluar [${keluar}]`);
} else console.log('(snapshot pertama / sama hari: belum ada delta)');
console.log(`tersimpan: tools/improve/reports/tren.jsonl (${baru.length} snapshot)`);
