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
Putaran 6 (16 Nov): 16 ide (6 game + 5 viral + 5 ortu), gabung manual jadi 12 TODO (sintesis kosong lagi); 1 TOLAK hijaiyah, 1 TAHAN khatam, 1 skip L, 2 parkir, 4 dupe-drop.
Putaran 7 (16 Nov): 16 ide (6 game + 5 viral + 5 ortu), gabung manual jadi 12 TODO (sintesis kosong lagi); 1 TOLAK hijaiyah, 0 TAHAN baru, 1 skip L, 2 parkir, 4 dupe-drop.
Putaran 8 (16 Nov): 16 ide (6 game + 5 viral + 5 ortu), gabung manual jadi 12 TODO (sintesis notes saja); 1 TOLAK hijaiyah, 2 TAHAN, 1 skip L, 2 parkir, 3 dupe-drop.
Format tiap ide: masalah 1 kalimat; usulan + lokasi pasang; effort S/M/L;
dampak 1-5; ustadz ya/tidak.

## TODO

- **Adu Rajin 7 Hari.** Duel sekali-putus, tak ada alasan balik harian. Duel konsistensi 7 hari via dayLog + kartu juara pola gambarDuel. Lokasi: share.js:121-144 + core.js:1056-1092. Effort M, dampak 5, ustadz tidak (P9).
- **Kartu Jumat mingguan.** Momen Jumat belum bisa diforward sebagai gambar. Kartu 1 ketuk: 7 titik + game islam pekan ini + ajakan. Lokasi: core.js:555 + share.js gambarStreak + analytics.js:220-233. Effort M, dampak 5, ustadz tidak (P9, gabung 2 ide).
- **Kartu prestasi dashboard.** Ortu tak bisa pamerkan kemajuan. Tombol "Buat kartu prestasi" di statistik via gambarKartu. Lokasi: analytics.js:191-250 + share.js:267+. Effort M, dampak 5, ustadz tidak.
- **Loncat SD: demo terpandu.** 21 batu langsung tanpa pemanasan. Soal 1: bola tunjukkan jawaban via tunjukkan() sebelum ketuk. Lokasi: 29-loncat.js:389-416. Effort M, dampak 5, ustadz tidak.
- **Badge pekan FOMO.** Badge tantangan sama tiap pekan. Badge unik per weekKey, koleksi terkunci permanen. Lokasi: badges.js + progress.js:28-55 + core.js:410-420. Effort M, dampak 4, ustadz tidak.
- **Kartu pamer edisi ortu.** Kartu skor tak layak pajang grup pengajian. Varian NILAI + lesson + bingkai sertifikat. Lokasi: share.js gambarKartu + core.js NILAI. Effort M, dampak 4, ustadz tidak (revive parkir P5).
- **Mode Ortu 1 menit.** Ortu tak pernah diajak setup. Kartu kunjungan pertama: jenjang + kunci keluar + kirim info. Lokasi: home/banner pemain baru + ortu. Effort M, dampak 4, ustadz tidak (revive parkir).

## GARAP

(kosong)

## DONE

