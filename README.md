# Taman Ilmu

50 mini game edukatif untuk anak TK dan SD: Agama Islam, Matematika, Sains, dan Logika. Web statis, tanpa install, tanpa iklan, tanpa data pribadi.

## Cara main

Buka https://brianarfi.github.io/taman-ilmu/ (atau klik dua kali `index.html` untuk main offline). Pilih jenjang **TK** atau **SD** di pojok atas; semua game menyesuaikan tingkat kesulitannya. Bintang tersimpan di browser per jenjang.

- Soal dibacakan suara bahasa Indonesia (tombol 🔊 di bar soal untuk mengulang). Suara terbaik di Edge (Microsoft Gadis). Ucapan istilah Arab memakai kamus yang sama dengan video kisah nabi: "Allah" dibaca "aul loh".
- Tombol 🔇 di beranda mematikan semua suara. Escape atau tombol ← kembali ke menu.
- Tidak ada musik, hanya efek suara pendek. Tidak ada gambar wajah atau mata.

## Level, lencana, papan juara

Anak naik level (Kecambah sampai Penjaga Taman) dari XP: menyelesaikan game, memperbaiki rekor bintang, dan rajin main tiap hari. Game terkunci terbuka berantai setelah game sebelumnya di kategori yang sama dapat bintang, jadi ada tantangan yang bisa dikejar. Ada 16 lencana, tantangan pekan yang berotasi, dan bonus semangat harian.

Bisa juga membanggakan hasilnya: tombol **📣 Bagikan** di layar hasil dan di lencana, plus **📣 Ajak teman main** di bawah menu. Di HP langsung buka lembar bagikan (WhatsApp dan sebagainya), di komputer teksnya tersalin tinggal tempel. Link yang dibagikan membawa nama pengundang, dan teman yang buka melihat sapaan di beranda. Berbagi pertama tiap hari memberi +5 XP.

Papan juara (tombol 🏆) punya dua mode: **Pekan Ini** (reset tiap Senin) dan **Sepanjang Waktu**, dipisah TK dan SD. Butuh internet; tanpa internet semua game tetap jalan penuh. Nama di papan cuma panggilan 2-16 huruf (boleh emoji bintang dan sejenisnya), tanpa nama asli; papan tidak minta akun dan hanya menyimpan ID acak di browser.

## Isi (50 game)

| Agama Islam (15) | Matematika (15) | Sains (13) | Logika (7) |
|---|---|---|---|
| Tebak Huruf Hijaiyah | Ayo Berhitung | Timbangan Seimbang | Sudoku Mini |
| Urutan Wudhu | Pecah Gelembung | Tenggelam atau Terapung | Geser Angka |
| Rukun Islam & Iman | Lebih Besar, Lebih Kecil | Ajaib Magnet | Cari Perbedaan |
| Shalat 5 Waktu | Lanjutkan Pola | Lempar Tepat (gravitasi) | Ingat Urutan |
| Kuis Kisah Nabi | Kenal Bentuk | Es, Air, Uap | Susun Bentuk |
| Kartu Pasangan (kitab, malaikat, Asmaul Husna) | Jam Berapa? | Jelajah Tata Surya | Menara Hanoi |
| Ucapan & Adab Baik | Warung Jujur (uang) | Rangkaian Listrik | Mobil Pintar |
| Tangkap Hijaiyah | Loncat Angka | Cahaya & Bayangan | |
| Labirin ke Masjid | Bagi Martabak (pecahan) | Lab Warna & Pelangi | |
| Ayo Thawaf & Sa'i | Menara Balok | Luncur Kotak (gesekan) | |
| Puzzle Masjid | Balapan Hitung | Siklus Air & Cuaca | |
| Surat Pendek | Angka Rahasia | Ayo Menanam | |
| Bangun Masjid | Domino Hitung | Cermin Ajaib (cahaya) | |
| Arah Kiblat | Panen Buah & Grafik | | |
| Kereta Bulan Hijriah | Ayo Mengukur | | |

## Struktur

- `index.html` memuat `js/pron.js` (kamus ucapan), `js/core.js` (menu, suara, bintang, helper kuis), `js/progress.js` + `js/badges.js` + `js/share.js` + `js/board.js` (gamifikasi, berbagi, dan papan juara, kontraknya di `SPEC.md` bagian 8), lalu `games/NN-id.js`.
- `css/style.css` gaya bersama dan token gerak (aturan app-motion).
- `SPEC.md` kontrak pembuatan game plus seluruh bank soal. Konten agama hanya dari sini.
- `tools/smoke.mjs` uji otomatis: `node tools/smoke.mjs --phone --max=300` membuka semua game di TK dan SD (tablet dan HP), main acak sampai selesai, catat error, simpan screenshot di `tools/shots/`.
- `tools/gami.mjs` uji gamifikasi: migrasi data lama, XP, unlock, tantangan pekan, lencana, anti-farming, papan offline, berbagi dan banner ajakan.
- `tools/ui.mjs` uji tombol menu: jenjang, suara, tab, kembali, Escape, Main Lagi, bintang tersimpan.
- `tools/sheet.mjs tk` (atau `sd`, `tk-hp`, `sd-mid`, ...) menggabungkan screenshot semua game jadi satu gambar untuk dicek sekilas.

Menambah game: buat `games/NN-id.js` yang memanggil `TI.register({...})` (lihat `games/01-hijaiyah.js`), tambahkan `<script>` di `index.html`. Deploy: push ke repo GitHub `BrianArfi/taman-ilmu`, Pages otomatis.

## Sebelum dibagikan luas

Teks Arab (huruf hijaiyah, Asmaul Husna, surat pendek) dan fakta kisah nabi sebaiknya dibaca ulang oleh ustadz/ustadzah atau guru TPA.
