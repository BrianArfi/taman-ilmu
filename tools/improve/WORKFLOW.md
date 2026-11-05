# Taman Ilmu: Continuous Improvement Loop (v1.0)

Satu siklus = bukti, uji main, sintesis, gerbang. Tujuannya: 100 game makin
lama makin bagus, makin asik, makin keren, makin engaging buat anak.

## 1. Bukti (evidence)

Tiap game dinilai dari tiga sumber. Semua angka tersimpan per siklus di
`tools/improve/reports/` sehingga trennya kelihatan.

| Sumber | Alat | Isi |
|---|---|---|
| Statis | `node tools/improve/audit-static.mjs` | Sinyal "seru" SPEC 7.1 dibaca dari kode: aksi inti, umpan balik, tanjakan sulit, fail-soft, sesi, dukungan TK, polish. Tanpa browser, 100 game dalam detik. |
| Dinamis | `node tools/smoke.mjs <id...> --phone` | Bukti main beneran: selesai atau tidak, berapa aksi, error JS, overflow, kembali ke menu. Diparse otomatis oleh `merge-cycle.mjs`. |
| Engagement | ekspor `tamanIlmu.stats.v1` (opsional) | Mulai vs selesai per game + bintang terbaik dari anak yang main beneran. Cara ekspor: buka `#/statistik`, di console `copy(localStorage.getItem('tamanIlmu.stats.v1'))`, simpan jadi file, terus `--stats=file.json`. |

## 2. Uji main (play-test)

- Smoke acak wajib OK (selesai, tanpa error, tanpa overflow) sebelum dan
  sesudah perbaikan. Target berat: `--max=600` untuk game arkade panjang.
- Tiap game yang diubah dicek screenshot `-mid` dan `-end` sebelum vs sesudah.
- Uji rasa manusia (agen/orang, main beneran 2 menit): wajib untuk game yang
  skornya naik kelas (mis. C ke B). Catat 1 baris kesan di laporan siklus.

## 3. Sintesis (scoring + backlog)

`node tools/improve/merge-cycle.mjs --ids=a,b,c [--stats=s.json]` menggabung
tiga sumber jadi satu skor Fun 0-100 per game:

- Statis 55% + dinamis 45% kalau data engagement belum ada.
- Statis 45% + dinamis 35% + engagement 20% kalau ada ekspor stats.
- Kelas: A 85+, B 70-84, C 50-69, D di bawah 50.

Keluaran: `reports/cycle-YYYYMMDD.json` (angka) + `backlog.md` (antrean
perbaikan, diurut dari skor terbawah, tiap game bawa 3 saran konkret).

## 4. Gerbang (gates, tidak bisa ditawar)

1. **Smoke OK** sesudah perbaikan, kalau tidak: revert (git adalah snapshot).
2. **Skor tidak turun**: Fun sesudah >= Fun sebelum. Turun = revert.
3. **Aturan konten SPEC 3**: tanpa wajah/mata, tanpa musik, Indonesia ramah
   anak, tanpa em-dash. Islam: teks Arab dan fakta agama HANYA dari SPEC;
   perubahan apa pun di teks/fakta agama = **gerbang ustadz** (tahan, minta
   review ustadz/guru TPA sebelum push, lalu kabari grup keluarga).
4. **Gerak SPEC 4**: motion-lint 0 error untuk file yang diubah.
5. **Deploy = push ke main**: standing gas dari Brian (5 Nov 2026) buat
   tiap siklus yang lolos gerbang 1-4. Tiap push dicatat di laporan siklus
   (commit + cek live). Tanpa standing gas, push nunggu kata "gas".

## Kadensi

- Siklus ringan (otomatis/agen): 1 batch 3-5 game terbawah per putaran.
- Siklus penuh: semua game diaudit statis tiap ada gelombang baru; smoke penuh
  hanya saat rilis besar (100 game x 2 jenjang itu lama).
- Berhenti per game kalau 2 siklus berturut-turut skornya tidak naik: tulis
  `best effort` di laporan, pindah ke game lain.

## Riwayat versi

- **Siklus 1 (5 Nov 2026)**: hitung 72→84, buru-bentuk 73→92, halal-pilah
  72→84. Detail: `reports/cycle-20261105.md`. Push + live terverifikasi.
  Standing gas buat siklus berikut.
- **Siklus 2 (5 Nov 2026)**: pola-angka 69→88, balok-pas 73→88, banding
  73→92, rumah-makhluk 72→84, sirah-urut 73→88. D0 tercapai.
  Detail: `reports/cycle-20261105-s2.md`.
- **Siklus 3 (5 Nov 2026)**: teka-teki 73→92, jam-cocok 73→88,
  tebak-bayang 73→88, adab 73→88, bangun 76→92.
  Detail: `reports/cycle-20261105-s3.md`.
- **Siklus 4 (5 Nov 2026)**: jam-shalat 73→88, sortir-bangun 72→84,
  tebak-berat 73→84, tertib-shalat 72→88, toples-tebak 73→88.
  Detail: `reports/cycle-20261105-s4.md`.
- **Siklus 5 (5 Nov 2026)**: daur-hidup 76→88, jam 76→92, raja-taman
  76→84, nabi 76→92, penunjuk-arah 76→88.
  Detail: `reports/cycle-20261105-s5.md`.
- **Siklus 6 (5 Nov 2026)**: kartu 76→80, kisah-clue 76→92,
  lari-masjid 75→91, puasa-sehari 76→92, pola 80→92.
  Detail: `reports/cycle-20261105-s6.md`.
- **Siklus 7 (5 Nov 2026)**: rukun 80→96, wudhu 80→92, shalat 80→88,
  siang-malam 80→96, gelembung 80→92.
  Detail: `reports/cycle-20261105-s7.md`.
- **Siklus 8 (5 Nov 2026)**: beda-satu 80→88, lompat-bintang 79→88,
  tabung-infaq 80→92, tatasurya 80→96, sudoku 79→92.
  Detail: `reports/cycle-20261105-s8.md`.
- **Siklus 9 (5 Nov 2026)**: cermin-pola 80→88, kartu 80→88,
  parkir 80→88, sambung-kabel 80→88.
  Detail: `reports/cycle-20261105-s9.md`.
- **v1.3 (5 Nov 2026)**: puzzle dideteksi dari judul/deskripsi register
  (bukan kata di komentar); fail-soft hitung order/sort/place.
- **v1.4 (5 Nov 2026)**: puzzle dibaca hanya sampai `start(ctx)` (komentar
  kode tidak ikut); saran sesi cuma kalau di luar 3-12.
- **v1.5 (5 Nov 2026)**: umpan balik kenal debu/dust/pantul/mendarat
  (kosakata game aksi gelombang 2).
- **v1.6 (5 Nov 2026)**: deteksi sort menanjak boleh diawali kurung
  (komparator ternary berkurung).
- **v1.2 (5 Nov 2026)**: sfx hitung correct/wrong; ramp kenal sort komparator +
  array ronde menanjak; fail-soft kenal ctx.choose dan hitungan bantu ke-3.
- **v1.1 (5 Nov 2026)**: id dibaca dari blok TI.register; aksi hitung tombol
  kustom; feedback hitung ctx.correct/wrong; lesson `=`; timer mentah hanya
  level window/document; sesi 3-5 = 1.
- **v1.0 (5 Nov 2026)**: audit statis 7 sinyal, merge smoke + stats ekspor,
  skor Fun + kelas A-D, backlog otomatis, gerbang 1-5. Baseline: `backlog.md`.
