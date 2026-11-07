// Uji regresi: jawaban kuis tidak boleh selalu di posisi yang sama.
// Statis: tiap situs `options:` di games/*.js harus diacak (shuffle/sample/
// numChoices/optionsFrom) ATAU ada di allowlist (jawaban bervariasi per soal).
// Plus: 46-beda harus mengacak urutan scene / cermin (posisi jawaban pindah).
// Pakai: node tools/cek-acakan.mjs  (exit 1 kalau ada pelanggaran baru)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const gamesDir = path.resolve(here, '..', 'games');
const ACAK = /shuffle|sample|numChoices|optionsFrom/;
const files = fs.readdirSync(gamesDir).filter((f) => f.endsWith('.js')).sort();

// Situs urutan-tetap yang WAJAR: jawaban bervariasi tiap soal (kunci angka, simbol baku).
// format: file -> [cuplikan baris options, alasan]
const ALLOW = [
  ['04-shalat.js', '[2, 3, 4]', 'jawaban s.rakaat bervariasi per shalat (2/3/4)'],
  ['04-shalat.js', '[2, 3, 4, 5]', 'jawaban s.rakaat bervariasi per shalat'],
  ['10-banding.js', 'kelompok(a, emo)', 'jawaban kiri/kanan acak per soal'],
  ['10-banding.js', "label: '>'", 'simbol >/</= urutan baku, jawaban bervariasi'],
  ['34-domino.js', 'sort((x, y)', 'numChoices acak lalu urut, posisi jawaban bervariasi'],
  ['35-grafik.js', 'numChoices', 'numChoices acak lalu urut, posisi jawaban bervariasi'],
];
const allowed = (file, line) => ALLOW.some(([f, snip]) => f === file && line.includes(snip));

function defBody(lines, name, kind) {
  // kind 'fn': function NAME / `const NAME = (ans)` ; kembalikan ~12 baris tubuh
  for (let i = 0; i < lines.length; i++) {
    if (kind === 'fn' && new RegExp(`function\\s+${name}\\b|const\\s+${name}\\s*=\\s*(\\(|\\w+\\s*=>)`).test(lines[i]))
      return lines.slice(i, i + 12).join('\n');
    if (kind === 'prop' && new RegExp(`\\b${name}\\s*:`).test(lines[i])) {
      // semua definisi prop ini harus mengandung pengacak
      const defs = lines.filter((l) => new RegExp(`\\b${name}\\s*:`).test(l));
      return defs.every((l) => ACAK.test(l)) ? '__acak__' : defs.join('\n');
    }
  }
  return '';
}

const langgar = [];
for (const file of files) {
  const src = fs.readFileSync(path.join(gamesDir, file), 'utf8');
  const lines = src.split(/\r?\n/); // penting: berkas CRLF, titik tidak cocok \r
  lines.forEach((line, idx) => {
    const m = line.match(/options:\s*(.+)$/);
    if (!m) return;
    const expr = m[1].trim();
    const tag = `${file}:${idx + 1}`;
    if (ACAK.test(expr)) return; // langsung diacak
    // bukti: ekspresi + 6 baris ke depan (literal multi-baris) + rantai deklarasi
    const ahead = lines.slice(idx, idx + 6).join('\n');
    if (expr.startsWith('[')) { // array literal urutan tetap
      if (!allowed(file, ahead)) langgar.push(`${tag} options literal tanpa acak: ${ahead.slice(0, 90).replace(/\n/g, ' ')}`);
      return;
    }
    // telusur rantai: VAR -> deklarasi -> (variabel/fungsi/argumen) sampai ketemu pengacak
    const seen = new Set();
    let bukti = expr;
    let kerja = [expr];
    let acak = false;
    for (let d = 0; d < 4 && kerja.length && !acak; d++) {
      const next = [];
      for (const e of kerja) {
        const vm = e.match(/^([A-Za-z_$][\w$]*)((?:\.[A-Za-z_$][\w$]*)*)/);
        if (!vm) continue;
        const v = vm[1];
        if (seen.has(v)) continue;
        seen.add(v);
        const chain = (vm[2] || '').split('.').filter(Boolean);
        const ARRAY_FN = ['map', 'filter', 'slice', 'concat', 'sort', 'flat'];
        if (chain.length && !ARRAY_FN.includes(chain[0])) { // s.opsi / q.numbers
          const defs = lines.filter((l) => new RegExp(`\\b${chain[0]}\\s*:`).test(l));
          bukti += ' | ' + defs.join(' ').slice(0, 120);
          if (defs.length && defs.every((l) => ACAK.test(l))) { acak = true; break; }
          continue;
        }
        const decl = [...lines.slice(0, idx)].reverse().find((l) => new RegExp(`\\b(const|let|var)\\s+${v}\\s*=|\\b${v}\\s*=[^=]`).test(l));
        if (!decl) {
          const fnBody = defBody(lines, v, 'fn'); // panggilan fungsi langsung: options: buatOpsi(...)
          bukti += ' | ' + fnBody.slice(0, 120);
          if (fnBody && ACAK.test(fnBody)) { acak = true; break; }
          continue;
        }
        bukti += ' | ' + decl.trim().slice(0, 100);
        if (ACAK.test(decl)) { acak = true; break; }
        const memberProps = [...decl.matchAll(/\b[a-z]\.([A-Za-z_$][\w$]*)/g)].map((x) => x[1]);
        if (memberProps.length) { // opsi = s.opsi.map: semua definisi prop harus diacak
          const defs = memberProps.flatMap((p) => lines.filter((l) => new RegExp(`\\b${p}\\s*:`).test(l)));
          bukti += ' | prop:' + defs.length;
          if (defs.length && defs.every((l) => ACAK.test(l))) { acak = true; break; }
        }
        if (/=\s*(\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/.test(decl)) { // definisi fungsi panah: telusur argumen di situs panggil
          const arg = (e.match(/\(\s*([A-Za-z_$][\w$]*)/) || [])[1];
          if (arg && arg !== v) next.push(arg);
          continue;
        }
        const rhs = decl.match(/=\s*([A-Za-z_$][\w$]*)\s*(\.|\(|$)/);
        if (rhs && rhs[1] !== v) {
          if (rhs[2] === '(') { // opsi = buatSet(...) -> isi fungsi
            const fnBody = defBody(lines, rhs[1], 'fn');
            bukti += ' | ' + fnBody.slice(0, 120).replace(/\n/g, ' ');
            if (fnBody && ACAK.test(fnBody)) { acak = true; break; }
          } else next.push(rhs[1]); // opsi = pilih.map -> telusur pilih
        }
      }
      kerja = next;
    }
    if (!acak && !allowed(file, bukti)) langgar.push(`${tag} tanpa acak: ${bukti.slice(0, 150)}`);
  });
  // 46-beda: urutan scene atau cermin harus acak
  if (file === '46-beda.js' && !/shuffle\(|scale\(-1/.test(src))
    langgar.push('46-beda.js: urutan scene tetap + tanpa cermin (posisi jawaban sama tiap replay)');
}

if (langgar.length) {
  console.log(`CEK-ACAKAN GAGAL (${langgar.length}):\n- ` + langgar.join('\n- '));
  process.exit(1);
}
console.log(`cek-acakan OK: ${files.length} game, semua options diacak / allowlist sah.`);
