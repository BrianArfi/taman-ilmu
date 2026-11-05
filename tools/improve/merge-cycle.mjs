// Gabung 3 sumber bukti jadi skor Fun + backlog. Pakai:
//   node tools/improve/merge-cycle.mjs --ids=a,b,c [--stats=stats.json] [--max=600]
// Menjalankan smoke untuk ids itu, memparse hasilnya, menggabung dengan audit
// statis terbaru + ekspor stats (opsional). Keluar: reports/cycle-DATE.json + backlog.md.
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const outDir = path.join(here, 'reports');
fs.mkdirSync(outDir, { recursive: true });

const args = process.argv.slice(2);
const ids = (args.find((a) => a.startsWith('--ids=')) || '').slice(6).split(',').filter(Boolean);
const statsPath = (args.find((a) => a.startsWith('--stats=')) || '').slice(8);
const maxArg = args.find((a) => a.startsWith('--max=')) || '--max=600';
if (!ids.length) { console.error('isi --ids=a,b,c'); process.exit(2); }

const statics = fs.readdirSync(outDir).filter((f) => f.startsWith('static-') && f.endsWith('.json')).sort();
if (!statics.length) { console.error('jalan dulu: node tools/improve/audit-static.mjs'); process.exit(2); }
const S = JSON.parse(fs.readFileSync(path.join(outDir, statics.at(-1)), 'utf8'));
const byId = Object.fromEntries(S.games.map((g) => [g.id, g]));

let stats = null;
if (statsPath) {
  try { stats = JSON.parse(fs.readFileSync(statsPath, 'utf8')).perGame || {}; }
  catch { console.error('stats tidak terbaca, lanjut tanpa engagement'); stats = null; }
}

function runSmoke() {
  return new Promise((resolve) => {
    execFile('node', ['tools/smoke.mjs', ...ids, '--phone', maxArg, '--time=150'],
      { cwd: root, maxBuffer: 8 * 1024 * 1024 }, (err, stdout) => resolve(stdout || ''));
  });
}

const out = await runSmoke();
const dyn = {}; // id -> {plays, finished, actions[], errors, overflow, escHome}
for (const line of out.split('\n')) {
  const m = line.match(/^(OK|FAIL)\s+(\S+)\s+(\S+)\s+finished=(\S+)\s+actions=(\d+)\s+\S+\s+overflowX=(-?\d+)\s+escHome=(\S+)/);
  if (!m) continue;
  const [, , id, , fin, act, ovf, esc] = m;
  (dyn[id] = dyn[id] || { plays: 0, finished: 0, actions: [], overflow: 0, escFail: 0, errors: 0 });
  const d = dyn[id];
  d.plays++; if (fin === 'true') d.finished++;
  d.actions.push(+act); if (+ovf > 1) d.overflow++; if (esc !== 'true') d.escFail++;
}
for (const line of out.split('\n')) {
  if (/^       \S/.test(line)) {
    // baris error milik hasil terakhir di atasnya; sederhanakan: hitung per kata kunci game
    for (const id of ids) if (line.includes(id) && dyn[id]) dyn[id].errors++;
  }
}

const d = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10).replaceAll('-', '');
const rows = ids.map((id) => {
  const st = byId[id] || { static100: 0, sug: ['tidak ada di audit statis'], title: id, cat: '?', file: '?' };
  const dd = dyn[id] || { plays: 0, finished: 0, actions: [], overflow: 0, escFail: 0, errors: 0 };
  const finRate = dd.plays ? dd.finished / dd.plays : 0;
  const avgAct = dd.actions.length ? dd.actions.reduce((a, b) => a + b, 0) / dd.actions.length : 999;
  const dyn100 = Math.round(100 * (0.6 * finRate + 0.2 * (dd.plays && !dd.overflow ? 1 : 0)
    + 0.1 * (dd.plays && !dd.escFail ? 1 : 0) + 0.1 * Math.max(0, 1 - avgAct / 600)));
  let eng100 = null;
  const g = stats && stats[id];
  if (g && g.s > 0) eng100 = Math.round(100 * (0.7 * Math.min(1, g.f / g.s) + 0.3 * Math.min(1, (g.b || 0) / 3)));
  const fun = eng100 === null
    ? Math.round(0.55 * st.static100 + 0.45 * dyn100)
    : Math.round(0.45 * st.static100 + 0.35 * dyn100 + 0.20 * eng100);
  const cls = fun >= 85 ? 'A' : fun >= 70 ? 'B' : fun >= 50 ? 'C' : 'D';
  return { id, title: st.title, cat: st.cat, file: st.file, static100: st.static100, dyn100,
    plays: dd.plays, finished: dd.finished, avgActions: Math.round(avgAct),
    overflow: dd.overflow, escFail: dd.escFail, eng100, fun, cls, sug: st.sug };
}).sort((a, b) => a.fun - b.fun);

fs.writeFileSync(path.join(outDir, `cycle-${d}.json`), JSON.stringify({ date: d, version: 'improve-v1.0', rows }, null, 1));

let md = `# Backlog improvement Taman Ilmu (siklus ${d})\n\nDiurut dari skor Fun terbawah. Skor = statis + smoke + engagement anak.\n`
  + `Kelas: A 85+, B 70-84, C 50-69, D <50. Gerbang: smoke OK, skor tidak turun, SPEC 3-4, ustadz untuk teks agama, push hanya dengan "gas".\n\n`;
for (const r of rows) {
  md += `## ${r.cls} ${r.fun} — ${r.title} (\`${r.id}\`, ${r.cat})\n`
    + `- Bukti: statis ${r.static100} · smoke ${r.dyn100} (selesai ${r.finished}/${r.plays}, rerata ${r.avgActions} aksi)`
    + (r.eng100 === null ? ' · engagement: belum ada data\n' : ` · engagement ${r.eng100}\n`)
    + r.sug.map((s) => `- Saran: ${s}\n`).join('') + '\n';
}
fs.writeFileSync(path.join(outDir, 'backlog.md'), md);
console.log(md);
console.log(`tersimpan: tools/improve/reports/cycle-${d}.json + backlog.md`);
