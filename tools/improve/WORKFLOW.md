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
   tiap siklus yang lolos semua gerbang. Tiap push dicatat di laporan siklus
   (commit + cek live). Tanpa standing gas, push nunggu kata "gas".
6. **Acak jawaban**: `node tools/cek-acakan.mjs` harus OK. Jawaban kuis
   tidak boleh selalu di posisi yang sama (anak menghafal letak, bukan
   belajar). Situs options baru yang urutan-tetap harus masuk allowlist
   beralasan atau diacak dulu baru push.

## 5. Promosi + pantau rekursif

- `node tools/improve/promo-skor.mjs [--stats=s.json]`: skor promosi 0-100
  per game (siap dipromosikan = sesi pas + visual + progresi + ramah gagal
  + interaktif, lalu finish-rate dan bintang kalau ada data nyata).
  Keluaran: top-10 siap promo, 5 terbawah + cara naik, arah kategori.
- `node tools/improve/tren.mjs`: catat 1 snapshot per tanggal ke
  `reports/tren.jsonl`, cetak delta vs snapshot sebelumnya. Dijalankan
  tiap siklus sehingga tren tercatat otomatis (rekursif).
- Data nyata: dari HP anak via `#/statistik` -> Salin data statistik ->
  simpan `reports/stats-YYYYMMDD.json`. Makin banyak berkas stats, makin
  hidup bobot engagement 20% dan skor promo.

## 6. Loop Ide (rekursif, kontinu)

Eksekusi pola murah ada plafonnya (A99). Supaya naik terus, ide baru dicari
nonstop oleh tim multi-agent, lalu dieksekusi loop 1 jam:

1. **Cari**: kron `Loop Ide Taman Ilmu` (tiap 2 jam) memanggil Workflow
   dengan skrip kanonis `tools/improve/ide-workflow.js` (3 anak read-only:
   playtest-anak, mekanik-viral, lensa-ortu + 1 sintesis berperingkat).
   Gate: jalan hanya jika TODO < 8 (backlog butuh isi ulang) dan tidak ada
   `.ide-lock` segar (<180 mnt). Riset boleh overlap dengan loop eksekusi.
2. **Catat**: gabungkan ke `reports/ide-backlog.md` (dedup vs TODO lama,
   tandai DONE yang sudah dibangun via git log, urut dampak-per-effort,
   maks 12 TODO). Hapus `.ide-lock`. Commit + push (berkas md saja, tanpa
   cek live; jika push ditolak: `pull --rebase`, ulangi sekali).
3. **Kerjakan**: watcher 1 jam, jika tidak ada batch murah, ambil 1 ide
   TODO teratas (lewati effort L dan flag ustadz=ya) sebagai siklus itu,
   lalu tandai DONE + catat hasilnya di laporan siklus. Serah terima
   otomatis: ide yang dicatat loop ide langsung bisa ditarik watcher
   berikutnya (maks 1 jam kemudian).
4. **Ukur**: hasilnya terlihat di `tren.jsonl` + `promo-*.json` + stats HP,
   dan loop ide berikutnya membaca semuanya. Ini rekursinya: ide habis
   dimakan eksekutor -> gate terbuka -> ide baru dicari lagi.

Aturan: ide tidak boleh mengubah teks Arab/fakta agama secara otomatis
(flag ustadz=ya selalu TOLAK/tahan untuk review).

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
- **Siklus 10 (6 Nov 2026)**: bentuk 84→92, geser 83→92,
  magnet 84→92, tebak-bunyi 84→88.
  Detail: `reports/cycle-20261106.md`.
- **Siklus 11 (6 Nov 2026)**: apung 84→92, baju-cuaca 83→95,
  roket-air 84→92, listrik 84→92.
  Detail: `reports/cycle-20261106-s11.md`.
- **Siklus 12 (6 Nov 2026)**: pancing-magnet 84→96, doa-pasang
  84→92, tubuhku 83→92, haji 84→92.
  Detail: `reports/cycle-20261106-s12.md`.
- **Siklus 13 (6 Nov 2026)**: balik-ingat 83→88, grafik 84→88,
  kode-warna 84→88, labirin-es 83→88.
  Detail: `reports/cycle-20261106-s13.md`.
- **Siklus 14 (7 Nov 2026)**: pola-menara 84→92, sambung-pipa
  84→92, lawan-kata 84→88.
  Detail: `reports/cycle-20261107.md`.
- **Siklus 15 (7 Nov 2026)**: balap-kali 88→96, susun 88→95,
  timbangan 88→100.
  Detail: `reports/cycle-20261107-s15.md`.
- **Siklus 16 (7 Nov 2026)**: zakat-fitrah 88→92, wujud 88→92,
  tanam 88→91.
  Detail: `reports/cycle-20261107-s16.md`.
- **Siklus 17 (7 Nov 2026)**: belah-buah 88→92, ingat 88→92,
  hujan 88→96.
  Detail: `reports/cycle-20261107-s17.md`.
