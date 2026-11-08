# Backlog Ide Taman Ilmu (loop ide harian)

Diurut dampak-per-effort. Status: TODO (siap dikerjakan watcher),
GARAP (sedang dikerjakan), DONE (selesai + terukur), TOLAK (dengan alasan).
Watcher 30 mnt mengambil 1 ide TODO teratas saat tidak ada batch murah.
Effort L dan flag ustadz=ya TIDAK diambil otomatis.

Format tiap ide: masalah 1 kalimat; usulan maks 3 kalimat + lokasi pasang;
effort S/M/L; dampak 1-5; sasaran; ustadz ya/tidak.

## TODO

- **Rekor Raja Taman.** Masalah: ujian 10 soal 3 nyawa datar, anak tak balik karena tak ada yang dikejar. Usulan: tampilkan "Rekor: X/10" di HUD awal (baca bintang/progress tersimpan) dan rayakan rekor baru saat finish. Lokasi: `games/100-raja-taman.js` main() HUD (l.80-98) + finish (l.122-127). Effort S, dampak 4, ustadz tidak.
- **Toleransi salah Loncat TK.** Masalah: salah tekan "Sudah!" bola kembali ke awal dan hitungan nol (29-loncat.js:259-260), anak frustrasi. Usulan: tambah titik progresi per ketukan; saat salah, mundur hanya selisihnya (atau tawarkan "lanjut dari X"), bukan nol. Lokasi: `games/29-loncat.js` soalTK (l.243-260). Effort S, dampak 4, ustadz tidak.
- **Jembatan ingatan Wujud.** Masalah: lab dan pilah dua babak lepas (19-wujud.js: lab l.181, sort l.283). Usulan: selipkan 1 pertanyaan kilat penghubung sebelum pilah ("tadi es jadi apa?"). Lokasi: `games/19-wujud.js` antara lab dan sort. Effort S, dampak 3, ustadz tidak.
- **Tantangan harian.** Masalah: tak ada alasan buka tiap hari. Usulan: 1 game sorotan per hari di home + lacak via event challenge yang sudah ada di js/analytics.js. Lokasi: index.html home + js/analytics.js. Effort M, dampak 5, ustadz tidak.

## GARAP

(kosong)

## DONE

- **Rekor Raja Taman** (S68): chip rekor + selebrasi rekor baru. 92->92 (statis 86, smoke 100). Detail: `cycle-20261108-s68.md`.
- **Toleransi salah Loncat TK** (S69): kurang lanjut, kebanyakan mundur selebihnya. 92->92 (statis 86, smoke 99). Detail: `cycle-20261108-s69.md`.
- **Jembatan ingatan Wujud** (S71): 1 kilat sebelum pilah. 92->92 (statis 86, smoke 99). Detail: `cycle-20261108-s71.md`.

## TOLAK

(kosong)
