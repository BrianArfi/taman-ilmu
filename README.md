# Taman Ilmu

100 mini game edukatif untuk anak TK dan SD: Agama Islam, Matematika, Sains, dan Logika. Web statis, tanpa install, tanpa iklan pihak ketiga, tanpa data pribadi.

## Cara main

Buka https://brianarfi.github.io/taman-ilmu/ (atau klik dua kali `index.html` untuk main offline). Pilih jenjang **TK** atau **SD** di pojok atas; semua game menyesuaikan tingkat kesulitannya. Bintang tersimpan di browser per jenjang.

- Soal dibacakan suara bahasa Indonesia (tombol 🔊 di bar soal untuk mengulang). Suara terbaik di Edge (Microsoft Gadis). Ucapan istilah Arab memakai kamus yang sama dengan video kisah nabi: "Allah" dibaca "aul loh".
- Tombol 🔇 di beranda mematikan semua suara. Escape atau tombol ← kembali ke menu.
- Tidak ada musik, hanya efek suara pendek. Tidak ada gambar wajah atau mata.
- **Game Gratis Hari Ini**: tiap hari satu game yang masih terkunci dibuka otomatis tanpa syarat, besok ganti lagi. Kartunya tampil di beranda dengan tombol Main Gratis.

## Level, lencana, papan juara

Anak naik level (Kecambah sampai Penjaga Taman) dari XP: menyelesaikan game, memperbaiki rekor bintang, dan rajin main tiap hari. Game terkunci terbuka berantai setelah game sebelumnya di kategori yang sama dapat bintang, jadi ada tantangan yang bisa dikejar. Ada 21 lencana, tantangan pekan yang berotasi, dan bonus semangat harian.

Papan juara (tombol 🏆) punya dua mode: **Pekan Ini** (reset tiap Senin) dan **Sepanjang Waktu**, dipisah TK dan SD. Butuh internet; tanpa internet semua game tetap jalan penuh. Nama di papan cuma panggilan 2-16 huruf (boleh emoji bintang dan sejenisnya), tanpa nama asli; papan tidak minta akun dan hanya menyimpan ID acak di browser.

## Bagikan, tantang, pamer

- Tombol **📣 Bagikan** di layar hasil dan di lencana, plus **📣 Ajak teman main** di bawah menu. Di HP langsung buka lembar bagikan (WhatsApp dan sebagainya), di komputer teksnya tersalin tinggal tempel. Link yang dibagikan membawa nama pengundang, dan teman yang buka melihat sapaan di beranda. Berbagi pertama tiap hari memberi +5 XP.
- Tombol **🏆 Tantang** di layar hasil: bagikan link tantangan berisi game dan skormu. Teman yang buka melihat banner "siapa menantangmu di game apa" dan bisa langsung terima.
- Tombol **🖼️ Kartu** di layar hasil: bikin gambar kartu pamer (judul game, bintang, nama, level) untuk status WhatsApp atau IG. Di HP langsung terbagi, di komputer gambarnya terunduh dan teksnya tersalin.
- Tombol **🔥 Pamer Rajin** di footer beranda: pamer sudah berapa hari berturut-turut main.

## Statistik

Tautan **📊 Statistik** di footer beranda membuka dashboard: kunjungan, hari aktif, game dimainkan dan selesai, rata-rata bintang, bagikan, game teratas, aktif 7 hari, dan tayang/klik banner. Semua angka tersimpan lokal di browser dan dashboard jalan offline penuh. Kalau server statistik tersedia, angka global seluruh pemain tampil di bawahnya; pengiriman ringkasan anonim bisa dimatikan lewat `STATS_ON: false` di `js/config.js`.

Kontrak endpoint server (opsional, best-effort): `POST /stats` menerima body JSON sebagai `text/plain` (`{player_id, week_key, visits, days_active, plays, finishes, stars, shares, per_game, client_time}`, tanpa preflight CORS); `GET /stats/summary` mengembalikan `{visitors, plays, finishes, shares}`. Keduanya hanya dipanggil kalau `STATS_UP: true` di `js/config.js` (nyalakan setelah server siap; selama false tidak ada fetch statistik sama sekali).