- **Siklus 18 (7 Nov 2026)**: pizza-pecahan 88→92, warung 88→88,
  beda 88→88.
  Detail: `reports/cycle-20261107-s18.md`.
- **Siklus 19 (7 Nov 2026)**: hitung 88→92, rahasia 88→92,
  ukur 88→92.
  Detail: `reports/cycle-20261107-s19.md`.
- **Siklus 20 (7 Nov 2026)**: beda 88→92, warung 88→92,
  sedekah-warung 88→92, lawan-kata 88→92.
  Detail: `reports/cycle-20261107-s20.md`.
- **Siklus 21 (7 Nov 2026)**: lempar 88→96, menara 88→96,
  tebak-bayang 88→92, toples-tebak 88→92.
  Detail: `reports/cycle-20261107-s21.md`.
- **Siklus 22 (7 Nov 2026)**: bayangan 88→96,
  tebak-bunyi+halal-pilah+jam-cocok 88→92.
  Detail: `reports/cycle-20261107-s22.md`.
- **Siklus 23 (7 Nov 2026)**: beda-satu+cermin-pola 88→92,
  kartu+lompat-bintang 88→91.
  Detail: `reports/cycle-20261107-s23.md`.
- **Siklus 24 (7 Nov 2026)**: parkir+pola-angka+sambung-kabel+
  balik-ingat 88→92.
  Detail: `reports/cycle-20261107-s24.md`.
- **Siklus 25 (7 Nov 2026)**: adab+balok-pas+penunjuk-arah 88→92,
  labirin-es 88→91.
  Detail: `reports/cycle-20261107-s25.md`.
- **Siklus 26 (7 Nov 2026)**: daur-hidup+jam-shalat+shalat+
  sirah-urut 88→92.
  Detail: `reports/cycle-20261107-s26.md`.
- **Siklus 27 (7 Nov 2026)**: grafik+kode-warna+tertib-shalat
  88→92. Semua B non-best-effort habis (A93 B6 C1).
  Detail: `reports/cycle-20261107-s27.md`.
- **Siklus 28 (7 Nov 2026)**: puzzle 84→96, rumah-makhluk+
  sortir-bangun+tebak-berat 84→88. Label best-effort dicabut
  untuk 4 game ini (A94 B5 C1).
  Detail: `reports/cycle-20261107-s28.md`.
- **Siklus 29 (7 Nov 2026)**: rumah-makhluk+sortir-bangun+
  tebak-berat 88→92 via kibor 1-4 (A97 B2 C1).
  Detail: `reports/cycle-20261107-s29.md`.
- **Siklus 30 (7 Nov 2026)**: raja-taman 84→92 via kibor +
  tombol ulangi (tangram stand down, A98 B1 C1).
  Detail: `reports/cycle-20261107-s30.md`.
- **Siklus 31 (7 Nov 2026)**: tangram 84→92 via 2 tahap SD +
  kibor (A99 B0 C1, misi selesai).
  Detail: `reports/cycle-20261107-s31.md`.
- **Siklus 34 (7 Nov 2026)**: tombol Salin di #/statistik;
  pipa engagement 20% terbukti hidup (eng 80). Minta data HP.
  Detail: `reports/cycle-20261107-s34.md`.
- **Siklus 51 (7 Nov 2026)**: 8 jawaban posisi-tetap diacak (beda dicermin
  + scene acak; bagi-permen SD yang tadinya selalu tombol ke-2).
  Uji regresi `tools/cek-acakan.mjs` (gerbang 6) + `promo-skor.mjs` +
  `tren.mjs` rekursif. Detail: `reports/cycle-20261107-s51.md`.
- **Siklus 68-69 (8 Nov 2026)**: eksekusi ide backlog #1-2 (rekor
  raja-taman, toleransi loncat TK). Skor tetap 92. Loop ide rekursif
  hidup (WORKFLOW bag 6, kron tiap 2 jam + watcher narik ide).
- **Siklus 70 (8 Nov 2026)**: game baru #101 Banjir Warna (logika,
  flood fill), A98 perdana. Aturan baru: backlog ide kosong =
  bangun 1 game baru bernomor berikut.

## 7. Game baru (saat backlog ide kosong)

Jika watcher tidak dapat batch murah DAN ide-backlog 0 TODO: bangun 1 game
baru bernomor berikut (102, 103, ...) dalam siklus itu. Syarat: baca SPEC.md
bag 1-5 + 1 game tetangga sekerabat sebagai pola; TK dan SD; 6-10 soal;
fail-soft; patuhi semua gerbang (cek-acakan otomatis lolos bila tanpa
ctx.choose urutan-tetap). Daftarkan 1 baris script di index.html (pengecualian
SPEC 1 yang dicatat di laporan: pemuatan game baru tidak mungkin tanpanya).
Pilih kategori tertipis + mekanik yang belum ada (cek daftar id per kategori
dulu). Satu siklus = satu game.
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
