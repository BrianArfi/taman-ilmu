# Backlog Ide Taman Ilmu (loop ide kontinu)

Diurut dampak-per-effort. Status: TODO (siap dikerjakan watcher),
GARAP (sedang dikerjakan), DONE (selesai + terukur), TOLAK (dengan alasan).
Watcher 30 mnt mengambil 1 ide TODO teratas saat tidak ada batch murah.
Effort L dan flag ustadz=ya TIDAK diambil otomatis.

Sumber utama: tim ide 8 Nov 2026 (12 ide berperingkat + bukti file:baris).
Format tiap ide: masalah 1 kalimat; usulan + lokasi pasang; effort S/M/L;
dampak 1-5; ustadz ya/tidak.

## TODO

- **Tombol Pamer Peringkat.** TI.Share.rank() (share.js:86) sudah ditulis tapi nol pemanggil. Tombol "Pamerkan" di baris "kamu" saat rank pekan <=10 + track('share'); teks beda rank 1-3 vs 4-10. Lokasi: #/papan (board.js). Effort S, dampak 4, ustadz tidak.
- **Perisai kesempatan kedua Raja Taman.** Salah ketuk sekali langsung hilang 1 nyawa; mati di soal ke-3 = tutup game. Salah pertama picu petunjuk + tunjukkan jawaban benar, nyawa berkurang kalau salah 2x di soal yang sama. Lokasi: games/100-raja-taman.js. Effort S, dampak 3, ustadz tidak.
- **Rapor Anak + Rekap Pekanan.** Dashboard #/statistik dev-sentris ("Salin data ke Brian"). Ubah jadi bahasa ortu: main X hari, selesai Y game, rata bintang, progres kategori, streak + tombol "Kirim Rapor via WA" lewat share.js gambarKartu(). Lokasi: js/analytics.js + share.js. Effort M, dampak 5, ustadz tidak.
- **Duel Balasan.** Tantangan satu arah: penerima tak bisa tantang balik, loop viral putus. Buka ?tantang= simpan tantangan aktif; skor penerima >= penantang tampil "Kamu Menang!" + tombol Tantang Balik; event challenge_accept/duel_win di analytics.js. Lokasi: core.js tantangBanner (410-421) + layar hasil (946-948) + share.js. Effort M, dampak 5, ustadz tidak.
- **Misi Harian Global.** Game Gratis Hari Ini sama untuk semua tapi tak ada alasan kembali/share. Tombol "Tantang" + "Kartu" di kartu beranda; badge/streak 3/7 hari; teks share "misi hari ini". Lokasi: kartu freeCard core.js:404-409, dailyGlobal() progress.js:118, badges.js. Effort M, dampak 5, ustadz tidak.
- **Sertifikat cetak Shalat & Adab.** Tak ada artefak fisik dipamer keluarga. Varian kartu pamer "Sertifikat: Hafal 5 Waktu Shalat / Adab Baik" (nama, bintang, tanggal, lesson); unduh PNG via gambarKartu 1080x1350 + tombol Cetak. Lokasi: 04-shalat, 07-adab + galeri #/lencana. Effort M, dampak 4, ustadz tidak (lesson dari bank).
- **Lab tanpa jeda baca (wujud + listrik).** Lab berhenti tiap tugas untuk kartu bacaan + Lanjut; anak 6 th tak baca paragraf. Hapus kartu per tugas, ganti 1 kalimat lisan + maju otomatis; 1 kartu ringkasan di akhir. Lokasi: game wujud + listrik. Effort M, dampak 4, ustadz tidak.

## GARAP

(kosong)

## DONE

- **Tantangan Keluarga via WA** (S76): tombol fam di hasil shalat+adab + teks sepupu. 92/92 tetap, probe OK, ui.mjs 12/12. Detail: cycle-20261110-s76.md.
- **Pojok Untuk Orang Tua** (S75): layar #/orangtua + tautan footer + CTA ajak + track tayang. Verifikasi: probe OK, ui.mjs 12/12. Detail: cycle-20261110-s75.md.
- **Sirah-Urut: ajar dulu, baru uji** (S73): babak 1 cerita ketuk berurutan + babak 2 order. 92->92 (statis 86, smoke 100). Detail: cycle-20261110-s73.md.
- **Rekor Raja Taman** (S68): chip rekor + selebrasi rekor baru. 92->92 (statis 86, smoke 100). Detail: `cycle-20261108-s68.md`.
- **Toleransi salah Loncat TK** (S69): kurang lanjut, kebanyakan mundur selebihnya. 92->92 (statis 86, smoke 99). Detail: `cycle-20261108-s69.md`.
- **Jembatan ingatan Wujud** (S71): 1 kilat sebelum pilah. 92->92 (statis 86, smoke 99). Detail: `cycle-20261108-s71.md`.
- **Coba 30 Detik** (S72): tombol home + ?coba + adab 3 soal + kartu promo. 92->92 (statis 86, smoke 100). Detail: `cycle-20261108-s72.md`.

## TOLAK

- **Tantangan harian (benih kabur, S68).** Diganti ide konkret #8 Duel Balasan + #9 Misi Harian Global dari tim ide (lokasi + bukti jelas).
- **Hijaiyah selang-seling kuis-aksi.** Game 01-hijaiyah contoh SPEC, dilewati permanen oleh loop (bukan debat kualitas ide).
