# Backlog Ide Taman Ilmu (loop ide kontinu)

Diurut dampak-per-effort. Status: TODO (siap dikerjakan watcher),
GARAP (sedang dikerjakan), DONE (selesai + terukur), TOLAK (dengan alasan).
Watcher 1 jam mengambil 1 ide TODO teratas saat tidak ada batch murah.
Effort L dan flag ustadz=ya TIDAK diambil otomatis.

Sumber utama: tim ide 8 Nov 2026 (12 ide berperingkat + bukti file:baris).
Putaran 2 (10 Nov malam): 12 ide baru, gabung-dedup jadi 12 TODO (3 entri
lama diganti versi lebih spesifik, 2 TAHAN butuh ustadz, 1 TOLAK hijaiyah).
Putaran 3 (14 Nov): 16 ide (6 game + 5 viral + 5 ortu), gabung manual jadi
9 TODO baru (sintesis gagal ranking); 1 TOLAK hijaiyah, 6 parkir catatan.
Format tiap ide: masalah 1 kalimat; usulan + lokasi pasang; effort S/M/L;
dampak 1-5; ustadz ya/tidak.

## TODO

- **Tantang Keluarga/Sekelas semua game.** tantangKeluarga cuma di 2 game; grup WA keluarga/sekolah = K-factor terbesar. Perluas tombol ke semua game + template "tantang sekelas" (nama anak + game + link ?tantang=). Lokasi: core.js:973 (hapus filter 2 game) + share.js tantangKeluarga/baru tantangKelas. Effort S, dampak 5, ustadz tidak.
- **Badge 102 game di header + meta.** Angka + jaminan aman tak ada di judul yang pertama dibaca; meta description masih tulis 100. Tambah baris "102 game TK/SD · Tanpa iklan · Bisa offline" + tombol Pasang/Bookmark di bawah judul; betulkan meta. Lokasi: core.js head/brand (344-351) + index.html L10. Effort S, dampak 5, ustadz tidak.
- **Kartu forward ortu siap salin.** Tombol WA ortu cuma invite umum; ortu butuh teks alasan aman untuk grup sekolah. Tombol "Salin info buat grup WA" (5 poin aman + jumlah game + link). Lokasi: ortu.js ajakOrtu (15-19) + fungsi baru share.js dekat inviteOrtu. Effort S, dampak 5, ustadz tidak.
- **Label Nilai Islami di kartu game.** Diferensiasi vs game umum tak terlihat di grid. Label nilai per game islam dari desc/lesson yang sudah ada (mis. hijaiyah "Bekal baca Quran"). Lokasi: grid home core.js L460-469 desc. Effort S, dampak 5, ustadz tidak (pakai ulang string).
- **Listrik: demo terpandu benda pertama.** Tiap benda diawali tebakan buta 50/50 padahal anak belum kenal konduktor. Benda pertama jadi demo terpandu tanpa tebakan; tebakan mulai benda kedua. Lokasi: 37-listrik.js loop benda (419-454, lewati askGuess saat ke===1). Effort S, dampak 4, ustadz tidak.
- **Loncat: demo penuh seperlunya.** Tiap benar dibayar demo ulang penuh + TTS lengkap di 8 soal. Demo penuh hanya saat salah-dulu-lalu-benar atau tiap soal ke-3; benar firstTry cukup rayuan singkat. Lokasi: 29-loncat.js handler SD (387-396) + TK (263-270). Effort S, dampak 4, ustadz tidak.
- **Wujud: auto-lanjut ala listrik.** Tiap tugas lab ditutup gerbang catatan + Lanjut wajib (3-4x). Majukan otomatis setelah TTS (pola lanjutOtomatis), Lanjut jadi pemercepat. Lokasi: 19-wujud.js afterNote (137-145). Effort S, dampak 3, ustadz tidak.
- **Puasa: progres per kartu.** 8 kartu diurutkan tanpa umpan progres (progress per babak saja). Tambah onStep di ctx.order untuk teks "N dari 8 terpasang" + progress. Lokasi: 55-puasa-sehari.js L67 (onStep core.js L700). Effort S, dampak 3, ustadz tidak.
- **Ajak teman berhadiah dua sisi (lokal).** Banner ajak inbound tanpa bonus sehingga undangan tak memberi alasan bagi tamu maupun pengirim. Tamu via link ajak yang selesaikan game pertama dapat "Bonus Teman +10 XP"; pengirim dapat lencana "Pengajak Teman" setelah N share lokal. Varian server lintas-perangkat = effort L, JANGAN diambil. Lokasi: js/core.js:409-416 + progress.js:260-271 + badges.js DEFS + catat ajakSeen (atribusi dua arah, putaran 3). Effort M, dampak 5, ustadz tidak.
- **Misi Harian Global.** Game Gratis Hari Ini sama untuk semua tapi tak ada alasan kembali/share. Tombol "Tantang" + "Kartu" di kartu beranda; badge/streak 3/7 hari; teks share "misi hari ini". Lokasi: kartu freeCard core.js:404-409, dailyGlobal() progress.js:118, badges.js. Effort M, dampak 5, ustadz tidak.
- **Sertifikat cetak Shalat & Adab.** Tak ada artefak fisik dipamer keluarga. Varian kartu pamer "Sertifikat: Hafal 5 Waktu Shalat / Adab Baik" (nama, bintang, tanggal, lesson); unduh PNG via gambarKartu 1080x1350 + tombol Cetak. Lokasi: 04-shalat, 07-adab + galeri #/lencana. Effort M, dampak 4, ustadz tidak (lesson dari bank).

## GARAP

(kosong)

## DONE

- **Duel berbalas lanjutan** (S87): &lawan + skor seri + banner balas. Probe 2 HP OK, gami 55/55. Detail: cycle-20261114-s87.md.
- **Tantangan berbalas** (S86): duel tersimpan + menang/balas di hasil. Probe OK, gami 55/55. Detail: cycle-20261111-s86.md.
- **Laporan Anak** (S85): hero X/102 + bar kategori + bagikan; dev ke bawah. Probe OK, gami 55/55. Detail: cycle-20261111-s85.md.
- **Perisai kesempatan kedua Raja Taman** (S84): salah-1 dimaafkan + tunjuk jawaban, nyawa minus saat salah-2. 92 tetap, probe OK. Detail: cycle-20261111-s84.md.
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
- **Hijaiyah rayakan beruntun (14 Nov).** Game 01-hijaiyah contoh SPEC, dilewati permanen oleh loop.
