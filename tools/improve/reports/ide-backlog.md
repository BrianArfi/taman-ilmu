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
Putaran 4 (14 Nov): 12 sintesis (5 ortu + 5 viral + 2 game) + 5 hidupkan parkir; 2 TAHAN ustadz, 1 TOLAK hijaiyah, 2 parkir (L).
Putaran 5 (15 Nov): 16 ide (6 game + 5 viral + 5 ortu), gabung manual jadi 12 TODO (sintesis kosong lagi); 1 TOLAK hijaiyah, 1 dupe TAHAN-sertifikat, 2 skip L, 6 parkir catatan.
Format tiap ide: masalah 1 kalimat; usulan + lokasi pasang; effort S/M/L;
dampak 1-5; ustadz ya/tidak.

## TODO

- **Wujud: toast + Kok bisa.** afterNote wajib habis dibaca tiap tugas (3-4x). Ganti toast 1 kalimat hilang-sendiri + tombol opsional penjelasan penuh. Lokasi: 19-wujud.js:137-151,281. Effort S, dampak 4, ustadz tidak.
- **Puasa: strip langit.** Babak 1 susun label abstrak tanpa rasa hari. Strip pagi-maghrib, matahari bergeser tiap item terpasang. Lokasi: 55-puasa-sehari.js:64-71. Effort S, dampak 3, ustadz tidak.
- **Listrik: 60 detik interaktif.** Tembok ceramah + demo pasif sebelum sentuh apa pun. Peringatan jadi toast sesudah sukses pertama; demo benda-1 diketuk anak (lanjutan S81/S92). Lokasi: 37-listrik.js:361-443. Effort M, dampak 5, ustadz tidak.
- **Kartu skor duel + Duel Ulang.** Duel tak terlihat dari beranda. gambarDuel() kartu skor seri + kartu Duel Ulang di home saat duelSeri aktif. Lokasi: share.js gambarKartu + core.js home. Effort M, dampak 5, ustadz tidak.
- **Rekap Nilai Islami pekanan.** Ortu tak tahu nilai apa masuk. Dashboard baris "Pekan ini: ..." dari lesson game selesai. Lokasi: analytics.js render(). Effort M, dampak 5, ustadz tidak (tampil ulang lesson; parkir putaran 3).
- **Kartu rekap pekan WA.** Tak ada alasan share mingguan. Template gambarRekap (summary+rank) + tombol statistik + pemicu Senin. Lokasi: share.js + analytics.js:208-214 + config.js:5. Effort M, dampak 4, ustadz tidak.

## GARAP

(kosong)

## DONE

- **Laporan mingguan teks forward** (S111): ringkasan 7 hari + total + ajakan. Probe 4/4, ui 12/12, gami 60/60. Detail: cycle-20261116-s111.md.
- **Tantang per baris papan** (S110): tombol duel rival di atasmu + best>0. Probe 7/7, ui 12/12, gami 60/60. Detail: cycle-20261116-s110.md.
- **Progres Duta terlihat** (S109): strip Ajak N/5 + lencana Duta Emas ke-23. Probe 5/5, ui 12/12, gami 60/60. Detail: cycle-20261116-s109.md.
- **Raja: intro Perisai** (S108): kartu intro + ikon perisai HUD. Probe 4/4. Detail: cycle-20261116-s108.md.
- **Pasang selalu tampil** (S107): banner selalu tampil + manual Android/desktop + paint. Probe 8/8, ui 12/12, gami 60/60. Detail: cycle-20261115-s107.md.
- **Loncat: satu tombol menilai** (S106): hitungan pas otomatis benar, Sudah untuk koreksi. Probe 5/5. Detail: cycle-20261115-s106.md.
- **Raja: HP bar bos** (S105): HP 10 di HUD, -1 per firstTry-benar, rayaan + pesan kalah. Probe 6/6. Detail: cycle-20261115-s105.md.
- **Bonus pengundang dua arah** (S104): klaim balik ?klaim +20 XP sekali/nama + lencana Duta ke-22. Probe 12/12, ui 12/12, gami 60/60. Detail: cycle-20261115-s104.md.
- **PWA installable + banner Pasang** (S103): manifest + SW tanpa-cache + 4 ikon + banner home & ortu + iOS. Probe 10/10, ui 12/12, gami 55/55. Detail: cycle-20261115-s103.md.
- **Momen 3-bintang pertama per kategori** (S101): blok rayaan sekali-per-kategori + Pamerkan kartu kategori. Probe 9/9, ui 12/12, gami 55/55. Detail: cycle-20261115-s101.md.
- **Cabut kunci game** (S102, permintaan langsung): semua 102 terbuka, 3 lencana tier bintang, dasbor Bintang 3. Probe 11/11, ui 12/12, gami 55/55. Detail: cycle-20261115-s102.md.
- **Raja: tutup bocoran + variasi kartu** (S100): petunjuk samar + 1 opsi disingkirkan, kartu border+label bank. Probe 10/10, ui 12/12. Detail: cycle-20261115-s100.md.
- **Laporan Anak naik ke home** (S99): mini N/M + Bagikan langsung. Probe OK, ui 12/12. Detail: cycle-20261114-s99.md.
- **Sertifikat Shalat & Adab** (S98): kartu sertifikat + tombol hasil 3bintang + galeri unduh/cetak. Probe OK, gami 55/55 ui 12/12. Detail: cycle-20261114-s98.md.
- **Misi Harian Global** (S97): tantang+kartu di kartu gratis + runtun + 2 lencana. Probe OK, gami 55/55 ui 12/12. Detail: cycle-20261114-s97.md.
- **Ajak dua sisi lokal** (S96): bonus tamu +10 + lencana pengajak di 3 share. Probe OK, gami 55/55 ui 12/12. Detail: cycle-20261114-s96.md.
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

- **TAHAN ustadz: Teks forward capaian islam (14 Nov, P2).** Capaian konkret + fakta shalat; tahan sampai review ustadz, bukan tolak permanen.
- **TAHAN ustadz: Sertifikat semua game islam (14 Nov, P7).** Melibatkan teks Arab/fakta agama; tahan sampai review ustadz, bukan tolak permanen.
- **Hijaiyah variasi+streak (14 Nov, P10).** Game 01-hijaiyah contoh SPEC, dilewati permanen oleh loop.
- **Hijaiyah Ronde Kilat (15 Nov, putaran 5).** Game 01-hijaiyah contoh SPEC, dilewati permanen oleh loop.