- **Tangga Duta progresif** (S146): tier 1/3/5/10 XP 20/35/50/100 + progres banner (tanpa kartu tier). Probe tangga exact, ui 12/12, gami 62/62. Detail: cycle-20261117-s146.md.
- **Pasang di statistik** (S145): banner PWA bawah hero + Pasang/Panduan reuse paint. Probe 3/3, ui 12/12, gami 62/62. Detail: cycle-20261117-s145.md.
- **Pamer Rekor Baru** (S144): chip + tombol kartu saat rekor pecah (bukan main pertama). Probe 2/2, ui 12/12, gami 62/62. Detail: cycle-20261117-s144.md.
- **Listrik: saklar note jadi toast** (S143): note intro 1 kalimat + lanjut manual. Probe 3/3, A92 tetap. Detail: cycle-20261117-s143.md.
- **Tautkan ortu dari statistik** (S142): baris kepercayaan + tautan #/orangtua di dasbor. Probe 1/1, ui 12/12, gami 62/62. Detail: cycle-20261117-s142.md.
- **Wujud: afterNote hemat** (S141): ceramah hanya tugas pertama+terakhir, tengah cukup Hebat. Probe 3/3, A92 tetap. Detail: cycle-20261116-s141.md.
- **Loncat: demo ulang hanya bila salah** (S137): buang qi%3==2 di TK+SD, demo hanya bila salah>0. Probe 2/2, statis 86 tetap, merge A92. Detail: cycle-20261116-s137.md.
- **Banding: tombol Lanjut sejajar narasi** (S136): Lanjut tampil bersama narasi tiap soal, bisa skip. Probe 8/8, statis 86->93, merge A96. Detail: cycle-20261116-s136.md.
- **Listrik: ceramah hanya bila salah** (S135): benar = 1 kalimat + tombol manual, salah = ceramah penuh. Probe 5/5, skor A92 tetap. Detail: cycle-20261116-s135.md.
- **Jumat: tonjolkan ringkasan** (S134): tiap Jumat WIB tombol dasbor primer + label Jumat + catatan rekap. Probe 2/2, ui 12/12, gami 62/62. Detail: cycle-20261116-s134.md.
- **Lencana Juara Duel** (S133): DEFS juara-duel + grant saat final best-of-3 dimenangkan, hitungan 25. Probe 1/1, ui 12/12, gami 62/62. Detail: cycle-20261116-s133.md.
- **Laporan guru TPA** (S132): teks kualitatif tanpa skor (status 3 game islam + hari main) + tombol dasbor. Probe 1/1, ui 12/12, gami 62/62. Detail: cycle-20261116-s132.md.
- **Kartu streak visual + unlock total terverifikasi** (S131): gambarStreak 1080x1350 (angka+7 titik+nama) di streak-party + Pamer Rajin, pruneDayLog 7 hari, gembok lencana jadi ikon abu-abu. Probe 2/2 + critic 0 major, ui 12/12, gami 62/62. Detail: cycle-20261116-s131.md.
- **TPA: tombol Tantangan Kelas** (S116): preset 3 game islam + teks jujur best-0. Probe 5/5, ui 12/12, gami 61/61. Detail: cycle-20261116-s116.md.
- **CTA Ajak level-up + bonus 3** (S115): CTA hasil + klaim ke-3 +35. Probe 7/7, ui 12/12, gami 61/61. Detail: cycle-20261116-s115.md.
- **Rekap Nilai Islami pekanan** (S129): baris Pekan ini NILAI+judul+counter. Probe 4/4, ui 12/12, gami 62/62. Detail: cycle-20261116-s129.md.
- **Listrik: 60 detik interaktif** (S126): tebak+pasang benda-1, aman sesudah sukses. Probe 6/6. Detail: cycle-20261116-s126.md.
- **Kartu duel + Duel Ulang + final** (S127): gambarDuel + kartu home + best-of-3. Probe 9/9, ui 12/12, gami 62/62. Detail: cycle-20261116-s127.md.
- **Tantangan pekan beruntun** (S125): runtun lintas pekan + lencana + teks. Probe 6/6, ui 12/12, gami 62/62. Detail: cycle-20261116-s125.md.
- **Adab: arti auto-lanjut** (S124): note + sayWait gantikan next(). Probe 5/5. Detail: cycle-20261116-s124.md.
- **Panduan pasang ke WA-ku** (S123): teks langkah ios/android/desktop + tombol home & ortu. Probe 8/8, ui 12/12, gami 61/61. Detail: cycle-20261116-s123.md.
- **Loncat: panah ular SD** (S120): panah ujung baris selang-seling. Probe 4/4. Detail: cycle-20261116-s120.md.
- **Wujud: bintang per tugas** (S119): chip Tugas i/n + ★/☆/·. Probe 6/6. Detail: cycle-20261116-s119.md.
- **Preview kartu inline** (S122): thumbnail kategori di momen (streak/levelUp teks dikecualikan jujur). Probe 3/3, ui 12/12, gami 61/61. Detail: cycle-20261116-s122.md.
- **Raja: banner bos hidup** (S121): goyang damage + ejek nyawa. Probe 4/4. Detail: cycle-20261116-s121.md.
- **Wujud: hampir-benar saat geser** (S130): denyut label + tick 1/dtk. Probe 3/3. Detail: cycle-20261116-s130.md.
- **Wujud timer ctx.after** (S128, batch B79→A92): regresi S113 diperbaiki. Probe 7/7. Detail: cycle-20261116-s128.md.
- **Puasa: adilkan babak urut** (S118): 2 item jadi bin "Lakukan saat puasa". Probe 5/5. Detail: cycle-20261116-s118.md.
- **Puasa: strip langit** (S117): matahari 8→92% + aria tahap. Probe 4/4. Detail: cycle-20261116-s117.md.
- **Loncat SD: petunjuk arah** (S114): ucapan kebesaran/kekecilan + denyut 3 batu. Probe 6/6 (2x). Detail: cycle-20261116-s114.md.
- **Wujud: toast + Kok bisa** (S113): toast 1 kalimat 2,8 dtk + Kok bisa penuh. Probe 7/7. Detail: cycle-20261116-s113.md.
- **Raja: lolos ikut damage** (S112): lolos -1 HP + pop tiap damage. Probe 6/6. Detail: cycle-20261116-s112.md.
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
- **Hijaiyah ronde aksi 15 detik (16 Nov, putaran 6).** Game 01-hijaiyah contoh SPEC, dilewati permanen oleh loop.
- **TAHAN ustadz: Sertifikat Khatam hijaiyah/wudhu (16 Nov, putaran 6).** Teks sertifikat agama baru + sentuh game hijaiyah; tahan sampai review ustadz, bukan tolak permanen.
- **Hijaiyah kombo + ronde kilat (16 Nov, putaran 7).** Game 01-hijaiyah contoh SPEC, dilewati permanen oleh loop.
- **Hijaiyah chip streak (16 Nov, putaran 8).** Game 01-hijaiyah contoh SPEC, dilewati permanen oleh loop.
- **TAHAN ustadz: Puasa gabung Niat+Sahur (16 Nov, putaran 8).** Urutan Niat vs Sahur diperdebatkan fikih; tahan sampai review ustadz.
- **TAHAN ustadz: Sertifikat Hijaiyah + Siap TPA (16 Nov, putaran 8).** Teks sertifikat agama baru; tahan sampai review ustadz.
- **Hijaiyah ronde aksi tiap 2 soal (16 Nov, putaran 9).** Game 01-hijaiyah contoh SPEC, dilewati permanen oleh loop.
- **TAHAN ustadz: Sertifikat mini per game islam (16 Nov, putaran 9).** Teks capaian agama per game (mis. hafal urutan wudhu); tahan sampai review ustadz.

