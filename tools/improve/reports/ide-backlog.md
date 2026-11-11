# Backlog Ide Taman Ilmu (loop ide kontinu)

Diurut dampak-per-effort. Status: TODO (siap dikerjakan watcher),
GARAP (sedang dikerjakan), DONE (selesai + terukur), TOLAK (dengan alasan).
Watcher 1 jam mengambil 1 ide TODO teratas saat tidak ada batch murah.
Effort L dan flag ustadz=ya TIDAK diambil otomatis.

Sumber utama: tim ide 8 Nov 2026 (12 ide berperingkat + bukti file:baris).
Putaran 2 (10 Nov malam): 12 ide baru, gabung-dedup jadi 12 TODO (3 entri
lama diganti versi lebih spesifik, 2 TAHAN butuh ustadz, 1 TOLAK hijaiyah).
Format tiap ide: masalah 1 kalimat; usulan + lokasi pasang; effort S/M/L;
dampak 1-5; ustadz ya/tidak.

## TODO

- **Perisai kesempatan kedua Raja Taman.** Salah ketuk sekali langsung hilang 1 nyawa; mati di soal ke-3 = tutup game. Salah pertama picu petunjuk + tunjukkan jawaban benar, nyawa berkurang kalau salah 2x di soal yang sama. Lokasi: games/100-raja-taman.js. Effort S, dampak 3, ustadz tidak.
- **Laporan Anak (ganti dasbor statistik).** Dasbor kini berorientasi dev (kunjungan, promo CTR, salin-ke-Brian), bukan bukti anak belajar apa. Kartu teratas "X/102 game selesai" + 4 bar progres per kategori (byCat sudah dihitung tapi tak dirender) + tombol "Bagikan laporan ke pasangan"; pindahkan Salin data + Banner promosi ke bawah berlabel "Untuk pengembang". Lokasi: js/analytics.js render() 185-215 (byCat 110-116). Effort M, dampak 5, ustadz tidak.
- **Tantangan berbalas (rematch loop).** Banner tantangan inbound cuma Terima/Tutup lalu hilang, loop viral putus satu arah. Simpan tantangan inbound yang diterima; saat anak selesai di game yang sama bandingkan bintang vs skor penantang, tampilkan "Kamu menang lawan [dari]!" + tombol "Balas Tantangan" ke Share.challenge(). Lokasi: js/core.js showResult 959-977 + share.js parseChallenge 106-117. Effort M, dampak 5, ustadz tidak.
- **Ajak teman berhadiah dua sisi (lokal).** Banner ajak inbound tanpa bonus sehingga undangan tak memberi alasan bagi tamu maupun pengirim. Tamu via link ajak yang selesaikan game pertama dapat "Bonus Teman +10 XP"; pengirim dapat lencana "Pengajak Teman" setelah N share lokal. Varian server lintas-perangkat = effort L, JANGAN diambil. Lokasi: js/core.js:409-416 + progress.js:260-271. Effort M, dampak 5, ustadz tidak.
- **Misi Harian Global.** Game Gratis Hari Ini sama untuk semua tapi tak ada alasan kembali/share. Tombol "Tantang" + "Kartu" di kartu beranda; badge/streak 3/7 hari; teks share "misi hari ini". Lokasi: kartu freeCard core.js:404-409, dailyGlobal() progress.js:118, badges.js. Effort M, dampak 5, ustadz tidak.
- **Sertifikat cetak Shalat & Adab.** Tak ada artefak fisik dipamer keluarga. Varian kartu pamer "Sertifikat: Hafal 5 Waktu Shalat / Adab Baik" (nama, bintang, tanggal, lesson); unduh PNG via gambarKartu 1080x1350 + tombol Cetak. Lokasi: 04-shalat, 07-adab + galeri #/lencana. Effort M, dampak 4, ustadz tidak (lesson dari bank).

## GARAP

(kosong)

## DONE

