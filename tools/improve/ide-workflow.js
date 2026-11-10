// Loop Ide Taman Ilmu: skrip Workflow kanonis (JANGAN dijalankan via node).
// Dipakai sesi kron harian: baca file ini, teruskan isinya sebagai `script`
// inline ke tool Workflow. 3 anak riset read-only + 1 sintesis.
const repo = 'C:/Users/Brian/AppData/Roaming/com.aisecondbrain.desktop/workspace/taman-ilmu';
const brief = `Repo: ${repo}. 102 game edukasi anak (TK/SD) di games/*.js, skor A101. ` +
  `Kamu READ-ONLY: jangan tulis/edit file apa pun, jangan commit/push. ` +
  `Buka tiap badan kode yang kamu kutip (read_file), bukan cuma grep. ` +
  `Kembalikan complete/evidence/unresolved sesuai skema.`;
const schema = {
  type: 'object',
  required: ['complete', 'evidence', 'unresolved'],
  properties: {
    complete: { type: 'boolean' },
    evidence: { type: 'array', items: { type: 'string' } },
    unresolved: { type: 'array', items: { type: 'string' } },
  },
};
const pick6 = `Pilih 6 game dari skor promo terbawah ` +
  `(baca tools/improve/reports/promo-TERBARU.json), variasi kategori.`;
const [main, viral, ortu] = await parallel([
  { input: `${brief}\n\nPeran: anak 6-9 tahun yang gampang bosan. ${pick6} ` +
    `Baca kodenya; jalankan smoke 1-2 game kalau perlu. Untuk tiap game: ` +
    `(1) titik paling membosankan/membingungkan di 2 menit pertama, ` +
    `(2) SATU ide perbaikan konkret (maks 3 kalimat + lokasi pasang), (3) skor dampak 1-5. ` +
    `evidence: jalur file + baris tiap klaim.`, schema, label: 'playtest-anak' },
  { input: `${brief}\n\nPeran: desainer game viral. Baca js/analytics.js ` +
    `(event share/challenge/card), js/config.js, dan pemakaian share/challenge di games/ + js/. ` +
    `Tulis 5 ide fitur sosial/viral: apa, di mana dipasang, effort S/M/L, dampak 1-5. ` +
    `evidence: jalur file + baris tiap klaim.`, schema, label: 'mekanik-viral' },
  { input: `${brief}\n\nPeran: orang tua pemilih aplikasi. Baca index.html (home), ` +
    `dashboard #/statistik di js/analytics.js, dan 2 game islam (baca saja). ` +
    `Tulis 5 ide agar orang tua mau pasang/bagikan: apa, di mana, effort S/M/L, dampak 1-5. ` +
    `evidence: jalur file + baris tiap klaim.`, schema, label: 'lensa-ortu' },
]);
const mentah = [main, viral, ortu].map((r) => r === null ? '' : (r.text || '')).join('\n\n');
const gabung = [main, viral, ortu].map((r) => r === null
  ? 'GAGAL: anak tidak kembali (pakai laporan lain yang ada)'
  : `ref=${r.ref} error=${r.error_kind || '-'} text=${r.text || ''} notes=${r.notes || ''}`).join('\n\n');
const sintesis = await agent({ input: `Gabungkan 3 laporan ide Taman Ilmu jadi SATU backlog berperingkat, maks 12 ide. ` +
  `Tiap ide: judul, masalah (1 kalimat), usulan (maks 3 kalimat + lokasi pasang), effort S/M/L, dampak 1-5, ` +
  `sasaran (game/fitur), flag ustadz (ya/tidak: menyentuh teks Arab/fakta agama?). ` +
  `Urut dampak-per-effort. Buang ide generik tanpa lokasi pasang. Sertakan unresolved tiap laporan. ` +
  `WAJIB hasilkan daftar ide dari teks di bawah walau sebagian laporan GAGAL; JANGAN jawab kosong.\n\n${gabung}`,
  schema, label: 'sintesis-ide' });
let hasil = sintesis === null ? '' : (sintesis.text || JSON.stringify(sintesis.data || {}));
if (!hasil || hasil === '{}' || hasil === 'SINTESIS GAGAL') hasil = 'SINTESIS-KOSONG-FALLBACK:\n' + mentah.slice(0, 12000);
return { summary: JSON.stringify({ hasil }) };
