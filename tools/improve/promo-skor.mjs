// Skor promosi Taman Ilmu: game mana paling siap dipromosikan biar makin banyak yang main.
// Sinyal statis (70): sesi pas, hook visual, progresi (bikin balik), ramah gagal, interaktif.
// Sinyal data nyata (30): finish-rate + bintang dari stats-*.json bila ada; tanpa data,
// skor ditulis "sementara" diskala dari statis saja.
// Pakai: node tools/improve/promo-skor.mjs [--top=10]
//   --stats=s.json  gabungkan data nyata per game {gid:{s,f,b}}
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const rep = path.resolve(here, 'reports');
const args = process.argv.slice(2);
const topN = +(args.find((a) => a.startsWith('--top=')) || '--top=10').slice(6);
const statsArg = (args.find((a) => a.startsWith('--stats=')) || '').slice(8);

const statics = fs.readdirSync(rep).filter((f) => /^static-\d+\.json$/.test(f)).sort();
if (!statics.length) { console.error('tidak ada static-*.json, jalankan audit-static dulu'); process.exit(1); }
const R = JSON.parse(fs.readFileSync(path.join(rep, statics[statics.length - 1]), 'utf8'));

let stats = {};
if (statsArg) {
  const raw = JSON.parse(fs.readFileSync(path.resolve(rep, statsArg), 'utf8'));
  stats = raw.perGame || raw.per_game || raw;
}
const adaData = Object.keys(stats).length > 0;

function statis(g) {
  const s = g.sig || {};
  let n = 0;
  const alasan = [];
  if (g.soal == null) { n += 10; alasan.push('sesi tak terhitung (cek manual)'); }
  else if (g.soal >= 3 && g.soal <= 12) { n += 20; } else { alasan.push(`sesi ${g.soal} soal (ideal 3-12)`); }
  if ((s.polish || 0) >= 2) { n += 15; } else { alasan.push('visual datar (tambah partikel/transisi)'); }
  if ((s.ramp || 0) >= 1) { n += 15; } else { alasan.push('tanpa progresi (anak tak balik)'); }
  if ((s.failsoft || 0) >= 1) { n += 10; } else { alasan.push('gagal = frustrasi (tambah Bantu/fail-soft)'); }
  if ((s.aksi || 0) >= 1) { n += 10; } else { alasan.push('kuis murni (tak layak cuplikan video)'); }
  return { n, alasan };
}
function skor(g) {
  const st = statis(g);
  const d = stats[g.id];
  let n = st.n, sementara = true;
  if (d && d.s > 0) {
    sementara = false;
    n += Math.round(20 * Math.min(1, d.f / d.s) + 10 * Math.min(1, (d.b || 0) / 3));
  }
  if (!adaData) n = Math.round((st.n / 70) * 100); // skala sementara ke 100
  return { id: g.id, title: g.title, cat: g.cat, soal: g.soal, static100: g.static100, bytes: g.bytes, skor: adaData ? n : Math.round((st.n / 70) * 100), sementara, alasan: st.alasan, s: d ? d.s : 0, f: d ? d.f : 0 };
}

const semua = R.games.map(skor).sort((a, b) => b.skor - a.skor || b.static100 - a.static100 || b.bytes - a.bytes || a.id.localeCompare(b.id));
console.log(`SKOR PROMOSI (${R.date}, ${adaData ? 'pakai data nyata' : 'SEMENTARA tanpa data nyata'})`);
console.log(`top ${topN} siap dipromosikan:`);
semua.slice(0, topN).forEach((g, i) => {
  const data = adaData ? ` main ${g.s} selesai ${g.f}` : ` fun ${g.static100}`;
  console.log(`${i + 1}. ${g.skor} ${g.id} (${g.cat}, ${g.soal} soal)${data} - ${g.title}`);
});
console.log('\n5 terbawah + cara naik:');
semua.slice(-5).reverse().forEach((g) => {
  console.log(`- ${g.skor} ${g.id}: ${g.alasan.join('; ') || 'ok'}`);
});
// kategori terkuat = arah promosi
const kat = {};
for (const g of semua) { kat[g.cat] = kat[g.cat] || { n: 0, sum: 0 }; kat[g.cat].n++; kat[g.cat].sum += g.skor; }
const arah = Object.entries(kat).map(([k, v]) => ({ k, r: Math.round(v.sum / v.n) })).sort((a, b) => b.r - a.r);
console.log('\narah promosi (rerata skor per kategori): ' + arah.map((a) => `${a.k} ${a.r}`).join(', '));
fs.writeFileSync(path.join(rep, 'promo-20261107.json'), JSON.stringify({ date: R.date, adaData, top: semua.slice(0, topN), bawah: semua.slice(-5) }, null, 1));
console.log('tersimpan: tools/improve/reports/promo-20261107.json');
