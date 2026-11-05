// Audit statis Taman Ilmu: nilai sinyal "seru" (SPEC 7.1) dari kode tiap game.
// Tanpa browser. Pakai: node tools/improve/audit-static.mjs [--json]
// Keluar: tools/improve/reports/static-YYYYMMDD.json + tabel skor di console.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const gamesDir = path.join(root, 'games');
const outDir = path.join(here, 'reports');
fs.mkdirSync(outDir, { recursive: true });

const has = (src, re) => re.test(src);
const count = (src, re) => (src.match(re) || []).length;

function audit(file) {
  const src = fs.readFileSync(path.join(gamesDir, file), 'utf8');
  const ri = src.indexOf('TI.register(');
  const rs = src.indexOf('start(ctx)', ri);
  const reg = src.slice(ri, rs > ri ? rs : ri + 350);
  const id = (reg.match(/id:\s*'([^']+)'/) || [])[1] || file.replace(/^\d+-|\.js$/g, '');
  const title = (reg.match(/title:\s*'([^']+)'/) || [])[1] || id;
  const cat = (reg.match(/cat:\s*'([^']+)'/) || [])[1] || '?';
  const sug = [];
  const sig = {};

  // 1. Aksi inti (bukan kuis murni): loop/place/order/sort/canvas/drag/slider/keyboard
  const aksiHits = ['ctx.loop', 'ctx.place', 'ctx.order', 'ctx.sort', '<canvas',
    'pointerdown', 'pointermove', 'ti-slider', 'type=range', 'keydown', 'ctx.every',
    "h('button'", 'h("button"']
    .filter((k) => src.includes(k));
  const onlyChoose = src.includes('ctx.choose') && aksiHits.length === 0;
  sig.aksi = aksiHits.length >= 2 ? 2 : aksiHits.length === 1 ? 1 : 0;
  if (onlyChoose) sug.push('kuis murni: selipkan aksi (tangkap/seret/susun/pecah) di sela soal');
  if (sig.aksi === 1) sug.push('tambah variasi aksi kedua biar tidak monoton');

  // 2. Umpan balik tiap aksi berhasil: sfx, partikel, +1, memantul/goyang
  // (ctx.correct/wrong ikut dihitung: keduanya membunyikan sfx + visual.)
  const sfxN = count(src, /ctx\.sfx\(/g) + count(src, /ctx\.correct\(/g) + count(src, /ctx\.wrong\(/g);
  const fbHits = ['partikel', 'particle', '+1', 'pop-in', 'memantul',
    'goyang', 'shake', 'confetti', 'melompat', 'berdenyut', 'pulse', 'percikan',
    'ctx.correct', 'ctx.wrong'].filter((k) => src.includes(k));
  sig.feedback = (sfxN >= 3 ? 1 : 0) + (fbHits.length >= 2 ? 1 : 0);
  if (sfxN < 3) sug.push(`sfx cuma ${sfxN}x: bunyikan tiap aksi berhasil/gagal`);
  if (fbHits.length < 2) sug.push('tambah umpan balik visual (partikel/+1/pantul) tiap aksi berhasil');

  // 3. Tanjakan sulit dalam satu sesi: babak/level berparameter beda
  const stages = count(src, /babak|ronde|tahap|stage|level|Level/gi);
  const rampParam = has(src, /kecepatan|speed|waktu.*-|maksimal.*\+|jumlah.*\+|durasi|level.*\+|\+.*level|naik/i);
  // Urutan sengaja digampangin dulu: sort komparator atau array ronde menanjak.
  const ordered = /\.sort\(\(\s*a\s*,\s*b\s*\)\s*=>\s*a\b/.test(src) || [...src.matchAll(/\b\w*(ronde|babak|tahap|nobj|nObj|jumlah)\w*\s*=\s*(\[[^\]]+\])/gi)]
    .some((m) => { const ns = m[2].split(',').map((x) => parseInt(x, 10)).filter((n) => Number.isFinite(n)); return ns.length >= 2 && ns.every((n, i) => i === 0 || n > ns[i - 1]); });
  const seriesLike = has(src, /ctx\.series|ctx\.progress|ronde|babak/i);
  sig.ramp = ((stages >= 3 && rampParam) || (ordered && seriesLike)) ? 2 : (stages >= 3 || rampParam || ordered) ? 1 : 0;
  if (sig.ramp < 2) sug.push('naikkan kesulitan di dalam sesi (babak awal gampang, akhir menantang)');

  // 4. Fail-soft: tombol Bantu / pola 3x gagal lalu tunjukkan cara benar
  const bantu = has(src, /Bantu|ti-help|💡/);
  const gagal3 = has(src, /(gagal|salah|bantu|miss).{0,12}3|attempt|kesempatan|tunjuk|cara benar|jawaban benar.{0,30}lanjut/i);
  sig.failsoft = (bantu ? 1 : 0) + (gagal3 ? 1 : 0);
  // Puzzle = dilihat dari judul/deskripsi register, bukan kata di komentar kode.
  const isPuzzle = /puzzle|labirin|susun|teka|kode|hanoi|parkir|kabel|tangram|geser|sudoku/i.test(reg);
  // Primitif guided-retry (tidak bisa macet): pilih/susun/pilah/pasang selalu bisa selesai.
  if (has(src, /ctx\.choose|ctx\.sort|ctx\.order|ctx\.place/)) sig.failsoft = Math.min(2, sig.failsoft + 1);
  if (!isPuzzle && has(src, /retry|coba lagi|main lagi|ulangi|ulang\b/i)) sig.failsoft = Math.min(2, sig.failsoft + 1);
  if (isPuzzle && !bantu) sug.push('game puzzle wajib punya tombol Bantu (SPEC 7.1)');
  if (!gagal3) sug.push('setelah 3x gagal di satu tantangan: tunjukkan cara benar lalu lanjut');

  // 5. Sesi 6-10 soal / 2-4 mnt: perkirakan dari angka sample/jumlah/loop
  const struct = [...src.matchAll(/sample\(.*,\s*(\d+)\s*\)|jumlah\s*=\s*[^;]*?(\d+)|slice\(0,\s*(\d+)\)/gi)]
    .map((m) => +(m[1] || m[2] || m[3])).filter((n) => n > 0 && n <= 30);
  const textN = [...src.matchAll(/(\d+)\s*soal/gi)].map((m) => +m[1]).filter((n) => n > 1 && n <= 30);
  const nums = struct.length ? struct : textN;
  const soal = nums.length ? Math.max(...nums) : null;
  sig.sesi = soal === null ? 1 : (soal >= 6 && soal <= 10 ? 2 : soal >= 3 && soal <= 12 ? 1 : 0);
  if (soal !== null && (soal < 3 || soal > 12)) sug.push(`sesi ${soal} soal: ideal 6-10 soal (2-4 menit)`);

  // 6. Dukungan TK: cabang isTK, pilihan dibacakan, titik/dots
  const tkHits = ['ctx.isTK', 'isTK', 'speakLabel', 'TI.dots', 'dots(', 'guide:'].filter((k) => src.includes(k));
  sig.tk = tkHits.length >= 2 ? 2 : tkHits.length >= 1 ? 1 : 0;
  if (sig.tk < 2) sug.push('kuatkan jalur TK (anak belum bisa baca: suara + gambar/titik)');

  // 7. Polish: lesson, deskripsi, cleanup aman (tanpa timer mentah)
  const lesson = has(src, /lesson\s*[:=]/);
  // Mentah = level window/document/global; listener di elemen sendiri boleh (ikut terbuang saat clear).
  const rawTimer = has(src, /(window|document)\s*\.\s*(setTimeout|setInterval|requestAnimationFrame|addEventListener)|(?<![\w$.])(setTimeout|setInterval|requestAnimationFrame|addEventListener)\s*\(/);
  sig.polish = (lesson ? 1 : 0) + (!rawTimer ? 1 : 0);
  if (!lesson) sug.push('isi lesson 1-2 kalimat di ctx.finish');
  if (rawTimer) sug.push('ganti timer/listener mentah dengan ctx.after/ctx.on (bocor saat keluar game)');

  const total = sig.aksi + sig.feedback + sig.ramp + sig.failsoft + sig.sesi + sig.tk + sig.polish; // maks 14
  const static100 = Math.round((100 * total) / 14);
  return { file, id, title, cat, bytes: src.length, soal, sig, static100, sug: sug.slice(0, 3) };
}

const files = fs.readdirSync(gamesDir).filter((f) => f.endsWith('.js')).sort();
const rows = files.map(audit).sort((a, b) => a.static100 - b.static100 || a.id.localeCompare(b.id));
const d = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10).replaceAll('-', '');
const out = { date: d, version: 'improve-v1.4', games: rows };
fs.writeFileSync(path.join(outDir, `static-${d}.json`), JSON.stringify(out, null, 1));

const cls = (s) => (s >= 85 ? 'A' : s >= 70 ? 'B' : s >= 50 ? 'C' : 'D');
if (process.argv.includes('--json')) {
  console.log(JSON.stringify(out));
} else {
  console.log(`audit statis ${rows.length} game (${d}):`);
  for (const r of rows) console.log(`${cls(r.static100)} ${String(r.static100).padStart(3)} ${r.id.padEnd(13)} ${(r.soal ?? '?') + 'soal'} ${r.file}`);
  const n = (f) => rows.filter(f).length;
  console.log(`\nkelas A:${n((r) => r.static100 >= 85)} B:${n((r) => r.static100 >= 70 && r.static100 < 85)} C:${n((r) => r.static100 >= 50 && r.static100 < 70)} D:${n((r) => r.static100 < 50)}`);
  console.log(`tersimpan: tools/improve/reports/static-${d}.json`);
}