## Banner promosi dan kelas

Banner di atas beranda diisi dari `TI_CONFIG.PROMOS` (berputar tiap hari, bisa ditutup sampai besok). Isi awal: kelas **Bikin Game Sendiri** untuk anak, landing di `#/kelas`. Isi `KELAS_URL` di `js/config.js` dengan tautan pendaftaran (misalnya WhatsApp); kalau kosong, tombol Daftar menampilkan "segera dibuka".

## Isi (100 game)

Gelombang 1-2 (1-50):

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

Gelombang 3 (51-100, rincian di `SPEC.md` bagian 9):

- Islam: Buru Asmaul Husna, Tertib Gerakan Shalat, Tebak Nabi dari Petunjuk, Takar Zakat Fitrah, Sehari Berpuasa, Lari ke Masjid, Pasangan Doa, Kapan Shalatnya, Warung Sedekah, Urut Kisah Nabi, Halal atau Haram, Tabung Infaq.
- Matematika: Balap Kali-kali, Pizza Pecahan, Menara Pola, Kembalian Kilat, Buru Bentuk, Tebak Berat, Lompat Bintang, Bagi Permen, Jam Cocok, Sortir Bangun, Toples Tebakan, Belah Buah Hitung.
- Sains: Pancing Magnet, Roket Air, Tebak Bayangan, Rumah Makhluk, Koper Cuaca, Tubuhku, Tebak Bunyi, Daur Hidup Kacang, Mendarat di Bulan, Katrol dan Tuas, Sambung Pipa, Penunjuk Arah, Siang atau Malam.
- Logika: Tebak Kode Warna, Labirin Es, Tangram Rumah, Parkir Pintar, Balik dan Ingat, Cermin Pola, Sambung Kabel, Teka-teki Siapa, Balok yang Pas, Pola Angka, Lawan Kata, Mana yang Beda, Raja Taman.

Gelombang 4 (101+, di luar target awal 100):

- Logika: Banjir Warna (101), Padamkan Lampu (102).

## Struktur

- `index.html` memuat `js/pron.js` (kamus ucapan), `js/core.js` (menu, suara, bintang, helper kuis), `js/progress.js` + `js/badges.js` + `js/share.js` + `js/board.js` (gamifikasi, berbagi, dan papan juara, kontraknya di `SPEC.md` bagian 8), `js/analytics.js` (statistik + `#/statistik`), `js/promo.js` (banner + `#/kelas`), lalu `games/NN-id.js`.
- `css/style.css` gaya bersama dan token gerak (aturan app-motion).
- `SPEC.md` kontrak pembuatan game plus seluruh bank soal. Konten agama hanya dari sini (gelombang 3 memakai ulang bank yang sudah ada).
- `tools/smoke.mjs` uji otomatis: `node tools/smoke.mjs --phone --max=300` membuka semua game di TK dan SD (tablet dan HP), main acak sampai selesai, catat error, simpan screenshot di `tools/shots/`.
- `tools/gami.mjs` uji gamifikasi dan fitur: migrasi data lama, XP, unlock, gratis harian, tantangan pekan, lencana, anti-farming, papan offline, berbagi, tantang, promo, statistik, dan banner ajakan.
- `tools/ui.mjs` uji tombol menu: jenjang, suara, tab, kembali, Escape, Main Lagi, bintang tersimpan.
- `tools/sheet.mjs tk` (atau `sd`, `tk-hp`, `sd-mid`, ...) menggabungkan screenshot semua game jadi satu gambar untuk dicek sekilas.

Menambah game: buat `games/NN-id.js` yang memanggil `TI.register({...})` (lihat `games/01-hijaiyah.js`), tambahkan `<script>` di `index.html` pada kelompok kategorinya. Deploy: push ke repo GitHub `BrianArfi/taman-ilmu`, Pages otomatis.

## Sebelum dibagikan luas

Teks Arab (huruf hijaiyah, Asmaul Husna, surat pendek) dan fakta kisah nabi sebaiknya dibaca ulang oleh ustadz/ustadzah atau guru TPA.
