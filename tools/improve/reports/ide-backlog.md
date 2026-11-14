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

- **Ajak teman berhadiah dua sisi (lokal).** Banner ajak inbound tanpa bonus sehingga undangan tak memberi alasan bagi tamu maupun pengirim. Tamu via link ajak yang selesaikan game pertama dapat "Bonus Teman +10 XP"; pengirim dapat lencana "Pengajak Teman" setelah N share lokal. Varian server lintas-perangkat = effort L, JANGAN diambil. Lokasi: js/core.js:409-416 + progress.js:260-271 + badges.js DEFS + catat ajakSeen (atribusi dua arah, putaran 3). Effort M, dampak 5, ustadz tidak.
- **Misi Harian Global.** Game Gratis Hari Ini sama untuk semua tapi tak ada alasan kembali/share. Tombol "Tantang" + "Kartu" di kartu beranda; badge/streak 3/7 hari; teks share "misi hari ini". Lokasi: kartu freeCard core.js:404-409, dailyGlobal() progress.js:118, badges.js. Effort M, dampak 5, ustadz tidak.
- **Sertifikat cetak Shalat & Adab.** Tak ada artefak fisik dipamer keluarga. Varian kartu pamer "Sertifikat: Hafal 5 Waktu Shalat / Adab Baik" (nama, bintang, tanggal, lesson); unduh PNG via gambarKartu 1080x1350 + tombol Cetak. Lokasi: 04-shalat, 07-adab + galeri #/lencana. Effort M, dampak 4, ustadz tidak (lesson dari bank).

## GARAP

(kosong)

## DONE

- **Puasa: progres per kartu** (S95): counter onStep + bar fraksional. 92 tetap, probe OK. Detail: cycle-20261114-s95.md.
- **Wujud: auto-lanjut** (S94): afterNote sayWait + skip opsional. 92 tetap, probe OK. Detail: cycle-20261114-s94.md.
- **Loncat: demo penuh seperlunya** (S93): penuh hanya salah-dulu/tiap ke-3. 92 tetap, probe OK. Detail: cycle-20261114-s93.md.
- **Listrik: demo terpandu** (S92): benda pertama ditunjukkan, tebak mulai kedua. 92 tetap, probe OK. Detail: cycle-20261114-s92.md.
- **Label Nilai Islami** (S91): map NILAI 27 game + label kartu buka/kunci. Probe OK, ui 12/12. Detail: cycle-20261114-s91.md.
- **Kartu forward ortu** (S90): POIN satu sumber + tombol salin + infoOrtu. Probe OK, gami 55/55. Detail: cycle-20261114-s90.md.
- **Badge 102 game di header + meta** (S89): badge dinamis + meta 102 (tombol Pasang skip jujur). Probe OK, ui 12/12. Detail: cycle-20261114-s89.md.
- **Tantang Keluarga/Sekelas semua game** (S88): fam semua game + template sekelas; kontrak uji 5->7 tombol. Probe OK, gami 55/55. Detail: cycle-20261114-s88.md.
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
