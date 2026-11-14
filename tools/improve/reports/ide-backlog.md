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
Format tiap ide: masalah 1 kalimat; usulan + lokasi pasang; effort S/M/L;
dampak 1-5; ustadz ya/tidak.

## TODO

- **Laporan Anak naik ke home + WA langsung.** Bukti kemajuan terkubur di footer setelah 102 kartu. Pindah ringkasan hero + tombol Share.laporan() ke strip pemain/bawah CTA Coba 30 Detik. Lokasi: core.js:366-400, analytics.js:208-214, share.js:194-208. Effort S, dampak 5, ustadz tidak.
- **Raja: tutup bocoran + variasi kartu.** Petunjuk perisai membocorkan jawaban lalu menanya ulang; kartu soal teks identik. Ganti bocoran jadi petunjuk samar bertahap + bedakan visual kartu. Lokasi: 100-raja-taman.js:150-156,166,196 + kartu :188-189. Effort S, dampak 4, ustadz tidak.
- **Momen 3-bintang pertama per kategori.** Milestone sunyi; Kartu ghost. Saat 3 bintang pertama tiap kategori: tawarkan kartu pamer kategori via renderer ada. Lokasi: showResult (streak-party), totals().byCat progress.js:256-270, Share.card. Effort S, dampak 3, ustadz tidak.
- **PWA installable + banner Pasang.** Tanpa manifest tak bisa Add to Home Screen. Tambah manifest + service worker + ikon/splash + banner home & ortu. Lokasi: index.html:3-18 + core.js:371 + ortu. Effort M, dampak 5, ustadz tidak.
- **Bonus pengundang dua arah.** Cuma invitee dapat +10; pengundang tak termotivasi. Klaim balik: pengundang +20 XP + lencana Duta + kartu pamer. Lokasi: progress.js:214-219 + core.js:435-439 + badges.js + share.js:96-100. Effort M, dampak 5, ustadz tidak.
- **Raja: HP bar bos.** Tanpa tensi (nyawa aman). HP bar Raja di HUD berkurang tiap benar firstTry. Lokasi: 100-raja-taman.js L82-91 + loop 104-127. Effort M, dampak 5, ustadz tidak (parkir putaran 3).
- **Rekap Nilai Islami pekanan.** Ortu tak tahu nilai apa masuk. Dashboard baris "Pekan ini: ..." dari lesson game selesai. Lokasi: analytics.js render(). Effort M, dampak 5, ustadz tidak (tampil ulang lesson; parkir putaran 3).
- **Kartu rekap pekan WA.** Tak ada alasan share mingguan. Template gambarRekap (summary+rank) + tombol statistik + pemicu Senin. Lokasi: share.js + analytics.js:208-214 + config.js:5. Effort M, dampak 4, ustadz tidak.
- **Rivalku: strip duel home.** Seri duel hilang sesudah result. Strip duel aktif + Balas ke game + share tiap balasan. Lokasi: core.js showHome + duelSeri + challengeURL. Effort M, dampak 4, ustadz tidak.
- **Papan Teman lokal.** Anak peduli vs keluarga, bukan global. Link ?ajak daftarkan lingkaran localStorage + tab Teman. Varian server = L, JANGAN. Lokasi: board.js + ajakBanner (parkir putaran 3). Effort M, dampak 4, ustadz tidak.
- **Laporan bergambar + saran.** Laporan teks kalah menarik. Kartu gambar (x/102, bintang, hari) + 1 saran main bareng via gambarKartu. Lokasi: analytics.js + share.js laporan() (parkir putaran 3). Effort M, dampak 4, ustadz tidak.
- **Mode Ortu 1 menit.** Ortu tak pernah diajak setup. Kartu kunjungan pertama: jenjang + kunci keluar + kirim info (parkir putaran 3). Lokasi: home/banner pemain baru + ortu. Effort M, dampak 4, ustadz tidak.

## GARAP

(kosong)

## DONE

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