- **Hijaiyah strip koleksi 28 huruf (17 Nov, putaran 10).** Game 01-hijaiyah contoh SPEC, dilewati permanen oleh loop.
- **TAHAN ustadz: Puasa gabung gate babak (17 Nov, putaran 10).** Menggabung kalimat fakta puasa; tahan sampai review ustadz.
- **TAHAN ustadz: Sertifikat Hijaiyah + Wudhu (17 Nov, putaran 10).** Perluasan pola sertifikat ke game hijaiyah; tahan sampai review ustadz.
- **Kartu gambar Laporan Mingguan (P10).** SUDAH TERCakup TODO Kartu Jumat mingguan (P9); tidak diduplikat.

- **Loncat umpan kelebihan langsung (17 Nov, S144).** Premis gugur: sudah tak pernah > b (rayakanBenar mengunci sinkron); terbukti probe. Bukan tolak kualitas.

## PARKIR

- **Balapan Duta (P9, S3).** Kartu Pamer Duta + Top Pengajak mingguan. Lokasi: share.js pola rank + board.js + badges.js. Parkir: kalah slot 12.
- **Raja-taman ajar Perisai saat kejadian (P9, S3).** Hapus kartu aturan 3 paragraf; ajarkan saat salah pertama. Lokasi: 100-raja-taman.js:136-145 + 209-216. Parkir: kalah slot 12.
- **Tombol Pamer mid-play (P9, M4).** Tombol pamer saat rekor pecah di tengah game. Lokasi: helper core.js + 3-5 game skor. Parkir: kalah slot 12.
- **Liga Sepupu (P9, L5).** Kode liga multipemain keluarga. Parkir: effort L dilewati watcher.
- **Kunci Ortu PIN + batas waktu (P9, L5).** PIN + durasi harian + kunci papan. Parkir: effort L dilewati watcher.
- **Pasang + panduan WA 1 ketuk (P9).** SUDAH DIBANGUN di S123; tidak masuk TODO.

- **Kartu Tantangan bergambar (P10, M5).** Challenge teks-only jadi kartu gambar + tombol. Lokasi: share.js baru + core.js:1042-1047. Parkir: kalah slot 12.
- **Trust home + angka global (P10, M5).** Trust-strip jadi kartu 3 poin + social proof server (STATS_UP sudah true). Lokasi: core.js:379-383. Parkir: kalah slot 12.
- **Wujud toast pertama tunggu ketuk (P10, S3).** Tugas pertama tanpa timer 2800ms. Lokasi: 19-wujud.js:148-151. Parkir: kalah slot 12.
- **Duel Streak antar teman (P10, M4).** Tautan adu streak + kartu. Lokasi: share.js + core.js banner. Parkir: kalah slot 12.
- **Lapor ke grup kelas di finish (P10, M4).** Tombol lapor balik tutup loop Tantangan Kelas. Lokasi: core.js:1130 + share.js laporanTPA. Parkir: kalah slot 12.
- **Raja-taman serangan balik perisai (P10, M4).** Tiap 2 benar: ketuk perisai 3x blokir. Lokasi: 100-raja-taman.js:147-184. Parkir: kalah slot 12.
- **Tantangan Kelas berpapan (P10, L5).** Kode kelas + papan mini. Parkir: effort L dilewati watcher.