- **Perayaan streak di layar hasil** (S83): chip N hari + Pamerkan saat 3/7/30. Probe OK, ui 12/12. Detail: cycle-20261111-s83.md.
- **Loncat: boleh lewati** (S82): tombol Lewati demo+kalimat, min TK 250. 92 tetap, probe OK. Detail: cycle-20261111-s82.md.
- **Listrik: pangkas gerbang baca** (S81): peringatan sekali-pernah + note auto-lanjut. 92 tetap, probe OK. Detail: cycle-20261111-s81.md.
- **Bagikan Tantangan Pekan** (S80): tombol Ajak di strip + label + tantangPekan jujur. Probe OK, ui 12/12, gami 55/55. Detail: cycle-20261111-s80.md.
- **Template bagikan suara ortu** (S79): inviteOrtu + tombol WA ortu + hitungan dinamis. Probe OK, gami 55/55. Detail: cycle-20261111-s79.md.
- **Strip kepercayaan di home atas** (S78): 1 baris link #/orangtua di bawah header. Probe OK, ui.mjs 12/12. Detail: cycle-20261110-s78.md.
- **Tombol Pamer Peringkat** (S77): tombol Pamerkan di baris kamu rank pekan<=10 + teks 3-besar. Probe OK, gami 55/55. Detail: cycle-20261110-s77.md.
- **Tantangan Keluarga via WA** (S76): tombol fam di hasil shalat+adab + teks sepupu. 92/92 tetap, probe OK, ui.mjs 12/12. Detail: cycle-20261110-s76.md.
- **Pojok Untuk Orang Tua** (S75): layar #/orangtua + tautan footer + CTA ajak + track tayang. Verifikasi: probe OK, ui.mjs 12/12. Detail: cycle-20261110-s75.md.
- **Sirah-Urut: ajar dulu, baru uji** (S73): babak 1 cerita ketuk berurutan + babak 2 order. 92->92 (statis 86, smoke 100). Detail: cycle-20261110-s73.md.
- **Rekor Raja Taman** (S68): chip rekor + selebrasi rekor baru. 92->92 (statis 86, smoke 100). Detail: `cycle-20261108-s68.md`.
- **Toleransi salah Loncat TK** (S69): kurang lanjut, kebanyakan mundur selebihnya. 92->92 (statis 86, smoke 99). Detail: `cycle-20261108-s69.md`.
- **Jembatan ingatan Wujud** (S71): 1 kilat sebelum pilah. 92->92 (statis 86, smoke 100). Detail: `cycle-20261108-s71.md`.
- **Coba 30 Detik** (S72): tombol home + ?coba + adab 3 soal + kartu promo. 92->92 (statis 86, smoke 100). Detail: `cycle-20261108-s72.md`.

## TOLAK

- **Tantangan harian (benih kabur, S68).** Diganti ide konkret #8 Duel Balasan + #9 Misi Harian Global dari tim ide (lokasi + bukti jelas).
- **Hijaiyah selang-seling kuis-aksi.** Game 01-hijaiyah contoh SPEC, dilewati permanen oleh loop (bukan debat kualitas ide).
- **TAHAN ustadz: Adab gerbang arti opsional (10 Nov malam).** Tiap jawaban memaksa note arti + next (07-adab.js:92-98); usulan bagus tapi menyentuh ucapan + arti adab. Tahan sampai review ustadz, bukan tolak permanen.
- **TAHAN ustadz: Praktik di rumah selepas game islam (10 Nov malam).** Checklist wudhu + hijaiyah (02-wudhu.js:123, 01-hijaiyah.js:48). Tahan: butuh review ustadz (urutan wudhu, rujukan Iqra), bukan tolak permanen.
- **Hijaiyah variasi aksi (10 Nov malam).** Game 01-hijaiyah contoh SPEC, dilewati permanen oleh loop (sama seperti entri hijaiyah di atas).
