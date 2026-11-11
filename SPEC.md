# Taman Ilmu: kontrak untuk pembuat game

50 mini game edukatif untuk anak TK (4-6 tahun) dan SD (7-12 tahun): Agama Islam, Matematika, Sains, Logika. Game 01-20 sudah jadi (bagian 6); game 21-50 adalah gelombang 2 (bagian 7).
Web statis, tanpa build step, harus jalan dengan klik dua kali `index.html` (file://). Jadi: **tanpa ES module, tanpa fetch, tanpa library luar**. Satu game = satu file `games/NN-id.js` yang memanggil `TI.register({...})`.

Contoh lengkap yang sudah jalan: `games/01-hijaiyah.js`. Baca dulu, ikuti polanya.

## 1. Aturan file

- Tulis HANYA file game milikmu (`games/NN-id.js`). Jangan ubah `js/core.js`, `css/style.css`, `index.html`, `SPEC.md`, `tools/`. Kalau butuh perubahan di inti, tulis di laporan akhir, jangan edit sendiri.
- Bungkus file dalam IIFE `(function () { ... })();`. Tanpa variabel global baru.
- CSS khusus game: `TI.style('<id>', \`...css...\`)` di awal `start()`. Prefix semua selector dengan `.play[data-game="<id>"]` supaya tidak bocor ke game lain.
- Id, nomor file, kategori, judul, dan ikon wajib sama dengan tabel di bagian 6 atau 7.
- Hati-hati `el.append(null)` bawaan DOM menulis teks "null"; `TI.h` aman karena melewati null.
- File coretan (skrip uji sendiri, screenshot tambahan) taruh di `C:\Users\Brian\AppData\Local\Temp\ti-<id-builder>\`, JANGAN di folder proyek.

## 2. API

```js
TI.register({
  id: 'wudhu', title: 'Urutan Wudhu', cat: 'islam' | 'mat' | 'sains' | 'logika',
  icon: '💧',            // emoji tanpa wajah, atau 1 huruf Arab
  desc: 'Satu kalimat pendek untuk kartu menu.',
  start(ctx) { ... }      // boleh return fungsi cleanup
});
```

Helper global `TI`: `h(tag, props, ...kids)` (props: `class`, `text`, `style` objek/string, `dataset`, `on:{click}`, `onclick`, atribut lain), `svg(tag, attrs, ...kids)`, `rand(a,b)` (int inklusif), `pick(arr)`, `shuffle(arr)` (salinan), `sample(arr,n)`, `numChoices(answer, n, min, max)`, `optionsFrom(correct, pool, n)`, `rupiah(n)` ("Rp3.000"), `dots(n)` (titik-titik untuk anak TK yang belum bisa baca angka), `reduced()` (prefers-reduced-motion), `style(id, css)`.

`ctx` (satu sesi main; semua timer otomatis dibersihkan saat keluar):

| API | Fungsi |
|---|---|
| `ctx.el` | elemen panggung (`#stage`, flex kolom, tengah). Render semua isi ke sini. |
| `ctx.level`, `ctx.isTK`, `ctx.isSD` | jenjang. **Setiap game wajib mendukung TK dan SD** dengan tingkat kesulitan berbeda. |
| `ctx.ask(text, {say, speak})` | set teks soal di bar atas + dibacakan. `say` = teks ucapan berbeda dari teks layar. |
| `ctx.say(text)` / `ctx.sayWait(text)` | bacakan saja / bacakan dan tunggu (ada batas waktu). |
| `ctx.sfx(name)` | `tap benar salah pop whoosh splash klik flip menang` |
| `ctx.choose({options, answer, layout, speakLabel, retry, into})` | tombol pilihan ganda, `await` sampai jawaban benar dipilih. `options`: string/angka, atau `{label, value, node, say, aria, cls}`. `node` = elemen custom (SVG, titik, huruf Arab). `cls:'is-big'` untuk tombol besar persegi. `layout`: `'is-col'` (jawaban teks panjang) atau `'is-grid2'`. `answer` = value atau fungsi. Salah = tombol dinonaktifkan, anak coba lagi; `retry:false` = langsung tunjukkan jawaban lalu lanjut. Return `{firstTry, value, button}`. |
| `ctx.order({items, guide, label, onStep})` | ketuk kartu sesuai urutan. `items` diberikan dalam URUTAN BENAR (`{label, icon, say, node}`), tampil diacak. `guide`: `'always'` (tiap langkah disebut, untuk TK), `'after-wrong'` (petunjuk setelah 2 salah, default), `'never'`. `start`: nomor slot pertama (default 1). |
| `ctx.sort({items, bins, onStep})` | satu benda tampil, anak mengetuk keranjang. `items: [{label, icon, bin, why, hint}]`, `bins: [{id, label, icon}]`. `why` dibacakan setelah benar (penjelasan sains). |
| `ctx.place({pieces, slots, tray, onPlace, onStep, move, multi})` | kepingan ke tempatnya: anak **ketuk kepingan lalu ketuk tempat, atau seret** (dua-duanya jalan, sentuh dan mouse). `pieces: [{id, label, icon, node, target, say, hideLabel}]` (`target` = id slot benar, string atau array). `slots: [{id, el, label}]`, `el` = elemen yang SUDAH kamu taruh di DOM (HTML atau SVG). Salah = `ctx.wrong` + kepingan balik. Kepingan HTML otomatis pindah ke dalam slot HTML; untuk slot SVG atau gambar khusus, `move:false` lalu gambar sendiri di `onPlace(piece, slot)` (boleh async). `multi:true` = satu slot boleh banyak kepingan. `collapse:true` = kepingan yang sudah terpasang (move:false) hilang dari nampan sehingga nampan menyusut. `tray` = elemen wadah kepingan (default dibuat di bawah panggung). `await` sampai semua terpasang. Dipakai untuk jigsaw, susun bentuk, rangkaian, label bagian tumbuhan. |
| `ctx.note(text, {title})` | kotak "Tahukah kamu?" + dibacakan. |
| `await ctx.next('Lanjut')` | tombol besar, tunggu diketuk. |
| `ctx.correct(el)` / `ctx.wrong(el)` | umpan balik manual (suara, warna, goyang, pujian). `wrong` menambah `ctx.mistakes`. Return Promise. |
| `ctx.series(items, async fn, finishOpts)` | jalankan soal satu per satu: bersihkan panggung, update progress, lalu `finish(finishOpts)`. Pola utama. |
| `ctx.progress(done, total)` | update bar progress manual (kalau tidak pakai series). |
| `ctx.finish({stars, total, lesson, message, celebrate})` | tampilkan layar hasil. Konfeti + suara menang otomatis untuk 2-3 bintang, 1 bintang tanpa konfeti (`celebrate` untuk memaksa). Bintang otomatis dari `ctx.mistakes / total` kalau `stars` tidak diisi. **Isi `lesson`** dengan 1-2 kalimat pelajaran. |
| `ctx.after(ms, fn)`, `ctx.wait(ms)`, `ctx.every(ms, fn)`, `ctx.loop((dt, now) => {...; return false untuk berhenti})`, `ctx.on(target, type, fn)`, `ctx.onExit(fn)` | timer, rAF, listener yang otomatis mati saat keluar game. JANGAN pakai `setTimeout`/`requestAnimationFrame`/`addEventListener` mentah ke `window`/`document`. |
| `ctx.alive` | false setelah anak keluar. Cek di loop panjang. |

Kelas CSS siap pakai: `.ti-choices` (+ `.is-col`, `.is-grid2`), `.choice` (+ `.is-big`, `.is-correct`, `.is-wrong`, `.is-hint`), `.ti-card`, `.ti-panel`, `.ti-big`, `.ti-arabic`, `.ti-row`, `.ti-stack`, `.ti-scene` (area gambar/permainan, `position:relative`, `overflow:hidden`, min-height 320px), `.ti-emoji-grid`, `.ti-dots`, `.ti-note`, `.ti-btn` (+ `.is-ghost`), `.ti-slider` (untuk `<input type=range>`), `.ti-label`, `.ti-toolbar` (baris tombol kecil), `.ti-help` (pakai bersama `.ti-btn.is-ghost` untuk tombol "💡 Bantu"), `.ti-tray`/`.ti-chip` (kepingan ctx.place, `.is-selected`), `.pop-in` (muncul halus; set `style="--i:N"` untuk stagger). Warna kategori di `var(--c)`. Token gerak: `--ease-out`, `--ease-in-out`, `--ease-pop`, `--dur-press` 120ms, `--dur-ui` 180ms, `--dur-ui-max` 300ms, `--dur-modal` 250ms, `--stagger`.

## 3. Aturan konten (wajib)

1. **Bahasa Indonesia** yang ramah anak, sapa anak dengan "kamu". Kalimat pendek. Tidak ada em-dash (—) atau en-dash (–) di mana pun; pakai koma, titik, atau tanda hubung biasa (-).
2. **Tidak ada wajah dan mata.** Dilarang emoji orang, wajah, hewan, atau apa pun yang punya mata: 😀🙂👶👦👧👨👩🧕🧔🐱🐶🐟🐠🐋🐘🐫🐪🐝🐜🦆🐔🐣🐸🐢🦋🤖👻⛄☃️🎅🎃🌞🌝🌚🌛🌜🃏🗿🧸🪆🎎🎭🗽💩🤡👽👾 dan sejenisnya. **📎 juga dilarang**: di Windows 11 tampil sebagai Clippy bermata (gambar klip sendiri pakai SVG). Kalau ragu sebuah emoji punya mata di Windows 11, jangan pakai. Boleh: benda, makanan, alam, bangunan, simbol, tangan/kaki tanpa wajah (🤲👐👋☝️👂👃🦶💪), ☀️ (bukan 🌞), 🌙 (bukan 🌛). Gambar SVG/CSS buatan sendiri juga tanpa wajah. Tidak ada gambar nabi, malaikat, atau sahabat dalam bentuk apa pun.
3. **Islam:** tulis "Nabi Muhammad Shallallahu 'alaihi wa sallam" lengkap, jangan "SAW". Nabi lain boleh diberi "'alaihis salam" di teks penjelasan. Tulis "Allah" biasa di layar (pengucapan TTS sudah diurus inti). **Teks Arab hanya yang tertulis di SPEC ini**, jangan mengarang teks Arab, ayat, atau hadits sendiri. Fakta agama hanya dari bank soal di bagian 6 dan 7.
4. **Tanpa musik.** Hanya `ctx.sfx` yang sudah ada. Jangan bikin melodi atau lagu.
5. Semua teks soal lewat `ctx.ask` (dibacakan). Untuk TK, anak belum bisa membaca: pilihan teks harus dibacakan saat diketuk (`speakLabel`, default true di TK), dan sebisa mungkin pakai gambar/ikon/titik.
6. Uang digambar sebagai koin bulat dan lembaran persegi berwarna dengan angka nominal saja (tanpa gambar pahlawan).

## 4. Aturan gerak (app-motion, Emil Kowalski)

- Animasi UI hanya `transform` dan `opacity`. Jangan animasikan width/height/top/left/margin. Jangan `transition: all`.
- Easing: masuk/keluar `var(--ease-out)`; benda yang pindah di layar `var(--ease-in-out)`. **Dilarang ease-in.** Durasi UI di bawah 300ms. Jangan pernah `scale(0)`; mulai dari `scale(0.95)` + `opacity:0`. Animasi yang sengaja lebih lama (perayaan, benda jatuh ke air, kapal berlayar) wajib diberi komentar `/* motion-ok: alasan */` di baris yang sama atau baris sebelumnya.
- Objek permainan yang bergerak terus (gelembung, bola, planet berputar): gerakkan dengan `ctx.loop` + `el.style.transform = 'translate3d(...)'` atau gambar di `<canvas>`. Tidak pakai left/top.
- `TI.reduced()` true: hilangkan gerak dekoratif dan loop; gerak yang ADALAH permainan (gelembung naik, bola dilempar) boleh tetap tapi lebih pelan/sederhana; transisi diganti fade.
- Cek: `node ~/.claude/skills/app-motion/scripts/motion-lint.mjs games/<file>` harus 0 error.

## 5. Interaksi, tata letak, uji

- Target sentuh minimal 64px, ramah tablet dan HP (lebar 390px). Tidak boleh ada scroll horizontal. Semua yang bisa diketuk adalah `<button>` atau punya atribut `data-tap` (alat uji mencari keduanya).
- Pakai event `click` untuk tombol. Untuk drag/geser pakai Pointer Events (`pointerdown/move/up`) atau `<input type=range class="ti-slider">`, bukan HTML5 drag-and-drop (tidak jalan di layar sentuh).
- **Setiap game harus bisa selesai** dengan ketukan acak dalam 160 aksi: jangan ada soal yang bisa macet selamanya. Pola: setelah 3 kali gagal di satu soal, tunjukkan jawaban/cara yang benar lalu lanjut.
- Satu sesi 6-10 soal (sekitar 2-4 menit). Selalu panggil `ctx.finish({ lesson })` di akhir (otomatis kalau pakai `ctx.series`).
- Canvas: ukur dari `clientWidth/clientHeight` elemen `.ti-scene` x `devicePixelRatio` (maks 2), atur ulang saat `resize` lewat `ctx.on(window, 'resize', ...)`.
- **Uji wajib sebelum lapor selesai** (dari folder `taman-ilmu`):
  - `node tools/smoke.mjs <id1> <id2> ... --phone` harus `OK` untuk semua baris (selesai, tanpa error JS, tanpa overflow). Untuk memory game tambah `--max=300`. Gelombang 2: `--phone --max=400 --time=150`. File game builder lain yang belum ada hanya dicatat di baris "belum ada", tidak membuat FAIL.
  - Buka screenshot di `tools/shots/<id>-<tk|sd>[-hp][-mid|-end].png` dan lihat sendiri: tata letak rapi, tidak terpotong, teks terbaca.
  - motion-lint 0 error.

## 6. Daftar 50 game

| No | id | Judul | cat | ikon | Builder |
|---|---|---|---|---|---|
| 01 | hijaiyah | Tebak Huruf Hijaiyah | islam | ب | (sudah jadi) |
| 02 | wudhu | Urutan Wudhu | islam | 💧 | A |
| 03 | rukun | Rukun Islam & Iman | islam | 🕋 | A |
| 04 | shalat | Shalat 5 Waktu | islam | 🕌 | A |
| 05 | nabi | Kuis Kisah Nabi | islam | 📜 | A |
| 06 | kartu | Kartu Pasangan | islam | 🎴 | A |
| 07 | adab | Ucapan & Adab Baik | islam | 🤲 | B |
| 08 | hitung | Ayo Berhitung | mat | 🍎 | B |
| 09 | gelembung | Pecah Gelembung | mat | 🫧 | B |
| 10 | banding | Lebih Besar, Lebih Kecil | mat | 🆚 | B |
| 11 | pola | Lanjutkan Pola | mat | 🔷 | B |
| 12 | bentuk | Kenal Bentuk | mat | 🔺 | C |
| 13 | jam | Jam Berapa? | mat | ⏰ | C |
| 14 | warung | Warung Jujur | mat | 🪙 | C |
| 15 | timbangan | Timbangan Seimbang | sains | ⚖️ | C |
| 16 | apung | Tenggelam atau Terapung | sains | ⛵ | C |
| 17 | magnet | Ajaib Magnet | sains | 🧲 | D |
| 18 | lempar | Lempar Tepat | sains | 🎯 | D |
| 19 | wujud | Es, Air, Uap | sains | 🧊 | D |
| 20 | tatasurya | Jelajah Tata Surya | sains | 🪐 | D |
| 21 | tangkap | Tangkap Hijaiyah | islam | 🧺 | lanjutan* |
| 22 | labirin | Labirin ke Masjid | islam | 🗺️ | lanjutan* |
| 23 | haji | Ayo Thawaf & Sa'i | islam | ⛺ | lanjutan* |
| 24 | puzzle | Puzzle Masjid | islam | 🖼️ | lanjutan* |
| 25 | surat | Surat Pendek | islam | 📖 | lanjutan* |
| 26 | bangun | Bangun Masjid | islam | 🏗️ | lanjutan* |
| 27 | kiblat | Arah Kiblat | islam | 🧭 | lanjutan* |
| 28 | hijriah | Kereta Bulan Hijriah | islam | 🚂 | lanjutan* |
| 29 | loncat | Loncat Angka | mat | 🎾 | lanjutan* |
| 30 | martabak | Bagi Martabak | mat | 🥧 | lanjutan* |
| 31 | menara | Menara Balok | mat | 🧱 | lanjutan* |
| 32 | balapan | Balapan Hitung | mat | 🏎️ | lanjutan* |
| 33 | rahasia | Angka Rahasia | mat | ❓ | lanjutan* |
| 34 | domino | Domino Hitung | mat | 🎲 | lanjutan* |
| 35 | grafik | Panen Buah & Grafik | mat | 📊 | lanjutan* |
| 36 | ukur | Ayo Mengukur | mat | 📏 | lanjutan* |
| 37 | listrik | Rangkaian Listrik | sains | 💡 | lanjutan* |
| 38 | bayangan | Cahaya & Bayangan | sains | 🔦 | lanjutan* |
| 39 | warna | Lab Warna & Pelangi | sains | 🎨 | lanjutan* |
| 40 | gesekan | Luncur Kotak | sains | 🛷 | lanjutan* |
| 41 | hujan | Siklus Air & Cuaca | sains | 🌧️ | lanjutan* |
| 42 | tanam | Ayo Menanam | sains | 🌱 | lanjutan* |
| 43 | laser | Cermin Ajaib | sains | 🪞 | lanjutan* |
| 44 | sudoku | Sudoku Mini | logika | 🔲 | lanjutan* |
| 45 | geser | Geser Angka | logika | 🔀 | lanjutan* |
| 46 | beda | Cari Perbedaan | logika | 🔎 | lanjutan* |
| 47 | ingat | Ingat Urutan | logika | 🧠 | lanjutan* |
| 48 | susun | Susun Bentuk | logika | 📐 | lanjutan* |
| 49 | hanoi | Menara Hanoi | logika | 🥞 | lanjutan* |
| 50 | mobil | Mobil Pintar | logika | 🚗 | lanjutan* |

\* Game 21-50 dibuat langsung sebagai file `games/NN-id.js` pada 31 Okt 2026 mengikuti kontrak di bagian 1-5 spesifikasi ini; rincian desain per game ada di file-nya sendiri. Rincian bank soal di bawah tabel ini (bagian 6.a dst.) baru mencakup game 01-20.

---

### 02 wudhu: Urutan Wudhu
Urutan (pakai persis, dengan ikon):
1. Niat dan membaca Bismillah 🤲
2. Mencuci kedua telapak tangan 👐
3. Berkumur-kumur 💦
4. Membersihkan hidung 👃
5. Membasuh wajah 💧
6. Membasuh kedua tangan sampai siku 💪
7. Mengusap sebagian kepala ✋
8. Membersihkan kedua telinga 👂
9. Membasuh kedua kaki sampai mata kaki 🦶
10. Berdoa setelah wudhu 🤲

- TK: dua babak `ctx.order` (langkah 1-5, lalu 6-10), `guide: 'after-wrong'`. Lalu 2 soal `choose` bergambar: "Wudhu memakai apa?" (💧 Air bersih benar; 🥛 Susu; 🧃 Jus) dan "Sebelum apa kita berwudhu?" (🕌 Shalat benar; 🍽️ Makan; 🛏️ Tidur).
- SD: satu babak penuh 10 langkah `guide: 'never'` (tampilkan nomor), lalu 3 soal "Setelah X, langkah berikutnya?" (3 pilihan dari daftar).
- Setelah babak urutan, `ctx.note`: "Yang wajib dalam wudhu: niat, membasuh wajah, membasuh tangan sampai siku, mengusap sebagian kepala, membasuh kaki sampai mata kaki, dan tertib (berurutan). Yang lain sunnah." (SD); TK cukup "Wudhu membuat kita bersih dan siap shalat."
- lesson: "Wudhu dilakukan berurutan, dimulai dengan niat dan diakhiri dengan doa."

### 03 rukun: Rukun Islam & Iman
Rukun Islam (urut): 1 Mengucapkan dua kalimat syahadat ☝️ · 2 Mendirikan shalat 🕌 · 3 Membayar zakat 🪙 · 4 Puasa di bulan Ramadhan 🌙 · 5 Pergi haji bagi yang mampu 🕋
Rukun Iman (urut, tanpa ikon, cukup nomor): 1 Iman kepada Allah · 2 Iman kepada malaikat · 3 Iman kepada kitab-kitab Allah · 4 Iman kepada para rasul · 5 Iman kepada hari akhir · 6 Iman kepada qada dan qadar
- TK: `order` Rukun Islam `guide:'always'` (setiap langkah disebut, anak cari ikonnya). Lalu 2 soal: "Ada berapa rukun Islam?" (pilihan angka 4/5/6 dengan `TI.dots`), "Puasa wajib di bulan apa?" (Ramadhan benar; Syawal; Muharram).
- SD: `order` Rukun Islam, `order` Rukun Iman (`guide:'after-wrong'`), lalu `sort` 6 kartu acak campuran ke keranjang "Rukun Islam" / "Rukun Iman". Lalu 1 soal: "Ada berapa rukun iman?" (6).
- lesson: "Rukun Islam ada 5 dan Rukun Iman ada 6. Rukun Islam adalah amalan, Rukun Iman adalah keyakinan di dalam hati."

### 04 shalat: Shalat 5 Waktu
Data: Subuh 2 rakaat (fajar, langit masih gelap kebiruan dengan semburat merah muda di ufuk, matahari belum terbit) · Zuhur 4 (siang, matahari tinggi, langit biru terang) · Ashar 4 (sore, matahari lebih rendah, langit kuning hangat) · Maghrib 3 (matahari terbenam setengah di ufuk, langit jingga-merah) · Isya 4 (malam, gelap, 🌙 dan bintang). Total sehari 17 rakaat.
- Gambar langit dibuat sendiri (div + gradient atau SVG) dengan posisi matahari/bulan, tanpa wajah. Siluet kubah masjid sederhana di bawah boleh.
- TK (6 soal): 3 soal "Ini waktu shalat apa?" (gambar langit, 3 pilihan nama, dibacakan saat diketuk), 3 soal "Shalat X berapa rakaat?" (pilihan 2/3/4 dengan `TI.dots` + angka).
- SD (8 soal): 2 soal gambar langit (4 pilihan), 2 soal rakaat, 1 `order` 5 shalat dari pagi (Subuh, Zuhur, Ashar, Maghrib, Isya) dengan langit mini sebagai `node`, 3 soal hitung: "Rakaat Subuh + Maghrib = ?" (5), "Zuhur + Ashar = ?" (8), "Berapa jumlah rakaat shalat wajib dalam sehari?" (17), acak urutannya.
- lesson: "Shalat wajib ada 5 waktu: Subuh, Zuhur, Ashar, Maghrib, Isya. Jumlahnya 17 rakaat sehari."

### 05 nabi: Kuis Kisah Nabi
Tanpa gambar orang. Tiap soal punya ikon petunjuk (benda) di kartu, teks soal, pilihan nama, lalu setelah benar tampilkan fakta (`ctx.note`, title "Kisahnya") dan `await ctx.next()` sebelum soal berikutnya. Bank soal (pakai persis):

| Soal | Jawaban | Pengecoh | Ikon | Fakta |
|---|---|---|---|---|
| Siapa manusia pertama yang diciptakan Allah? | Nabi Adam | Nabi Nuh, Nabi Musa | 🌍 | Nabi Adam 'alaihis salam adalah manusia pertama dan nabi pertama. |
| Nabi yang membuat kapal besar sebelum datang banjir besar? | Nabi Nuh | Nabi Yunus, Nabi Ibrahim | 🚢 | Kapal Nabi Nuh membawa orang-orang beriman dan hewan berpasang-pasangan. |
| Nabi yang tidak terbakar ketika dilempar ke dalam api? | Nabi Ibrahim | Nabi Isa, Nabi Daud | 🔥 | Allah membuat api menjadi dingin dan menyelamatkan Nabi Ibrahim. |
| Nabi yang memukulkan tongkatnya hingga laut terbelah? | Nabi Musa | Nabi Nuh, Nabi Sulaiman | 🌊 | Atas izin Allah laut terbelah, Nabi Musa dan kaumnya selamat menyeberang. |
| Nabi yang ditelan ikan besar lalu berdoa memohon ampun? | Nabi Yunus | Nabi Ayyub, Nabi Yusuf | 🤲 | Nabi Yunus terus berdoa di dalam perut ikan, lalu Allah menyelamatkannya. |
| Nabi yang bisa mengerti bahasa hewan, bahkan semut? | Nabi Sulaiman | Nabi Daud, Nabi Ismail | 👑 | Nabi Sulaiman mendengar semut berbicara, lalu tersenyum dan bersyukur kepada Allah. |
| Nabi yang menerima kitab Zabur? | Nabi Daud | Nabi Musa, Nabi Isa | 📖 | Nabi Daud juga pandai membuat baju besi. |
| Nabi yang menerima kitab Taurat? | Nabi Musa | Nabi Daud, Nabi Isa | 📖 | Taurat diturunkan kepada Nabi Musa untuk Bani Israil. |
| Nabi yang menerima kitab Injil? | Nabi Isa | Nabi Musa, Nabi Daud | 📖 | Nabi Isa atas izin Allah bisa berbicara ketika masih bayi. |
| Nabi terakhir yang menerima Al-Qur'an? | Nabi Muhammad | Nabi Isa, Nabi Ibrahim | 📗 | Nabi Muhammad Shallallahu 'alaihi wa sallam lahir di kota Makkah. Beliau adalah nabi terakhir. |
| Nabi yang sangat sabar walaupun sakit lama? | Nabi Ayyub | Nabi Yunus, Nabi Hud | 🌱 | Nabi Ayyub tetap sabar dan bersyukur, lalu Allah menyembuhkannya. |
| Nabi yang bermimpi melihat 11 bintang, matahari, dan bulan? | Nabi Yusuf | Nabi Ya'qub, Nabi Yunus | ⭐ | Nabi Yusuf kelak menjadi pemimpin yang jujur di negeri Mesir. |
| Nabi yang membangun Ka'bah bersama ayahnya, Nabi Ibrahim? | Nabi Ismail | Nabi Ishaq, Nabi Ya'qub | 🕋 | Nabi Ibrahim dan Nabi Ismail membangun Ka'bah di kota Makkah. |
| Nabi yang diberi mukjizat seekor unta betina untuk kaum Tsamud? | Nabi Shalih | Nabi Hud, Nabi Luth | 🪨 | Unta betina itu mukjizat dari Allah. Kaum Tsamud dilarang mengganggunya. |
| Nabi yang diutus kepada kaum 'Aad? | Nabi Hud | Nabi Shalih, Nabi Nuh | 🌬️ | Kaum 'Aad yang sombong tidak mau beriman kepada Allah. |
| Siapa ayah Nabi Yusuf? | Nabi Ya'qub | Nabi Ishaq, Nabi Ibrahim | 🏠 | Nabi Ya'qub sangat sayang kepada Nabi Yusuf. |
| Nabi Muhammad Shallallahu 'alaihi wa sallam lahir di kota? | Makkah | Madinah, Mesir | 🏙️ | Kota Makkah adalah tempat Ka'bah berada. |
| Ada berapa nabi dan rasul yang wajib kita ketahui? | 25 | 10, 99 | 📜 | Ada 25 nabi dan rasul yang namanya disebut dalam Al-Qur'an, dari Nabi Adam sampai Nabi Muhammad. |

- Untuk soal tentang Nabi Muhammad, label pilihan cukup "Nabi Muhammad", tapi fakta dan teks lain wajib lengkap "Shallallahu 'alaihi wa sallam".
- TK (6 soal, 3 pilihan, pilihan dibacakan saat diketuk): ambil dari 7 soal pertama (Adam, Nuh, Ibrahim, Musa, Yunus, Sulaiman) + soal Nabi Muhammad/Al-Qur'an. Ikon dibuat besar.
- SD (8 soal acak dari seluruh bank, 3 pilihan).
- lesson: "Para nabi adalah teladan. Mereka sabar, jujur, dan selalu taat kepada Allah."

### 06 kartu: Kartu Pasangan (memory)
Kartu tertutup dibalik dua-dua; pasangan cocok tetap terbuka. Animasi balik: `rotateY` 3D 250ms `--ease-in-out` (reduced: crossfade). Grid responsif, kartu besar, tanpa scroll di HP (maks 12 kartu untuk TK, 12 untuk SD).
- TK: dek "Benda Islami", pasangan kembar (6 pasang, 12 kartu): 🕌 Masjid, 🕋 Ka'bah, 📖 Al-Qur'an, 🌙 Bulan sabit, 🤲 Berdoa, 💧 Air wudhu. Nama dibacakan saat kartu dibuka.
- SD: layar awal pilih dek (3 tombol besar), lalu main:
  - Kitab & Nabi (4 pasang): Taurat - Nabi Musa; Zabur - Nabi Daud; Injil - Nabi Isa; Al-Qur'an - Nabi Muhammad (di kartu tulis "Nabi Muhammad" dan baris kecil "Shallallahu 'alaihi wa sallam").
  - Malaikat & Tugasnya (6 pasang diambil acak dari): Jibril - menyampaikan wahyu; Mikail - menurunkan hujan dan membagi rezeki; Israfil - meniup sangkakala; Izrail - mencabut nyawa; Munkar dan Nakir - bertanya di alam kubur; Raqib - mencatat amal baik; Atid - mencatat amal buruk; Malik - menjaga neraka; Ridwan - menjaga surga.
  - Asmaul Husna (6 pasang acak dari; kartu nama tampilkan Latin besar + Arab kecil `.ti-arabic`): Ar-Rahman الرحمن - Maha Pengasih; Ar-Rahim الرحيم - Maha Penyayang; Al-Malik الملك - Maha Merajai; Al-Quddus القدوس - Maha Suci; As-Salam السلام - Maha Memberi Keselamatan; Al-Khaliq الخالق - Maha Pencipta; Al-'Alim العليم - Maha Mengetahui; As-Sami' السميع - Maha Mendengar; Al-Bashir البصير - Maha Melihat; Al-Ghaffar الغفار - Maha Pengampun; Ar-Razzaq الرزاق - Maha Pemberi Rezeki; Al-Karim الكريم - Maha Mulia.
  - Kartu pasangan beda warna untuk sisi "nama" dan sisi "arti/tugas".
- Progress = pasangan ketemu / total. `ctx.wrong` JANGAN dipakai untuk tiap salah buka (terlalu sering); hitung sendiri `miss`, lalu `finish({ stars: miss <= pasangan ? 3 : miss <= pasangan * 2 ? 2 : 1 })`.
- lesson TK: "Masjid tempat kita shalat, Al-Qur'an kitab suci kita." SD sesuai dek (mis. "Allah menurunkan 4 kitab: Taurat, Zabur, Injil, dan Al-Qur'an.").

### 07 adab: Ucapan & Adab Baik
Soal situasi (ikon benda besar di kartu + teks), pilih ucapan/perbuatan yang benar. Bank:

| Situasi | Jawaban | Pengecoh | Ikon | Jenjang |
|---|---|---|---|---|
| Sebelum makan, kita membaca? | Bismillah | Alhamdulillah, Astaghfirullah | 🍚 | TK SD |
| Selesai makan, kita mengucap? | Alhamdulillah | Bismillah, Insya Allah | 🍽️ | TK SD |
| Masuk rumah atau bertemu teman, kita mengucap? | Assalamu'alaikum | Alhamdulillah, Masya Allah | 🏠 | TK SD |
| Ada yang mengucap salam, kita menjawab? | Wa'alaikumussalam | Bismillah, Subhanallah | 👋 | TK SD |
| Makan dan minum memakai tangan? | Tangan kanan | Tangan kiri, Dua kaki | 🥛 | TK SD |
| Teman jatuh dan menangis, kita sebaiknya? | Menolong dan menghiburnya | Menertawakannya, Pergi saja | 🩹 | TK SD |
| Ada sampah di lantai, kita sebaiknya? | Membuangnya ke tempat sampah | Membiarkannya, Menendangnya | 🗑️ | TK SD |
| Setelah bersin, kita mengucap? | Alhamdulillah | Astaghfirullah, Bismillah | 💨 | SD |
| Teman bersin lalu mengucap Alhamdulillah, kita menjawab? | Yarhamukallah | Masya Allah, Insya Allah | 💬 | SD |
| Melihat pelangi yang indah, kita mengucap? | Masya Allah | Astaghfirullah, Innalillahi | 🌈 | SD |
| Berjanji akan datang besok, kita mengucap? | Insya Allah | Alhamdulillah, Masya Allah | 📅 | SD |
| Tidak sengaja berbuat salah, kita mengucap? | Astaghfirullah | Alhamdulillah, Insya Allah | 💭 | SD |
| Masuk masjid mendahulukan kaki? | Kaki kanan | Kaki kiri | 🕌 | SD |
| Masuk kamar mandi mendahulukan kaki? | Kaki kiri | Kaki kanan | 🚿 | SD |
| Orang tua memanggil, kita sebaiknya? | Segera datang dan menjawab dengan sopan | Pura-pura tidak dengar, Menjawab sambil marah | 📣 | SD |
| Teman memberi hadiah, kita mengucap? | Jazakallahu khairan | Astaghfirullah, Innalillahi | 🎁 | SD |

- TK: 7 soal TK, 3 pilihan, dibacakan saat diketuk. SD: 8 soal acak dari semua, 3 pilihan (soal 2 pilihan tetap 2).
- Setelah jawaban benar untuk ucapan, bacakan juga artinya singkat lewat `ctx.note` kecil (title "Artinya") dan `await ctx.next()`: Bismillah = "Dengan nama Allah"; Alhamdulillah = "Segala puji bagi Allah"; Assalamu'alaikum = "Semoga keselamatan untukmu"; Wa'alaikumussalam = "Semoga keselamatan juga untukmu"; Yarhamukallah = "Semoga Allah merahmatimu"; Masya Allah = "Atas kehendak Allah"; Insya Allah = "Jika Allah menghendaki"; Astaghfirullah = "Aku mohon ampun kepada Allah"; Jazakallahu khairan = "Semoga Allah membalasmu dengan kebaikan". Untuk soal perbuatan, tidak perlu note.
- lesson: "Anak shalih membiasakan ucapan baik dan adab yang baik setiap hari."

### 08 hitung: Ayo Berhitung
- Benda: 🍎 🍌 🍊 🍇 🍓 ⭐ 🎈 🌙 🍪 ⚽ (bergantian per soal).
- TK (8 soal): tampilkan 1-10 benda di `.ti-emoji-grid` (benda adalah `<button data-tap>` kecil: ketuk benda = muncul angka urutan di atasnya + suara angka, membantu menghitung; ketuk lagi tidak menghitung ulang). Soal "Ada berapa apel?" 3 pilihan angka besar (`is-big`).
- SD (8 soal): 4 soal hitung 11-30 benda tersusun per 10 (baris berisi 10), 4 soal perkalian kelompok: "Ada 4 piring, tiap piring ada 3 kue. Berapa kue semuanya?" (tampilkan piring sebagai kotak bulat berisi emoji; angka 2-5 x 2-6), 4 pilihan.
- Nama benda untuk soal: apel, pisang, jeruk, anggur, stroberi, bintang, balon, bulan, kue, bola.
- lesson: "Menghitung satu per satu dengan teliti membuat jawaban kita benar."

### 09 gelembung: Pecah Gelembung
Arkade. Gelembung bulat berisi angka naik pelan dari bawah ke atas `.ti-scene` (posisi via `transform: translate3d` di `ctx.loop`, bergoyang kiri-kanan sedikit), keluar atas lalu muncul lagi dari bawah dengan angka baru. Selalu ada minimal 1 gelembung jawaban benar di layar. Gelembung = `<button data-tap>` bulat (>= 72px TK, >= 64px SD), warna-warni semi transparan dengan kilap.
- Satu sesi = 10 jawaban benar (progress 0..10). Ketuk benar: gelembung pecah (pop, partikel kecil, `sfx('pop')`), target baru. Ketuk salah: gelembung goyang, `ctx.wrong`.
- TK: target "Pecahkan angka 5!" + `TI.dots(5)` di prompt/panel; angka 1-10; 5 gelembung; kecepatan pelan.
- SD: target soal "7 + 5" (penjumlahan dan pengurangan sampai 20, lalu 3 soal terakhir perkalian 2-5), angka di gelembung = hasil; 6 gelembung; sedikit lebih cepat.
- Reduced motion: gelembung tidak bergoyang dan bergerak lebih lambat.
- lesson TK: "Kamu sudah kenal angka 1 sampai 10!" SD: "Berhitung cepat itu latihan, makin sering makin lancar."

### 10 banding: Lebih Besar, Lebih Kecil
- TK (8 soal): dua kelompok benda (kiri dan kanan, 1-10 masing-masing, emoji sama) di dua panel tombol besar. Soal acak "Mana yang lebih banyak?" / "Mana yang lebih sedikit?". Tidak ada soal sama banyak di TK.
- SD (8 soal): tampil "47 ⬜ 52", anak pilih tombol `>` `<` `=`. 4 soal angka sampai 100, 4 soal bentuk hitungan: "8 + 5 ⬜ 12", "20 - 7 ⬜ 13" (beberapa harus `=`). Kotak terisi simbol setelah benar.
- Petunjuk SD sekali di awal (`ctx.note`): "Ujung lancip menunjuk angka yang lebih kecil. Mulut yang terbuka menghadap angka yang lebih besar." (tanpa gambar buaya).
- lesson: "Tanda > artinya lebih besar, < artinya lebih kecil, = artinya sama dengan."

### 11 pola: Lanjutkan Pola
Baris pola dengan kotak "?" di akhir, pilih yang tepat.
- TK (8 soal): pola AB, AAB, ABB, ABC dari emoji (🍎🍌, 🔴🔵, ⭐🌙, 🟢🟡🟣, ☀️🌙, 🔺🟦) dan warna; panjang 5-7 item + "?"; 3 pilihan gambar.
- SD (8 soal): 4 pola angka (+2, +5, +10, -3, x2: mis. 2, 4, 6, 8, ?; 5, 10, 15, ?; 20, 17, 14, ?; 1, 2, 4, 8, ?), 2 pola bentuk ABCD/AABB, 2 pola bertumbuh (1, 3, 6, 10, ? atau 🟦, 🟦🟦, 🟦🟦🟦). 4 pilihan.
- Setelah benar, "?" berubah jadi jawabannya dengan pop.
- lesson: "Pola adalah sesuatu yang berulang dengan aturan. Kalau tahu aturannya, kita bisa menebak lanjutannya."

### 12 bentuk: Kenal Bentuk
Bentuk digambar sendiri dengan SVG (warna cerah, garis tebal): lingkaran, segitiga, persegi, persegi panjang, belah ketupat, trapesium, segi lima, segi enam, oval, bintang, setengah lingkaran.
- TK (8 soal): 5 soal "Mana lingkaran?" (3 pilihan SVG, nama dibacakan saat diketuk; bentuk TK: lingkaran, segitiga, persegi, persegi panjang, bintang, oval) + 3 soal "Cari semua segitiga!": 6-9 bentuk acak berserakan di `.ti-scene` sebagai `<button data-tap>`, ketuk semua yang dimaksud (salah = `ctx.wrong`), selesai saat semua ketemu.
- SD (8 soal): "Bentuk apa ini?" (nama, 4 pilihan), "Berapa sisi segi enam?" (dan bentuk lain), "Bangun yang keempat sisinya sama panjang dan keempat sudutnya siku-siku?" (persegi), benda nyata: "Roda sepeda berbentuk?" (lingkaran), "Papan tulis biasanya berbentuk?" (persegi panjang), "Kubah masjid berbentuk seperti?" (setengah bola, pengecoh kubus, tabung).
- lesson: "Segitiga punya 3 sisi, persegi 4 sisi sama panjang, lingkaran tidak punya sudut."

### 13 jam: Jam Berapa?
Jam analog SVG sendiri: angka 1-12, jarum pendek tebal (jam) dan jarum panjang (menit) beda warna. Jarum jam bergeser sesuai menit (mis. 3.30 jarum pendek di antara 3 dan 4).
- TK (8 soal): hanya jam tepat (1-12). "Jam berapa ini?" 3 pilihan ("Jam 3"), dibacakan. 2 soal sebaliknya: "Mana jam 7?" dengan 3 pilihan jam analog kecil.
- SD (8 soal): jam tepat, setengah, seperempat, kelipatan 5 menit. Pilihan format digital "03.30". Ucapan TTS: "jam tiga lewat tiga puluh menit". Setelah benar soal jam setengah, `ctx.note` sekali: "Jam 03.30 sering disebut setengah empat." 2 soal kegiatan: "Kamu berangkat sekolah jam 06.45. Mana jamnya?" (pilihan jam analog).
- lesson: "Jarum pendek menunjuk jam, jarum panjang menunjuk menit."

### 14 warung: Warung Jujur
Warung kecil (rak dengan barang emoji: 🍞 Roti, 🥛 Susu, 🍌 Pisang, ✏️ Pensil, 📒 Buku, 🧃 Jus, 🍪 Kue, 🍉 Semangka). Uang digambar: koin bulat (Rp500, Rp1.000) dan lembaran persegi panjang berwarna (Rp2.000, Rp5.000, Rp10.000, Rp20.000), hanya angka nominal.
- Tipe A "Bayar pas": barang + harga, anak mengetuk uang di dompet untuk menaruhnya di nampan (ketuk uang di nampan = ambil kembali), total nampan tampil, tombol "Bayar". Kurang/lebih: umpan balik "Uangnya kurang Rp1.000" / "Kelebihan, warung jujur bayar pas ya". Setelah 3 kali salah: nampan diisi otomatis dengan cara yang benar, lalu lanjut.
- Tipe B "Kembalian" (SD): "Harga Rp7.000, kamu bayar Rp10.000. Berapa kembaliannya?" 4 pilihan rupiah.
- TK (6 soal): harga Rp1.000-Rp5.000, dompet hanya koin Rp1.000 (bisa ditaruh berkali-kali, dompet tidak habis). Ucapan "seribu", "dua ribu" dst lewat teks rupiah.
- SD (8 soal): 5 tipe A (harga Rp2.500-Rp35.000 kelipatan 500, beberapa pakai 2 barang dijumlah), 3 tipe B.
- lesson: "Pedagang dan pembeli yang jujur disukai Allah. Bayar dengan uang yang pas dan hitung kembalian dengan teliti."

### 15 timbangan: Timbangan Seimbang
Timbangan SVG: tiang, lengan, dua piring. Lengan miring dengan `transform: rotate()` 300ms `--ease-in-out` ke sisi yang lebih berat (maks 14 derajat), piring tetap tegak (counter-rotate atau hitung posisi).
- TK (8 soal): dua benda di dua piring (timbangan masih datar dan tertutup kain/"?"), "Mana yang lebih berat?" anak ketuk piring/tombol kiri/kanan, lalu timbangan miring menunjukkan jawaban. Pasangan: 🍉 semangka vs 🍒 ceri, 🧱 batu bata vs 🪶 bulu, 📚 tumpukan buku vs ✏️ pensil, 🥥 kelapa vs 🍇 anggur, 🪨 batu vs 🍃 daun, 🛞 roda vs 🔑 kunci, 🍍 nanas vs 🍓 stroberi, 🎒 tas penuh buku vs 🧦 kaus kaki.
- SD (8 soal): balok berlabel kg. Kiri berisi beberapa balok (mis. 3 kg + 4 kg), kanan 2 kg + "?". "Berapa kg agar seimbang?" 4 pilihan; setelah pilih, balok jatuh ke piring dan lengan bergerak (seimbang = datar). 2 soal satuan: "1 kg = berapa gram?" (1.000), "Mana yang lebih berat: 1 kg kapas atau 1 kg besi?" (Sama berat).
- lesson: "Timbangan seimbang kalau berat kedua sisi sama. Allah juga memerintahkan kita menimbang dengan adil."

### 16 apung: Tenggelam atau Terapung
`.ti-scene` akuarium: air biru dengan permukaan bergelombang halus, dasar pasir. Benda muncul di atas air, anak tebak dua tombol besar "Terapung ⬆️" / "Tenggelam ⬇️", lalu benda jatuh ke air (`ctx.loop`, ada percikan `sfx('splash')`), mengapung naik-turun di permukaan atau turun pelan ke dasar. Lalu penjelasan `why` (dibacakan), `await ctx.next()`. Tebakan salah = `ctx.wrong` tapi tetap tunjukkan hasilnya (tidak diulang).
Benda (hasil, penjelasan singkat):
- 🪵 Kayu: terapung, kayu lebih ringan dari air.
- 🪨 Batu: tenggelam, batu padat dan berat.
- 🔩 Paku besi: tenggelam, besi lebih berat dari air walau kecil.
- ⚽ Bola: terapung, di dalam bola ada udara.
- 🍃 Daun: terapung, daun tipis dan ringan.
- 🔑 Kunci: tenggelam, terbuat dari logam.
- 🍎 Apel: terapung, di dalam apel ada banyak udara.
- 🧊 Es batu: terapung, es lebih ringan dari air.
- 🥚 Telur: tenggelam di air tawar. (SD tambah: "Kalau airnya diberi banyak garam, telur bisa terapung!")
- 🥄 Sendok logam: tenggelam.
- 🥥 Kelapa: terapung, sabutnya berisi udara.
- ✂️ Gunting: tenggelam, terbuat dari logam.
- TK: 6 benda, kalimat sederhana. SD: 8 benda + 1 soal akhir `choose`: "Kapal dari besi bisa terapung karena?" Jawaban: "Bentuknya lebar dan berisi banyak udara"; pengecoh "Kapalnya sangat ringan", "Kapal didorong angin".
- lesson: "Benda yang lebih ringan dari air akan terapung, benda yang lebih berat akan tenggelam."

### 17 magnet: Ajaib Magnet
Magnet U merah-biru (SVG). Benda tampil, anak tebak "Menempel 🧲" / "Tidak menempel", lalu magnet bergerak mendekat (transform); kalau menempel, benda melompat menempel ke ujung magnet (`sfx('klik')`), kalau tidak, benda diam. `why` dibacakan, `await ctx.next()`. Tebakan salah = `ctx.wrong`, hasil tetap ditunjukkan.
Benda: 🔩 Paku besi (menempel, terbuat dari besi) · 🧷 Peniti (menempel, dari baja) · 📎 Klip kertas (menempel, dari besi) · ✂️ Bagian besi gunting (menempel) · 🥫 Kaleng susu (menempel, kalengnya dari besi) · 🪵 Kayu (tidak) · 📄 Kertas (tidak) · 🧽 Spons (tidak) · ✏️ Pensil kayu (tidak) · 👕 Baju kain (tidak) · 🥛 Gelas kaca (tidak) · 🥤 Sedotan plastik (tidak) · 💍 Cincin emas (tidak, SD: "emas bukan logam yang ditarik magnet") · 🥫 Kaleng minuman aluminium (tidak, SD: "aluminium tidak ditarik magnet").
- TK: 6 benda (3 menempel, 3 tidak, tanpa emas/aluminium). SD: 8 benda + 2 soal kutub: dua magnet batang (U merah, S biru) digambar, "Kutub U didekatkan ke kutub U, apa yang terjadi?" (Tolak-menolak) dan "Kutub U didekatkan ke kutub S?" (Tarik-menarik); setelah benar, animasikan dua magnet menjauh/mendekat.
- lesson: "Magnet menarik benda dari besi dan baja. Kutub yang sama tolak-menolak, kutub berbeda tarik-menarik."

### 18 lempar: Lempar Tepat (gravitasi)
`<canvas>` di `.ti-scene`: tanah, langit, pelontar di kiri, keranjang target 🧺 (digambar) di kanan pada jarak berbeda. Bola dilempar dengan fisika proyektil sungguhan: `x = v·cosθ·t`, `y = v·sinθ·t - ½·g·t²`, jejak titik-titik terlihat. Kontrol di bawah scene: slider "Kekuatan" (dan "Sudut" untuk SD) `.ti-slider` + tombol besar "Lempar!". Kena jika bola masuk area keranjang.
- TK: 5 target, sudut tetap 45 derajat, hanya slider kekuatan, keranjang lebar. Panduan suara setelah meleset: "Terlalu jauh! Kurangi kekuatannya." / "Kurang jauh! Tambah kekuatannya."
- SD: 6 target, slider sudut (15-75) dan kekuatan, keranjang lebih kecil, 1 target dengan tembok penghalang, target terakhir "di Bulan": gravitasi 1/6, langit hitam berbintang, bola melayang jauh lebih lama (catatan: "Gravitasi di Bulan lebih kecil, jadi bola melayang lebih jauh").
- Setiap target: maksimal 3 lemparan; meleset = `ctx.mistakes++` (pakai `ctx.wrong(null, {say: '...petunjuk...'})`); setelah 3 kali meleset, tunjukkan lintasan yang benar (garis putus-putus) lalu lanjut. Progress = target selesai.
- Bintang: `finish({ stars: miss <= jumlahTarget ? 3 : miss <= jumlahTarget * 2 ? 2 : 1 })`.
- lesson: "Bola selalu jatuh ke bawah karena gravitasi bumi. Kekuatan dan sudut lemparan menentukan jauhnya."

### 19 wujud: Es, Air, Uap
Bagian 1 "Lab panas dingin": panci/gelas di atas kompor (SVG/div), termometer di samping. Isi berubah sesuai suhu: di bawah 0°C es batu (kotak biru muda), 1-99°C air (biru dengan permukaan bergelombang), 100°C ke atas uap (partikel putih naik lewat `ctx.loop`). Tugas: "Buat es mencair!" (membeku -> mencair), "Buat air menguap!", "Uap jadi air lagi! (mengembun)", "Buat air membeku!".
- TK: tombol besar "🔥 Panaskan" / "❄️ Dinginkan" (tiap ketuk ±25°C), 3 tugas (mencair, menguap, membeku), istilah sederhana.
- SD: slider suhu -20 sampai 120°C (`.ti-slider`, cek saat `change`), 4 tugas dengan istilah mencair, menguap, mengembun, membeku, `ctx.note` istilah tiap selesai. Setelah 4 kali cek tidak sesuai, set otomatis ke suhu yang benar dan lanjut.
Bagian 2 `ctx.sort` ke "Padat 🧱" / "Cair 💧" / "Gas 💨": 🪨 Batu (padat) · 🧊 Es batu (padat) · 🪵 Kayu (padat) · 📕 Buku (padat) · 🥛 Susu (cair) · 🍯 Madu (cair) · 🧃 Jus (cair) · 💧 Air (cair) · 🎈 Udara di dalam balon (gas) · ♨️ Uap air panas (gas) · 💨 Asap (gas). Isi `why` singkat ("Benda padat bentuknya tetap", "Benda cair mengikuti bentuk wadahnya", "Gas mengisi seluruh ruang").
- TK: 4 benda sortir (padat dan cair saja, 2 keranjang). SD: 6 benda, 3 keranjang.
- Progress = tugas + benda.
- lesson: "Air bisa berwujud padat (es), cair (air), dan gas (uap). Panas dan dingin yang mengubahnya."

### 20 tatasurya: Jelajah Tata Surya
Planet digambar sendiri (lingkaran gradient CSS/SVG, warna khas, Saturnus bercincin, Bumi biru-hijau, Matahari kuning menyala), tanpa wajah. Latar langit gelap berbintang.
Data urut dari Matahari: Merkurius (paling dekat Matahari, paling kecil), Venus (paling panas), Bumi (rumah kita, ada air dan kehidupan), Mars (planet merah), Jupiter (paling besar), Saturnus (cincinnya paling indah), Uranus (berputar miring), Neptunus (paling jauh dan sangat dingin). Matahari adalah bintang. Bulan mengelilingi Bumi.
- TK (6 soal, pilihan gambar planet besar, nama dibacakan saat diketuk): "Mana Matahari?", "Mana Bumi?", "Mana planet yang punya cincin?" (Saturnus), "Mana Bulan?" (bulan abu-abu kecil), "Mana planet merah?" (Mars), "Mana planet paling besar?" (Jupiter, gambar paling besar).
- SD: `order` 8 planet dari yang paling dekat Matahari (node = planet mini + nama), lalu 5 soal fakta (4 pilihan): paling besar, paling panas, planet merah, paling dekat Matahari, Bumi urutan ke berapa (3). Planet di `order` boleh diam (tanpa orbit berputar) agar mudah diketuk.
- Hiasan opsional di layar akhir soal: Matahari dengan 8 planet beredar pelan (`ctx.loop`, hilang saat reduced motion).
- `ctx.note` di akhir sebelum finish (SD): "Allah berfirman: Matahari dan bulan beredar menurut perhitungan. (QS Ar-Rahman ayat 5)".
- lesson: "Ada 8 planet yang mengelilingi Matahari. Bumi adalah planet ketiga, rumah kita."


---

## 7. Gelombang 2: game 21-50

### 7.1 Prinsip "seru" (wajib)

Brian minta 30 game tambahan yang **seru**. Gelombang 1 kebanyakan kuis; gelombang 2 harus terasa seperti main:

- **Inti game adalah aksi**: menangkap, menyusun, menyetir, menyeret, meluncurkan, memecahkan puzzle. Pilihan ganda hanya pelengkap di sela aksi.
- **Umpan balik terasa** di setiap aksi berhasil: sfx, partikel kecil, benda memantul/bergoyang, angka "+1", penanda kemajuan di layar (menara makin tinggi, kereta makin panjang). Gagal tidak menghukum: lembut, langsung boleh coba lagi.
- **Kesulitan naik** di dalam satu sesi: level pertama mudah sekali, level terakhir menantang.
- **Sesi 2-4 menit.** Arkade real-time maksimal 60 detik dan selesai karena waktu atau jumlah habis, bukan karena harus menang.
- **Tombol 💡 Bantu** wajib di game puzzle (ditandai "Bantu" di bawah): `h('button', {class:'ti-btn is-ghost ti-help'}, '💡 Bantu')`, selalu terlihat. Ketuk ke-1 dan ke-2 di satu level: lakukan SATU langkah benar berikutnya (atau ungkap satu jawaban). Ketuk ke-3 di level yang sama: selesaikan level otomatis dengan animasi, lalu lanjut. Setiap ketuk Bantu menambah `ctx.mistakes` (bintang berkurang). Ini juga yang menjamin uji acak bisa selesai.
- **Setelah 3 kali gagal** di satu tantangan (cek salah, lemparan/dorongan meleset, program mobil menabrak): tunjukkan cara benar, lalu lanjut.
- **Seret selalu punya jalan ketuk** (ketuk pilih lalu ketuk tujuan) atau tombol panah. `ctx.place` sudah menangani ini.
- Tombol aksi utama (Jalankan, Cek, Dorong, Jatuhkan) besar, warna kategori, di bawah area main. Area main `.ti-scene` atau papan sendiri, harus muat di HP 390x844 tanpa scroll horizontal (scroll vertikal sedikit boleh).

### 7.2 Daftar

| No | id | Judul | cat | ikon | Builder |
|---|---|---|---|---|---|
| 21 | tangkap | Tangkap Hijaiyah | islam | 🧺 | E |
| 22 | labirin | Labirin ke Masjid | islam | 🗺️ | E |
| 23 | haji | Ayo Thawaf & Sa'i | islam | ⛺ | E |
| 24 | puzzle | Puzzle Masjid | islam | 🖼️ | E |
| 25 | surat | Surat Pendek | islam | 📖 | E |
| 26 | bangun | Bangun Masjid | islam | 🏗️ | F |
| 27 | kiblat | Arah Kiblat | islam | 🧭 | F |
| 28 | hijriah | Kereta Bulan Hijriah | islam | 🚂 | F |
| 29 | loncat | Loncat Angka | mat | 🎾 | F |
| 30 | martabak | Bagi Martabak | mat | 🥧 | F |
| 31 | menara | Menara Balok | mat | 🧱 | G |
| 32 | balapan | Balapan Hitung | mat | 🏎️ | G |
| 33 | rahasia | Angka Rahasia | mat | ❓ | G |
| 34 | domino | Domino Hitung | mat | 🎲 | G |
| 35 | grafik | Panen Buah & Grafik | mat | 📊 | G |
| 36 | ukur | Ayo Mengukur | mat | 📏 | H |
| 37 | listrik | Rangkaian Listrik | sains | 💡 | H |
| 38 | bayangan | Cahaya & Bayangan | sains | 🔦 | H |
| 39 | warna | Lab Warna & Pelangi | sains | 🎨 | H |
| 40 | gesekan | Luncur Kotak | sains | 🛷 | H |
| 41 | hujan | Siklus Air & Cuaca | sains | 🌧️ | I |
| 42 | tanam | Ayo Menanam | sains | 🌱 | I |
| 43 | laser | Cermin Ajaib | sains | 🪞 | I |
| 44 | sudoku | Sudoku Mini | logika | 🔲 | I |
| 45 | geser | Geser Angka | logika | 🔀 | I |
| 46 | beda | Cari Perbedaan | logika | 🔎 | J |
| 47 | ingat | Ingat Urutan | logika | 🧠 | J |
| 48 | susun | Susun Bentuk | logika | 📐 | J |
| 49 | hanoi | Menara Hanoi | logika | 🥞 | J |
| 50 | mobil | Mobil Pintar | logika | 🚗 | J |

---

### 21 tangkap: Tangkap Hijaiyah
Arkade. Huruf hijaiyah di dalam gelembung bulat jatuh pelan dari atas `.ti-scene`; keranjang (SVG) di bawah digeser dengan seret di area scene ATAU tombol besar ⬅️ ➡️ di bawah scene (wajib ada). Huruf target tertangkap: +1, sfx pop, nama huruf dibacakan, keranjang memantul. Huruf lain tertangkap: keranjang goyang, `ctx.wrong(null, {say:false})`. Huruf yang lolos ke bawah hilang pelan.
- Data huruf persis sama dengan `games/01-hijaiyah.js` (salin array HURUF). ح dan ه tidak boleh jadi target dan pengecoh di babak yang sama.
- TK: 3 babak, target satu huruf per babak ("Tangkap huruf Ba!" + huruf besar di panel atas scene). Babak selesai saat 3 target tertangkap atau 12 huruf sudah jatuh. Maksimal 2 huruf di layar, jatuh pelan.
- SD: "Tangkap berurutan!": target adalah huruf berikutnya dalam urutan hijaiyah, mulai dari huruf acak no 1-20, tangkap 8 huruf berurutan. Panel menampilkan huruf terakhir yang tertangkap dan "berikutnya: ?". Bar waktu 60 detik; habis = selesai. Maksimal 3 huruf di layar.
- lesson: "Makin sering melihat huruf hijaiyah, makin lancar membaca Al-Qur'an."

### 22 labirin: Labirin ke Masjid (Bantu)
Labirin grid dibuat acak (recursive backtracker, pasti ada jalan), dinding garis tebal, lantai cerah. Pemain = bola berwarna (tanpa wajah) di pojok kiri atas; masjid kecil (SVG atau 🕌) di pojok kanan bawah; 💧 (air wudhu) di satu sel acak yang jauh dari start. Gerak dengan tombol panah besar ⬆️⬇️⬅️➡️ (wajib), swipe di labirin, dan tombol panah keyboard (`ctx.on(document, 'keydown', ...)`). Gerak = bola meluncur satu sel (transform 120ms). Tabrak dinding = goyang kecil (bukan mistake). Sampai masjid tanpa 💧: "Wudhu dulu ya!", masjid belum terbuka. Ambil 💧: sfx splash + percikan.
- TK: 3 labirin 5x5. SD: 3 labirin 6x6, 7x7, 8x8, ditambah 2-3 ⭐ bonus opsional (dihitung di panel).
- 💡 Bantu: satu langkah sepanjang jalur terpendek (BFS) ke 💧 dulu lalu ke masjid; ketuk ke-3 = bola berjalan otomatis sampai masjid.
- Setelah tiap labirin, `ctx.note` adab ke masjid (berurutan): 1 "Sebelum ke masjid, kita berwudhu dan memakai pakaian yang bersih." 2 "Masuk masjid dengan kaki kanan dan berdoa." 3 "Di masjid kita tidak berlari dan tidak berteriak." lalu `await ctx.next()`.
- lesson: "Masjid adalah rumah Allah. Kita datang dalam keadaan bersih dan sopan."

### 23 haji: Ayo Thawaf & Sa'i
Fakta (pakai persis, jangan tambah): Thawaf = mengelilingi Ka'bah 7 kali, Ka'bah berada di sebelah kiri (berlawanan arah jarum jam). Sa'i = berjalan antara bukit Shafa dan Marwah 7 kali, dimulai di Shafa dan berakhir di Marwah, mengenang Siti Hajar mencari air untuk Nabi Ismail. Rukun haji urut: Ihram (niat dan memakai pakaian ihram), Wukuf di Arafah, Thawaf, Sa'i, Tahallul (memotong atau mencukur rambut). Haji dilaksanakan di bulan Dzulhijjah; wukuf di Arafah tanggal 9 Dzulhijjah. Haji adalah rukun Islam kelima, wajib bagi yang mampu.
- Babak Thawaf: tampak atas (SVG): Ka'bah kotak hitam bersabuk emas di tengah, lantai putih, lintasan lingkaran putus-putus. Titik pemain (lingkaran putih bersinar, tanpa wajah) berputar berlawanan jarum jam setiap anak mengetuk tombol besar "Langkah" (TK: 1 ketuk = 1/4 putaran; SD: 1/8) atau menyeret melingkar berlawanan jarum jam di scene. Seret searah jarum jam: "Ka'bah ada di sebelah kiri, putar ke arah sebaliknya ya." Tiap putaran penuh: angka besar 1..7 muncul, diucapkan, sfx benar; lampu kecil di sekeliling lintasan menyala satu per putaran.
- Babak Sa'i (SD): dua bukit (Shafa kiri, Marwah kanan) dengan jalan di antaranya; tombol besar bergantian "Jalan ke Marwah" / "Jalan ke Shafa"; titik pemain berjalan (transform ease-in-out), hitungan 1..7 dan diucapkan. Lalu soal "Sa'i ke-7 berakhir di bukit?" (Marwah; Shafa).
- TK: Thawaf, lalu 2 soal: "Berapa kali thawaf mengelilingi Ka'bah?" (7; 5; 10, dengan `TI.dots`), "Ka'bah ada di kota?" (Makkah; Madinah; Jakarta).
- SD: Thawaf, Sa'i, `ctx.order` 5 rukun haji, lalu "Haji dilaksanakan di bulan?" (Dzulhijjah; Ramadhan; Muharram).
- lesson: "Haji adalah rukun Islam kelima bagi yang mampu. Thawaf 7 kali mengelilingi Ka'bah, Sa'i 7 kali antara Shafa dan Marwah."

### 24 puzzle: Puzzle Masjid (Bantu)
Jigsaw dengan `ctx.place`. Gambar masjid DIGAMBAR SENDIRI dalam SVG (rapi, berwarna, langit di belakang, tanpa orang). Gambar dipotong grid: tiap keping = elemen dengan salinan SVG penuh yang di-clip/digeser (mis. div `overflow:hidden` berisi SVG yang di-translate) sehingga menampilkan bagiannya. Slot = sel grid di papan; TK menampilkan gambar samar (opacity 0.18) di papan sebagai petunjuk, SD 0.08.
Gambar dan fakta (pakai persis):
1. **Masjidil Haram**: Ka'bah kubus hitam dengan sabuk emas di tengah, pelataran putih melingkar, menara-menara tinggi di belakang. Fakta: "Masjidil Haram ada di kota Makkah. Di tengahnya ada Ka'bah, kiblat umat Islam saat shalat."
2. **Masjid Nabawi**: kubah HIJAU, menara putih tinggi, payung-payung putih besar di halaman. Fakta: "Masjid Nabawi ada di kota Madinah. Masjid ini dibangun oleh Nabi Muhammad Shallallahu 'alaihi wa sallam."
3. **Masjid Istiqlal**: kubah putih besar bulat, satu menara tinggi ramping, bangunan putih bertingkat. Fakta: "Masjid Istiqlal ada di Jakarta. Inilah masjid terbesar di Asia Tenggara."
- TK: 2x2 (4 keping). SD: 3x3 (9 keping).
- 💡 Bantu: pasang satu keping benar (pindahkan kepingnya ke slot dengan animasi); ketuk ke-3 = sisa keping terpasang semua.
- Setelah gambar lengkap: garis sambungan hilang (fade), sfx benar, `ctx.note(fakta, {title:'Tahukah kamu?'})`, `await ctx.next()`.
- lesson: "Tiga masjid terkenal: Masjidil Haram di Makkah, Masjid Nabawi di Madinah, dan Masjid Istiqlal di Jakarta."

### 25 surat: Surat Pendek
Mekanik **tarik garis**: kolom kiri kartu nama surat, kolom kanan kartu pasangannya (diacak). Anak ketuk kartu kiri lalu kartu kanan (atau seret dari kiri ke kanan, garis mengikuti jari). Garis SVG melengkung berwarna tergambar di lapisan di atas kedua kolom. Benar: garis tetap, kedua kartu hijau, sfx benar, nama surat dibacakan. Salah: garis merah memudar 300ms, `ctx.wrong`.
Data (pakai persis):

| Surat | Nomor | Jumlah ayat | Isi singkat |
|---|---|---|---|
| Al-Fatihah | 1 | 7 | Pembuka Al-Qur'an, dibaca di setiap rakaat shalat |
| Al-'Ashr | 103 | 3 | Tentang pentingnya waktu |
| Al-Fil | 105 | 5 | Kisah pasukan bergajah |
| Quraisy | 106 | 4 | Tentang suku Quraisy |
| Al-Ma'un | 107 | 7 | Peduli anak yatim dan orang miskin |
| Al-Kautsar | 108 | 3 | Surat terpendek dalam Al-Qur'an |
| Al-Kafirun | 109 | 6 | Untukmu agamamu, untukku agamaku |
| An-Nashr | 110 | 3 | Pertolongan Allah dan kemenangan |
| Al-Ikhlas | 112 | 4 | Allah Maha Esa |
| Al-Falaq | 113 | 5 | Berlindung kepada Allah dari kejahatan |
| An-Nas | 114 | 6 | Surat terakhir dalam Al-Qur'an |

Fakta umum: Al-Qur'an terdiri dari 114 surat dan 30 juz.
- **Dalam satu babak, nilai di kolom kanan harus unik** (jangan dua surat dengan jumlah ayat sama di babak yang sama).
- TK: 3 babak x 3 pasang, surat dari: Al-Fatihah, Al-Ikhlas, Al-Falaq, An-Nas, Al-Kautsar, Al-'Ashr, An-Nashr. Kanan = jumlah ayat sebagai `TI.dots` + angka. Nama surat dibacakan saat kartu diketuk.
- SD: babak 1 surat ke jumlah ayat (4 pasang), babak 2 surat ke isi singkat (4 pasang), babak 3 surat ke nomor surat (4 pasang). Lalu soal: "Al-Qur'an terdiri dari berapa surat?" (114; 99; 30).
- lesson: "Al-Qur'an ada 114 surat. Ayo hafalkan surat-surat pendek, mulai dari Al-Fatihah sampai An-Nas."

### 26 bangun: Bangun Masjid
Panggung atas: lahan kosong (SVG) dengan langit siang. Setiap jawaban BENAR menambah satu bagian masjid yang turun pas ke tempatnya (transform + sfx klik/pop, sedikit debu): 1 fondasi, 2 lantai, 3 dinding, 4 pintu, 5 jendela, 6 kubah, 7 menara, 8 bulan sabit di puncak kubah. Jawaban salah tidak mengurangi bangunan. Panggung bawah: soal `ctx.choose` (3 pilihan). Setelah 8 bagian: langit berubah malam, jendela menyala kuning, bintang muncul (dekorasi, statis saat reduced motion), lalu finish.
Bank soal (pakai persis; TK hanya baris bertanda TK, dibacakan saat diketuk):

| Soal | Jawaban | Pengecoh | TK |
|---|---|---|---|
| Ada berapa rukun Islam? | 5 | 4, 6 | TK |
| Ada berapa rukun Iman? | 6 | 5, 7 | |
| Kitab suci umat Islam adalah? | Al-Qur'an | Taurat, Zabur | TK |
| Shalat Subuh berapa rakaat? | 2 | 3, 4 | TK |
| Shalat Maghrib berapa rakaat? | 3 | 2, 4 | TK |
| Sebelum shalat kita berwudhu dengan? | Air bersih | Susu, Jus | TK |
| Huruf hijaiyah pertama adalah? | Alif | Ba, Ya | TK |
| Huruf hijaiyah terakhir adalah? | Ya | Alif, Mim | |
| Malaikat yang menyampaikan wahyu adalah? | Jibril | Mikail, Israfil | |
| Nabi terakhir adalah? | Nabi Muhammad | Nabi Isa, Nabi Adam | TK |
| Puasa wajib di bulan? | Ramadhan | Syawal, Rajab | TK |
| Kiblat umat Islam adalah? | Ka'bah | Masjid Istiqlal, Masjid Nabawi | TK |
| Sebelum makan kita membaca? | Bismillah | Alhamdulillah, Astaghfirullah | TK |
| Shalat wajib sehari ada berapa waktu? | 5 | 3, 7 | TK |
| Kitab Zabur diturunkan kepada? | Nabi Daud | Nabi Musa, Nabi Isa | |
| Hari raya setelah puasa Ramadhan adalah? | Idul Fitri | Idul Adha, Tahun Baru | |
| Zakat fitrah dibayar pada bulan? | Ramadhan | Muharram, Rajab | |
| Ibadah haji dilaksanakan di kota? | Makkah | Madinah, Jakarta | |

- TK 8 soal dari baris TK; SD 8 soal acak dari semua. Untuk soal "Nabi terakhir", fakta tambahan setelah benar: "Nabi Muhammad Shallallahu 'alaihi wa sallam adalah nabi terakhir."
- lesson: "Setiap ilmu yang kamu pelajari seperti batu bata. Sedikit demi sedikit menjadi bangunan yang kokoh."

### 27 kiblat: Arah Kiblat
Peta tampak atas: rumah kecil (SVG) di tengah, sajadah (persegi panjang hijau bermotif, ujung atas = arah hadap, ada tanda panah halus) yang bisa diputar dengan tombol besar ↺ ↻ (dan seret melingkar), mawar angin di pojok (U, T, S, B), Ka'bah kecil di tepi peta pada salah satu arah. Anak memutar sajadah menghadap Ka'bah lalu tekan "Cek". Benar: titik-titik jalur bercahaya dari sajadah ke Ka'bah, nama arah diucapkan ("Benar, ke barat laut"). Salah cek 3 kali: sajadah berputar sendiri ke arah benar. Putaran sajadah = transform rotate 200ms ease-in-out.
Arah (istilah persis): Utara, Timur Laut, Timur, Tenggara, Selatan, Barat Daya, Barat, Barat Laut.
- TK: 4 arah (atas/kanan/bawah/kiri, putar per 90 derajat), 5 soal "Putar sajadah menghadap Ka'bah!", lalu 1 soal "Saat shalat kita menghadap ke?" (Ka'bah; Matahari; Bulan).
- SD: 8 arah per 45 derajat, 5 soal putar, lalu 3 soal: "Matahari terbit di sebelah?" (Timur; Barat; Utara), "Matahari terbenam di sebelah?" (Barat; Timur; Selatan), "Dari Indonesia, kiblat menghadap ke arah?" (Barat Laut; Timur; Selatan). Note setelahnya: "Ka'bah ada di Makkah, di sebelah barat laut Indonesia. Karena itu di Indonesia kita shalat menghadap ke barat laut."
- lesson: "Kiblat adalah arah Ka'bah di Makkah. Dari Indonesia, kiblat ada di arah barat laut."

### 28 hijriah: Kereta Bulan Hijriah
Lokomotif (SVG tampak samping, tanpa wajah) di rel; gerbong-gerbong berwarna bertuliskan nama bulan berserakan di "stasiun" (tombol). Anak mengetuk gerbong berikutnya sesuai urutan → gerbong meluncur dan tersambung di belakang kereta (kereta bergeser agar gerbong terakhir terlihat). Salah: gerbong goyang, `ctx.wrong`; 2 salah pada langkah yang sama = gerbong yang benar berkedip (`is-hint`). Setelah lengkap, kereta berjalan keluar layar (motion-ok 1,5 detik, dilewati saat reduced motion).
Urutan bulan (persis): Muharram, Safar, Rabiul Awal, Rabiul Akhir, Jumadil Awal, Jumadil Akhir, Rajab, Sya'ban, Ramadhan, Syawal, Dzulqa'dah, Dzulhijjah.
Fakta (persis): Tahun baru Islam tanggal 1 Muharram. Nabi Muhammad Shallallahu 'alaihi wa sallam lahir di bulan Rabiul Awal. Puasa wajib di bulan Ramadhan. Idul Fitri tanggal 1 Syawal. Idul Adha tanggal 10 Dzulhijjah. Ibadah haji di bulan Dzulhijjah. Kalender Hijriah dimulai dari hijrah Nabi Muhammad Shallallahu 'alaihi wa sallam dari Makkah ke Madinah. Satu tahun Hijriah ada 12 bulan.
- TK: kereta 3 gerbong: Sya'ban, Ramadhan, Syawal (nama tiap gerbong berikutnya disebut, seperti `guide:'always'`). Lalu 3 soal: "Bulan puasa adalah bulan?" (Ramadhan; Syawal; Muharram), "Idul Fitri di bulan?" (Syawal; Ramadhan; Rajab), "Ada berapa bulan dalam setahun?" (12; 7; 30).
- SD: babak 1 gerbong 1-6, babak 2 gerbong 7-12 (nomor gerbong lanjut 7-12), lalu 4 soal fakta acak dari daftar fakta (3 pilihan nama bulan).
- lesson: "Kalender Hijriah punya 12 bulan, dimulai dari Muharram dan diakhiri Dzulhijjah."

### 29 loncat: Loncat Angka
Garis bilangan berupa batu bundar bernomor di atas sungai (SVG/DOM), bola (pemain) melompat dengan lintasan busur (`ctx.loop`, transform; sfx tap tiap mendarat, percikan kecil).
- TK (8 soal): batu 0-10. "Bola di angka 2. Loncat 3 kali!" Anak mengetuk tombol besar "Loncat!" (bola melompat satu batu tiap ketuk, angka hitungan diucapkan "satu, dua, tiga"), lalu "Sudah!". Jumlah lompatan pas = benar ("2 tambah 3 sama dengan 5"). Kurang/lebih = "Coba hitung lagi", bola kembali ke awal. 3 kali salah = bola melompat sendiri sambil menghitung, lalu lanjut.
- SD (8 soal): batu 0-20. Soal penjumlahan, pengurangan (lompat mundur), dan perkalian sebagai lompatan berulang dari 0 ("3 x 4": tiga lompatan besar masing-masing 4). Anak mengetuk batu tempat bola akan mendarat (batu = tombol); setelah benar, bola menunjukkan caranya dengan melompat. Salah = batu goyang, coba lagi.
- lesson: "Menambah artinya maju di garis bilangan, mengurangi artinya mundur."

### 30 martabak: Bagi Martabak
Martabak bundar (SVG, cokelat keemasan, taburan titik) dipotong n juring. Juring = `<path data-tap>`; ketuk untuk mengambil (juring bergeser keluar sedikit + warna lebih terang), ketuk lagi untuk batal; tombol "Cek". Pecahan ditampilkan bertingkat (pembilang di atas garis, penyebut di bawah) dengan HTML/CSS.
- TK (6 soal): "Mana yang dibagi dua sama besar?" (3 gambar: dua sama, dua tidak sama, tiga potong); "Ambil setengah!" (2 juring, ambil 1); "Martabak dipotong jadi berapa?" (hitung juring 2/3/4, pilihan angka + dots); "Ambil semua potongan!".
- SD (8 soal): "Ambil 3/4" (4 juring), "Ambil 2/6", "Ambil 1/2 dari martabak 8 potong" (4 juring), "Mana lebih besar, 1/2 atau 1/4?" (dua gambar), "1/2 dari 10 kue = ?" (5), "Martabak dipotong 8. Kamu makan 3. Bagian yang kamu makan?" (3/8; 3/5; 5/8), plus 2 soal ambil acak.
- 3 kali Cek salah: juring yang benar ditandai otomatis, lalu lanjut.
- lesson: "Pecahan adalah bagian dari keseluruhan. 1/2 artinya satu dari dua bagian yang sama besar."

### 31 menara: Menara Balok
Arkade susun. Balok berwarna berayun kiri-kanan di atas menara (`ctx.loop`, transform). Anak mengetuk scene atau tombol besar "Jatuhkan!" → balok jatuh; bagian yang menggantung di luar balok di bawahnya terpotong dan jatuh berputar; meleset total = balok jatuh ke tanah (sfx salah, `ctx.mistakes++`, balok tetap dihitung terpakai). Tepat sekali (selisih kecil) = "Pas!" + kilau. Menara naik, isi scene bergeser turun (transform) supaya puncak terlihat. Setiap balok bertuliskan nomor urutnya.
- TK: balok lebar, ayunan pelan, 8 balok. Setelah balok ke-3, ke-6, ke-8 (ayunan berhenti): soal "Ada berapa balok di menara?" (3 pilihan, `TI.dots`).
- SD: ayunan makin cepat, 10 balok. Setiap balok tingginya 3 cm (tertulis di panel). Setelah balok ke-4 dan ke-8: "Tiap balok tingginya 3 cm. Berapa tinggi menara?" (jumlah balok yang benar-benar berdiri x 3; 4 pilihan). Di akhir: "Berapa balok lagi supaya menara punya 15 balok?".
- Sesi selesai saat balok habis atau 60 detik; bintang dari jumlah meleset.
- lesson TK: "Menghitung benda bertumpuk: hitung dari bawah ke atas." SD: "Perkalian membantu menghitung cepat: 4 balok x 3 cm = 12 cm."

### 32 balapan: Balapan Hitung
Dua lintasan: mobil kamu (SVG tampak samping, merah) dan mobil lawan (biru), keduanya tanpa wajah. Hitung mundur 3-2-1 di awal (angka besar, sfx klik). Lawan maju terus dengan kecepatan tetap. Soal di bawah lintasan: benar = mobilmu melesat satu petak (sfx whoosh, garis kecepatan), salah = mobilmu diam sebentar, goyang. Finis = 8 jawaban benar. Siapa duluan sampai garis finis bendera kotak-kotak menang. Kalah tetap selesai: "Ayo coba lagi, kamu pasti bisa lebih cepat!".
- TK: soal hitung titik (pola dadu 1-6) dengan 3 pilihan angka; lawan finis dalam 60 detik.
- SD: penjumlahan dan pengurangan sampai 50, lalu perkalian 2-9; 4 pilihan; lawan finis dalam 45 detik.
- Bintang: menang dan salah maksimal 1 = 3; menang = 2; kalah = 1.
- lesson: "Latihan setiap hari membuat hitunganmu makin cepat."

### 33 rahasia: Angka Rahasia
Peti harta (SVG) terkunci menyimpan angka rahasia. Papan angka berupa tombol. Anak menebak: "Terlalu besar! Angkanya lebih kecil." (panah ⬇️) atau "Terlalu kecil! Angkanya lebih besar." (⬆️); semua angka yang tidak mungkin lagi berubah abu-abu dan nonaktif. Benar: peti terbuka, koin bintang memantul keluar, sfx menang kecil (`benar`).
- TK: angka 1-10, 3 babak; setelah tebakan, petunjuk visual titik lebih banyak/sedikit.
- SD: babak 1: 1-20, babak 2: 1-50, babak 3: 1-100 (papan 10x10, tombol minimal 34px; di HP papan boleh scroll vertikal). Tampilkan "Tebakan ke-N". Note sekali di awal SD: "Tips jagoan: tebak angka tengah dulu, supaya sisa pilihan tinggal separuh."
- Bintang dari total tebakan: TK ≤ 9 = 3, ≤ 15 = 2; SD ≤ 18 = 3, ≤ 27 = 2.
- lesson: "Petunjuk lebih besar dan lebih kecil membantu kita mencari jawaban dengan cerdas."

### 34 domino: Domino Hitung
Kartu domino digambar (persegi panjang krem, garis tengah, titik 0-6 berpola dadu).
- TK (8 soal): "Mana domino yang titiknya ada 5?" (3 pilihan domino, jumlah total titik), "Berapa titik di domino ini?" (3 pilihan angka + dots).
- SD (8 langkah): permainan sambung domino. Di meja ada rantai domino dengan ujung terbuka bernilai X (disorot). Anak memilih dari 4 domino di tangan yang salah satu sisinya X; domino meluncur dan tersambung (diputar bila perlu) dengan animasi. 5 langkah sambung, lalu 3 soal "Domino mana yang jumlah titiknya 9?" (nilai berbeda).
- lesson: "Menghitung titik dengan cepat: kenali pola titik seperti pada dadu."

### 35 grafik: Panen Buah & Grafik
Babak panen: keranjang berisi buah campur (🍎 apel, 🍌 pisang, 🍊 jeruk, 🍇 anggur). Anak mengetuk tiap buah (`button`) → buah terbang (transform) ke kolomnya di piktogram, menumpuk ke atas. Warna kolom konsisten: apel merah, pisang kuning, jeruk oranye, anggur ungu. Babak soal: tentang grafik.
- TK: 2 putaran; 3 jenis buah, total 6-9. Soal: "Buah apa yang paling banyak?" (pilihan ikon buah), "Ada berapa jeruk?" (angka + dots), "Buah apa yang paling sedikit?". Tidak boleh ada jumlah kembar untuk soal paling banyak/sedikit.
- SD: 2 putaran; 4 jenis buah, total 12-20; setelah piktogram, tampil diagram batang (batang tumbuh dengan transform scaleY, sumbu angka). Soal: paling banyak, paling sedikit, "Berapa selisih apel dan pisang?", "Berapa jumlah semua buah?" (4 pilihan).
- lesson: "Grafik membantu kita membandingkan banyak benda dengan sekali lihat."

### 36 ukur: Ayo Mengukur
Penggaris SVG kuning kayu (cm, garis tiap cm, angka tiap cm, 0-15). Benda digambar sendiri sederhana (pensil, krayon, penghapus, kunci, sendok, sikat gigi, daun) dengan panjang bulat.
- TK (8 soal): bandingkan 2-3 benda/pita: "Mana yang lebih panjang?", "Mana yang paling pendek?"; satuan tak baku: "Pensil ini panjangnya berapa klip?" (klip SVG berjajar di bawah benda, 3-6).
- SD (8 soal): baca penggaris "Berapa cm panjang pensil?" (benda mulai dari 0); 2 soal benda tidak mulai dari 0 (mis. ujung di 2 dan 9, jawab 7 cm); 1 soal geser penggaris dengan `.ti-slider` sampai angka 0 tepat di ujung benda lalu baca (3 kali salah = penggaris tergeser otomatis); "1 meter = berapa cm?" (100); "Mana yang lebih panjang: 1 meter atau 50 cm?".
- lesson: "Saat mengukur, mulai dari angka 0 pada penggaris."

### 37 listrik: Rangkaian Listrik
Papan rangkaian (SVG): baterai, kabel, lampu bohlam, dan satu celah (slot). Tiap benda: tanya dulu "Kalau [benda] dipasang, lampu menyala?" (Menyala / Tidak menyala) lalu benda dipasang ke celah (`ctx.place` dengan satu keping dan slot celah SVG, `move:false`, gambar benda di celah lewat `onPlace`; atau langsung otomatis setelah tebakan). Konduktor: arus mengalir (titik-titik bergerak di kabel lewat `ctx.loop`), lampu menyala kuning dengan glow, sfx klik. Isolator: lampu tetap mati. Tebakan salah = `ctx.wrong` tapi hasil tetap ditunjukkan dan dijelaskan, lalu `await ctx.next()`.
Benda (pakai persis): Paku besi (menghantar listrik) · Sendok logam (menghantar) · Kawat tembaga (menghantar) · Klip kertas besi, gambar SVG (menghantar) · Kunci besi (menghantar) · Penghapus karet (tidak) · Pensil kayu (tidak) · Sedotan plastik (tidak) · Kertas (tidak) · Gelas kaca (tidak) · Kain (tidak).
- WAJIB di awal, sekali: `ctx.note` "Ingat ya, jangan pernah memasukkan benda ke stop kontak di rumah. Listrik rumah berbahaya! Di sini kita hanya memakai baterai kecil." (title "Hati-hati!").
- TK: babak saklar: "Nyalakan lampunya!" tekan saklar besar (rangkaian tertutup, lampu menyala), lalu "Matikan lampunya!"; lalu 4 benda (2 menghantar, 2 tidak).
- SD: 6 benda, lalu 2 soal: "Lampu menyala jika rangkaiannya?" (Tertutup; Terbuka), "Benda yang bisa dialiri listrik disebut?" (Konduktor; Isolator).
- lesson: "Listrik mengalir lewat logam (konduktor), dan tidak mengalir lewat karet, kayu, dan plastik (isolator)."

### 38 bayangan: Cahaya & Bayangan
- TK (8 soal): "Mana bayangannya?" benda berwarna digambar SVG (payung, cangkir, kunci, pohon, rumah, bintang, kursi, kubah masjid) dengan 3 pilihan siluet hitam (satu benar, dua dari benda lain). 1 soal: "Kalau lampu dimatikan, bayangannya?" (Hilang; Makin besar; Berwarna).
- SD babak lab: tiang bendera di tanah lapang, matahari digeser dengan `.ti-slider` dari pagi (timur, kiri, rendah) ke siang (atas) ke sore (barat, kanan, rendah) mengikuti busur; bayangan (bentuk gelap di tanah) berubah arah dan panjang secara realistis (panjang sebanding 1/tan(tinggi matahari), dibatasi agar muat). Tugas: "Geser matahari sampai bayangan paling pendek!" (siang) dan "Buat bayangan mengarah ke kanan!" (pagi); dicek saat `change`, 4 kali tidak sesuai = matahari bergeser otomatis. Lalu 3 soal: "Pagi hari matahari di timur, bayangan mengarah ke?" (Barat; Timur; Atas), "Kapan bayangan paling pendek?" (Tengah hari; Pagi; Sore), "Bayangan terjadi karena cahaya?" (Terhalang benda; Dipantulkan cermin; Berwarna-warni).
- lesson: "Bayangan terjadi saat cahaya terhalang benda. Bayangan selalu berlawanan arah dengan sumber cahaya."

### 39 warna: Lab Warna & Pelangi
Tiga pot cat besar (merah, kuning, biru), satu pot putih (SD), dan mangkuk campur. Ketuk dua pot → cat mengalir ke mangkuk (animasi), mangkuk berubah ke warna hasil, nama warna diucapkan. Tombol "Kosongkan". Hasil (pakai persis): merah + kuning = jingga; kuning + biru = hijau; merah + biru = ungu; merah + kuning + biru = cokelat; warna apa pun + putih = lebih muda.
- TK (7 soal): 3 soal "Mana yang warnanya merah/kuning/biru?" (pilihan benda: 🍎, 🍌, 💧, 🥦); 4 soal campur: "Campur merah dan kuning, jadi warna apa?" anak mencampur sendiri dulu di lab, lalu pilih nama (pilihan berupa bulatan warna + nama, dibacakan).
- SD (8 soal): 4 soal tebak lalu buktikan ("Kuning + biru = ?" pilih dulu, lalu campur), 1 soal kebalikan "Untuk membuat ungu, campur?" (Merah dan biru; Kuning dan biru; Merah dan kuning), `ctx.order` warna pelangi (persis): merah, jingga, kuning, hijau, biru, nila, ungu (node = kotak warna + nama), lalu "Pelangi muncul karena?" (Cahaya matahari dibiaskan titik-titik air hujan; Awan dicat; Angin bertiup kencang). Note: "Cara mudah mengingat warna pelangi: me-ji-ku-hi-bi-ni-u."
- lesson: "Warna dasar merah, kuning, dan biru bisa dicampur menjadi warna-warna baru."

### 40 gesekan: Luncur Kotak
Tampak samping: peti kayu didorong pegas di kiri, meluncur di lantai, berhenti karena gesekan (fisika sungguhan: perlambatan = μ·g, jarak = v²/(2·μ·g), dianimasikan di `ctx.loop` atau canvas). Zona target hijau dengan bendera di kanan. Permukaan (μ): Es 🧊 0,05 (biru muda mengkilap), Lantai kayu 🪵 0,2, Rumput 🌿 0,4, Pasir 🏖️ 0,6. Kontrol: tombol permukaan bergambar, slider kekuatan dorong (SD), tombol "Dorong!". Kotak meninggalkan jejak garis. Berhenti di zona = berhasil (sfx benar, bendera berkibar). Petunjuk meleset: "Kurang jauh! Coba lantai yang lebih licin." / "Kebablasan! Pilih lantai yang lebih kasar." (SD: atau atur kekuatan).
- TK: kekuatan tetap; 5 tantangan, posisi target hanya cocok untuk satu permukaan; anak memilih permukaan.
- SD: 6 tantangan: kombinasi permukaan dikunci + atur kekuatan, atau kekuatan dikunci + pilih permukaan; satu tantangan "lantai licin karena tumpahan minyak" (μ 0,08). Soal penutup: "Mengapa sol sepatu dibuat bergerigi?" (Supaya gesekan besar dan tidak terpeleset; Supaya lebih ringan; Supaya cepat kotor).
- Maksimal 3 percobaan per tantangan, lalu ditunjukkan pilihan benar dan lanjut.
- lesson: "Permukaan kasar membuat gesekan besar sehingga benda cepat berhenti. Permukaan licin gesekannya kecil."

### 41 hujan: Siklus Air & Cuaca
Pemandangan SVG: laut di kiri, gunung di kanan, sungai, matahari, langit.
- SD babak 1: urutkan tahap siklus air (pakai `ctx.order` dengan `into` di bawah pemandangan, atau tombol tahap sendiri). Tahap (persis, urut): 1 Penguapan: matahari memanaskan air laut menjadi uap air. 2 Pengembunan: uap air naik dan berkumpul menjadi awan. 3 Hujan: titik air di awan makin berat lalu jatuh. 4 Aliran: air hujan mengalir lewat sungai kembali ke laut. Setiap tahap benar memutar animasinya di pemandangan (uap naik, awan menggelap, tetes hujan, sungai mengalir) dan teksnya dibacakan.
- SD babak 2: "Awan terbentuk dari?" (Uap air; Asap; Kapas), "Indonesia punya dua musim, yaitu?" (Musim hujan dan musim kemarau; Musim dingin dan musim panas; Musim salju dan musim semi), "Doa ketika turun hujan: Allahumma shayyiban nafi'an. Artinya?" (Ya Allah, turunkanlah hujan yang bermanfaat; Ya Allah, hentikanlah hujan; Selamat pagi semuanya). Setelah benar, note: "Doa ketika turun hujan: Allahumma shayyiban nafi'an, artinya Ya Allah, turunkanlah hujan yang bermanfaat (HR. Bukhari)." Hanya tulisan Latin, tanpa huruf Arab.
- TK (6 soal, pilihan bergambar, dibacakan): "Hari hujan, kita bawa apa?" (☂️ Payung; 🕶️ Kacamata hitam; ⚽ Bola), "Hari panas terik, kita pakai?" (🧢 Topi; 🧣 Syal; 🧤 Sarung tangan), "Hujan turun dari?" (☁️ Awan; ☀️ Matahari; 🌳 Pohon), "Ada petir, kita sebaiknya?" (🏠 Masuk ke rumah; 🌳 Berteduh di bawah pohon; ⚽ Main bola di lapangan), "Setelah hujan kadang muncul?" (🌈 Pelangi; ❄️ Salju; 🔥 Api), "Panas matahari membuat air laut menjadi?" (♨️ Uap air; 🧊 Es; 🪨 Batu). Di akhir, animasi siklus air diputar otomatis sambil dibacakan (lewati gerak saat reduced motion).
- lesson: "Air di bumi terus berputar: menguap, menjadi awan, turun sebagai hujan, lalu mengalir kembali ke laut."

### 42 tanam: Ayo Menanam
Pot berisi tanah (SVG) dan tombol besar: 💧 Siram, ☀️ Jemur, 🌙 Tidur (akhiri hari). Setiap hari tanaman butuh tepat 1 siram dan 1 jemur sebelum Tidur. Hari lengkap → saat Tidur langit malam sebentar, lalu pagi: tanaman tumbuh satu tahap dengan animasi (biji → kecambah → tunas dua daun → batang dan banyak daun → bunga → buah tomat). Siram kedua di hari yang sama: "Kebanyakan air, akarnya bisa busuk!" (mistake, tidak bertambah). Tidur tanpa siram atau jemur: tanaman sedikit layu, tidak tumbuh hari itu (mistake). Panel "Hari ke-N" dan indikator 💧☀️ hari ini. Batas 12 hari: kalau belum selesai, tanaman tetap tumbuh sampai berbuah dengan pesan "Akhirnya tumbuh! Ingat, tumbuhan butuh air dan cahaya setiap hari." Setelah berbuah: ketuk buah untuk panen (buah jatuh ke keranjang).
- TK: 5 tahap tumbuh, lalu 2 soal: "Tumbuhan butuh apa supaya tumbuh?" (💧☀️ Air dan cahaya matahari; 🍬 Permen; 📱 Ponsel), "Bagian tumbuhan yang ada di dalam tanah?" (Akar; Bunga; Buah).
- SD: 5 tahap tumbuh, lalu `ctx.place` 5 label (Akar, Batang, Daun, Bunga, Buah) ke titik penanda pada gambar tanaman (slot SVG lingkaran dengan garis penunjuk, `move:false`, tulis label di samping titik lewat `onPlace`), lalu 2 soal: "Daun membuat makanan dengan bantuan cahaya matahari. Proses ini disebut?" (Fotosintesis; Penguapan; Pembekuan), "Fungsi akar adalah?" (Menyerap air dari tanah; Membuat bunga; Menangkap cahaya).
- lesson: "Tumbuhan butuh air, cahaya matahari, dan tanah yang baik. Dengan izin Allah, biji kecil bisa menjadi tanaman yang berbuah."

### 43 laser: Cermin Ajaib (Bantu)
Puzzle grid (TK 4x4, SD 6x6): senter (SVG) di tepi menembakkan sinar lurus; target (lampu bintang) di sel lain; cermin diagonal di beberapa sel berputar / ↔ \ saat diketuk (transform rotate 150ms); batu menghalangi sinar. Sinar dihitung ulang dan digambar setiap perubahan (SVG polyline terang dengan glow). Sinar kena target: target menyala, sfx benar, level selesai. Level DITULIS TANGAN di file (data grid) dan sudah dicek ada solusinya; posisi awal cermin = solusi lalu sebagian diputar.
- TK: 4 level, 1-2 cermin. SD: 6 level, 2-4 cermin dan batu; 2 level terakhir punya 2 target yang harus kena berurutan dalam satu sinar.
- 💡 Bantu: putar satu cermin yang belum benar; ketuk ke-3 = semua cermin benar.
- Note setelah level 1: "Cermin memantulkan cahaya. Sudut datang sama dengan sudut pantul."
- lesson: "Cahaya merambat lurus dan bisa dipantulkan oleh cermin."

### 44 sudoku: Sudoku Mini (Bantu)
- TK: 3x3 dengan 3 bentuk SVG (lingkaran merah, segitiga kuning, persegi biru): setiap baris dan kolom berisi ketiga bentuk satu kali. 3 puzzle, 2, 3, 4 kotak kosong.
- SD: 4x4 angka 1-4 dengan 4 kotak 2x2: setiap baris, kolom, dan kotak 2x2 berisi 1-4. 3 puzzle, 5, 7, 9 kotak kosong.
- Isi: ketuk kotak kosong (menyala), lalu ketuk pilihan di palet besar di bawah. Isian yang BENTROK (sama di baris/kolom/kotak) langsung ditandai merah + `ctx.wrong` (sekali per isian) dan boleh diganti. Cek kemenangan berdasarkan aturan (tidak ada bentrok dan semua terisi), BUKAN dibandingkan dengan satu kunci jawaban.
- Puzzle dibuat dari solusi dasar yang diacak (tukar simbol, tukar baris dalam band, tukar kolom dalam stack), lalu kosongkan sel acak.
- Aturan ditunjukkan sekali di awal: satu baris contoh menyala sambil dibacakan.
- 💡 Bantu: isi satu kotak kosong dengan benar; ketuk ke-3 = puzzle terisi semua.
- lesson: "Berpikir teliti: di setiap baris dan kolom tidak boleh ada yang sama."

### 45 geser: Geser Angka (Bantu)
Puzzle geser: ubin bernomor warna-warni dan satu tempat kosong; ketuk ubin yang bersebelahan dengan tempat kosong untuk menggesernya (transform 150ms ease-in-out, sfx klik). Ubin di posisi benar diberi tanda centang kecil.
- TK: papan 2x3 (angka 1-5), 3 puzzle diacak 4, 6, 8 langkah dari kondisi selesai (acakan tidak langsung membatalkan langkah sebelumnya).
- SD: papan 3x3 (1-8), 3 puzzle diacak 10, 16, 24 langkah.
- Penghitung langkah tampil. 💡 Bantu: satu langkah dari solusi terpendek (BFS dari keadaan sekarang; 3x3 punya 181.440 keadaan, masih cepat; simpan hasil BFS per puzzle); ketuk ke-3 = ubin bergeser otomatis sampai selesai (animasi cepat).
- Bintang dari jumlah Bantu dan langkah berlebih.
- lesson: "Puzzle melatih kita berpikir beberapa langkah ke depan."

### 46 beda: Cari Perbedaan (Bantu)
Dua gambar pemandangan SVG buatan sendiri (berdampingan di tablet, atas-bawah di HP), TANPA orang dan hewan: halaman rumah (pohon, matahari, awan, mobil, bunga, layang-layang), taman masjid (kubah, menara, pohon kurma, lampu, bulan), pantai (perahu, payung pantai, ombak, matahari, kelapa). Gambar kedua punya perbedaan (warna berubah, benda hilang, benda tambahan, ukuran beda, posisi geser). Tiap perbedaan = area ketuk transparan (`data-tap`, minimal 48px) di KEDUA gambar. Ketuk benar: lingkaran merah muncul di kedua gambar, sfx benar, "2/5". Ketuk di tempat lain pada gambar: sfx tap pelan saja (anak boleh mencoba); 5 ketukan salah berturut-turut = 1 mistake dan satu perbedaan bergoyang halus sebagai petunjuk.
- TK: 3 pemandangan x 3 perbedaan besar. SD: 3 pemandangan x 5 perbedaan (sebagian halus).
- 💡 Bantu: ungkap satu perbedaan; ketuk ke-3 = ungkap semua sisa di gambar ini.
- lesson: "Mengamati dengan teliti membantu kita menemukan hal kecil yang berbeda."

### 47 ingat: Ingat Urutan
Empat bantalan besar berwarna dengan ikon: ⭐ kuning, 🌙 biru, ☀️ oranye, 💧 hijau. Komputer menyalakan bantalan satu per satu (lebih terang + sedikit membesar + sfx berbeda per bantalan: `tap`, `pop`, `klik`, `flip`; BUKAN nada musik), lalu anak mengulang urutan. Benar semua: sfx benar, urutan bertambah satu. Salah: bantalan merah, `ctx.wrong`, urutan diputar ulang; 2 kali salah di ronde yang sama = ronde dilewati. Saat komputer memutar urutan, semua bantalan `disabled`. Panel: "Ronde 3 dari 6" dan panjang urutan.
- TK: panjang 2 sampai 5 (4 ronde), nyala 700ms.
- SD: panjang 3 sampai 8 (6 ronde), nyala 550ms lalu makin cepat (maks 380ms).
- Reduced motion: hanya perubahan warna dan opacity.
- lesson: "Mengingat urutan melatih fokus. Seperti menghafal surat pendek: sedikit demi sedikit, lama-lama hafal."

### 48 susun: Susun Bentuk
Pakai `ctx.place`: papan berisi siluet gambar (garis putus-putus) yang terbagi menjadi slot-slot bentuk geometri (SVG); kepingan bentuk berwarna di nampan (`node` SVG kecil + label nama bentuk yang dibacakan saat dipilih). Setiap keping hanya cocok ke slot dengan bentuk dan ukuran yang sama (bentuk sama berukuran sama boleh saling tukar: pakai `target` array). Slot SVG: `move:false`, isi slot diwarnai di `onPlace`. Saat semua terpasang, gambar "hidup" (roket naik sedikit, perahu bergoyang, lampu masjid menyala, asap kereta), nama gambar dibacakan.
Gambar: Rumah (persegi badan + segitiga atap + persegi panjang pintu) · Pohon (lingkaran daun + persegi panjang batang) · Perahu (trapesium badan + segitiga layar + persegi panjang tiang) · Roket (persegi panjang badan + segitiga ujung + 2 segitiga sirip + lingkaran jendela) · Masjid (persegi bangunan + setengah lingkaran kubah + persegi panjang menara + segitiga puncak menara) · Kereta (persegi panjang gerbong + persegi kabin + 3 lingkaran roda).
- TK: 3 gambar (rumah, pohon, perahu). SD: 3 gambar (roket, masjid, kereta).
- lesson: "Gambar besar tersusun dari bentuk-bentuk sederhana: segitiga, persegi, dan lingkaran."

### 49 hanoi: Menara Hanoi (Bantu)
Tiga tiang (tiap tiang = satu tombol besar setinggi papan), cakram warna-warni dengan lebar berbeda. Ketuk tiang asal: cakram teratas terangkat dan melayang di atas tiang. Ketuk tiang tujuan: cakram turun (transform 200ms ease-in-out, sfx klik). Ketuk tiang yang sama = batal. Aturan: satu cakram sekali pindah; cakram besar tidak boleh di atas cakram kecil (pelanggaran: sfx salah, cakram kembali, `ctx.wrong`). Tujuan: pindahkan semua cakram ke tiang paling kanan. Panel: "Langkah: N, langkah terbaik: M".
- TK: 2 cakram (terbaik 3), lalu 3 cakram (7). SD: 3 cakram (7), lalu 4 cakram (15).
- 💡 Bantu: satu langkah optimal dari keadaan sekarang (BFS, 3^n keadaan); ketuk ke-3 = selesaikan otomatis dengan animasi.
- Bintang: tanpa Bantu dan langkah ≤ terbaik+3 = 3; selesai dengan ≤ 1 Bantu = 2; selebihnya 1.
- Aturan dijelaskan di awal dengan animasi satu langkah contoh.
- lesson: "Masalah besar bisa diselesaikan dengan memecahnya menjadi langkah-langkah kecil."

### 50 mobil: Mobil Pintar (Bantu)
Pengenalan coding. Peta grid jalan (TK 4x4, SD 6x6) dengan mobil (SVG tampak atas, tanpa wajah, jelas arah depannya), tujuan (🏫 sekolah atau 🕌 masjid), rintangan (🌳, 🪨, 🚧). Anak menyusun program dengan tombol perintah; program tampil sebagai deretan kartu di "papan program". Tombol "▶ Jalankan": mobil menjalankan perintah satu per satu (animasi 250ms per langkah), kartu yang sedang jalan menyala. Menabrak rintangan atau keluar peta: mobil berhenti dan bergoyang, "Ups! Ubah programnya ya", `ctx.wrong`, mobil kembali ke start, program tetap ada untuk diedit. Tombol "⌫ Hapus" (hapus perintah terakhir) dan "🗑️ Ulang" (kosongkan). Maksimal 12 perintah.
- TK: perintah arah mutlak ⬆️ ⬇️ ⬅️ ➡️ (maju satu kotak ke arah itu). 4 level, jalur terpendek 2-5 langkah.
- SD: perintah relatif ⬆️ Maju, ↩️ Belok kiri, ↪️ Belok kanan (berputar di tempat 90 derajat). 5 level, jalur 4-10 perintah; level 5 harus mengambil ⭐ dulu sebelum tujuan.
- Level DITULIS TANGAN di file (data grid) dan sudah dicek ada solusinya.
- 💡 Bantu: hapus perintah sampai sisa awalan yang benar, lalu tambah satu perintah benar (solusi terpendek BFS); ketuk ke-3 = program terisi lengkap dan langsung dijalankan. 3 kali menabrak di satu level = Bantu otomatis menjalankan solusi, lalu lanjut.
- lesson: "Komputer mengikuti perintah satu per satu. Program yang urut dan teliti membuat mobil sampai tujuan."

## 8. Gamifikasi (JS, bukan tugas game)

Semua progres anak dihitung otomatis dari `ctx.finish()`; **game tidak perlu memanggil apa pun**. Modul: `js/config.js` (URL papan), `js/progress.js` (mesin), `js/badges.js` (lencana), `js/board.js` (papan juara). State pemain di `localStorage["tamanIlmu.v2"]`; `tamanIlmu.v1` tetap ditulis sebagai mirror (masa depan uji lama, dibaca `ui.mjs`).

- **XP**: +15 selesai pertama kali per (game, jenjang) + 10 per bintang saat rekor naik + bonus harian turun 2,2,2,1,1,0 per game per hari WIB (anti farming) + 40 tantangan pekan (2+ bintang di game tantangan, sekali per pekan).
- **Level** (12, tematik taman): Kecambah, Tunas, Semai, Sulur, Pohon Kecil, Rimbun, Berbunga, Mekar, Berbuah, Panen Raya, Taman Indah, Penjaga Taman. Ambang: 0, 60, 160, 320, 560, 900, 1350, 1900, 2600, 3500, 4600, 5800 XP. Jalur level membuka sampai 13 game per taman di level 12; sisanya lewat rantai bintang.
- **Unlock**: 2 game pertama tiap kategori terbuka; sisanya terbuka kalau game sebelumnya di kategori yang sama sudah dapat 1+ bintang (rantai ketat) ATAU `level + 1` tercapai. Kartu terkunci menampilkan cara membukanya. Ditambah **Game Gratis Hari Ini**: tiap hari WIB satu game terkunci dibuka acak tanpa syarat (pilihan global sama untuk semua anak; diganti satu game terkunci acak miliknya kalau pilihan global sudah terbuka; stabil sehari penuh, tersimpan di `state.dailyFree`).
- **Mastery** per (game, jenjang): 0 baru, 1 perunggu (1 bintang), 2 perak (2), 3 emas (3), 4 berlian (3 bintang + 5x main).
- **Pekan ISO (WIB)**: counter pekan (XP, bintang, main) reset tiap Senin 00:00 WIB; game tantangan rotasi deterministik sama untuk semua anak.
- **Lencana** (18): otomatis dari evaluasi state; toast saat baru didapat; daftar di `#/lencana` beserta teaser yang belum. Lencana yang sudah didapat punya tombol Bagikan. Termasuk Pemburu Gratisan (selesaikan Game Gratis Hari Ini) dan Tukang Pamer (bagikan kartu pamer).
- **Berbagi** (`js/share.js`): satu gerbang `TI.Share` untuk semua tombol bagikan (Web Share API di HP, salin clipboard di desktop). Ada di layar hasil (`📣 Bagikan`), kartu lencana, dan tombol `📣 Ajak teman main` di footer beranda. Teks yang dibagikan selalu ditutup link undangan `SITE_URL?ajak=<nama panggilan>`; penerima melihat banner sapaan di beranda (sekali per nama, bisa ditutup, tersimpan di `state.ajakSeen`). Berbagi pertama tiap hari WIB memberi +5 XP lewat `Progression.onShare()` (anti farming, tanpa efek streak). Batal membagikan tidak memberi apa pun. Nama yang dibagikan cuma panggilan, tanpa data lain. Layar hasil juga punya Tantang (link `?tantang=gid&skor&dari`, penerima melihat banner tantangan di beranda) dan Kartu (gambar skor 1080x1350 untuk status WA/IG, Web Share file kalau bisa, kalau tidak diunduh + teks tersalin); footer beranda punya Pamer Rajin (rentetan hari main).
- **Papan juara** (`#/papan`): mode Pekan Ini (reset Senin) dan Sepanjang Waktu, per jenjang TK/SD. Backend: `TI_CONFIG.BOARD_URL` (service SQLite di 43.134.70.149 via `taman-ilmu.43-134-70-149.sslip.io`; nanti ganti host ke `taman-ilmu.agentic-pm.ai` kalau A record sudah dibuat). Kirim skor fire-and-forget setelah hasil, 1 kali ulang. `file://` tidak pernah fetch (main offline tetap penuh); data papan terakhir di-cache di `localStorage["tamanIlmu.board"]`. Nama panggilan 2-16 karakter di `#/nama`, tanpa nama asli.
- Uji: `node tools/gami.mjs` (migrasi, XP, unlock, gratis harian, tantangan, lencana, anti-farm, papan offline, berbagi, tantang, promo, statistik, banner ajakan). `PLIVE=1` menambah cek papan live (butuh versi baru sudah ter-deploy).
- **Promo** (`js/promo.js`, daftar di `TI_CONFIG.PROMOS`): banner di atas beranda, berputar tiap hari, bisa ditutup (berlaku sampai besok). Tayang dan klik tercatat di statistik. Isi awal: kelas Bikin Game Sendiri, landing di `#/kelas`, tombol Daftar membuka `TI_CONFIG.KELAS_URL` (kosong = "segera dibuka").
- **Statistik** (`js/analytics.js`, `localStorage["tamanIlmu.stats.v1"]`): kunjungan, hari aktif, main, selesai, rata-rata bintang, bagikan, main gratis harian, tayang/klik promo, 5 game teratas, aktif 7 hari. Dashboard `#/statistik` jalan offline. Kalau `STATS_ON` dan online, ringkasan anonim dikirim ke `BOARD_URL + '/stats'` (POST `{player_id, week_key, visits, days_active, plays, finishes, stars, shares, per_game, client_time}`, best-effort, no-cors text/plain tanpa preflight); kirim dan angka global dari `GET /stats/summary` (`{visitors, plays, finishes, shares}`) hanya dicoba kalau `STATS_UP` true.

## 9. Gelombang 3: game 51-100

50 game tambahan yang lebih seru (dibuat 4 Nov 2026, pola gelombang 2: desain di file masing-masing). Aturan konten gelombang 3: fakta agama PAKAI ULANG dari bank SPEC bagian 6 atau file game gelombang 1-2 (tulis sumbernya di komentar); tidak ada teks Arab baru kecuali huruf hijaiyah tunggal yang sudah ada di SPEC.

| No | id | Judul | cat | ikon | Mekanik singkat |
|---|---|---|---|---|---|
| 51 | asma-buru | Buru Asmaul Husna | islam | 🏷️ | Arcade tangkap nama yang artinya cocok |
| 52 | tertib-shalat | Tertib Gerakan Shalat | islam | 📿 | Urutan gerakan + kuis rakaat |
| 53 | kisah-clue | Tebak Nabi dari Petunjuk | islam | 🗞️ | 3 petunjuk, tebak nabi |
| 54 | zakat-fitrah | Takar Zakat Fitrah | islam | 🍚 | Takar cup beras sampai pas |
| 55 | puasa-sehari | Sehari Berpuasa | islam | 🌅 | Urutan sahur-buka + pilah batal/tidak |
| 56 | lari-masjid | Lari ke Masjid | islam | 🛣️ | Auto-runner lompat, kumpul bintang |
| 57 | doa-pasang | Pasangan Doa | islam | 💌 | Memory doa sehari-hari |
| 58 | jam-shalat | Kapan Shalatnya | islam | 🌤️ | Cocokkan shalat dengan langit |
| 59 | sedekah-warung | Warung Sedekah | islam | 🏪 | Bayar pas + sisihkan sedekah |
| 60 | sirah-urut | Urut Kisah Nabi | islam | 📆 | Cerita ketuk berurutan lalu urut 5 peristiwa sirah |
| 61 | halal-pilah | Halal atau Haram | islam | 🍽️ | Pilah makanan dan perbuatan |
| 62 | tabung-infaq | Tabung Infaq | islam | 🏺 | Tangkap koin + hitung total |
| 63 | balap-kali | Balap Kali-kali | mat | 🏁 | Balapan jawab perkalian |
| 64 | pizza-pecahan | Pizza Pecahan | mat | 🍕 | Seret juring ke piring target |
| 65 | pola-menara | Menara Pola | mat | 🗼 | Susun balok ikut pola warna |
| 66 | kembalian-kilat | Kembalian Kilat | mat | 💸 | Kembalian pas tercepat |
| 67 | buru-bentuk | Buru Bentuk | mat | 🔍 | Cari bentuk di keramaian |
| 68 | tebak-berat | Tebak Berat | mat | 🎒 | Banding + estimasi kubus satuan |
| 69 | lompat-bintang | Lompat Bintang | mat | ⭐ | Ketuk kelipatan berurutan |
| 70 | bagi-permen | Bagi Permen | mat | 🍬 | Bagi rata ke toples (pembagian) |
| 71 | jam-cocok | Jam Cocok | mat | 🕰️ | Analog lawan digital |
| 72 | sortir-bangun | Sortir Bangun | mat | 🗳️ | Sortir ke keranjang jumlah sisi |
| 73 | toples-tebak | Toples Tebakan | mat | 🫙 | Estimasi isi toples |
| 74 | belah-buah | Belah Buah Hitung | mat | 🍉 | Belah hanya jawaban benar |
| 75 | pancing-magnet | Pancing Magnet | sains | 🎣 | Pancing timing benda logam |
| 76 | roket-air | Roket Air | sains | 🚀 | Pompa + lepas di zona hijau |
| 77 | tebak-bayang | Tebak Bayangan | sains | 🕯️ | Tebak benda dari siluet |
| 78 | rumah-makhluk | Rumah Makhluk | sains | 🏕️ | Sortir ke habitat (tanpa wajah) |
| 79 | baju-cuaca | Koper Cuaca | sains | 🧥 | Isi koper sesuai cuaca |
| 80 | tubuhku | Tubuhku | sains | 🖐️ | Tempel bagian tubuh (tanpa wajah) |
| 81 | tebak-bunyi | Tebak Bunyi | sains | 🎺 | Pilah tinggi/rendah, cepat/lambat |
| 82 | daur-hidup | Daur Hidup Kacang | sains | 🌾 | Urutan biji sampai berbuah |
| 83 | mendarat-bulan | Mendarat di Bulan | sains | 🌕 | Lunar-lander rem tepat |
| 84 | katrol | Katrol dan Tuas | sains | ⚙️ | Pilih alat + tuas seimbang |
| 85 | sambung-pipa | Sambung Pipa | sains | 🚰 | Putar pipa sampai mengalir |
| 86 | penunjuk-arah | Penunjuk Arah | sains | 🌐 | Kompas 4/8 arah |
| 87 | siang-malam | Siang atau Malam | sains | 🌗 | Pilah kegiatan + putar bumi |
| 88 | kode-warna | Tebak Kode Warna | logika | 🎛️ | Mastermind junior |
| 89 | labirin-es | Labirin Es | logika | ⛸️ | Meluncur sampai dinding |
| 90 | tangram | Tangram Rumah | logika | 🏠 | Susun keping jadi bangun |
| 91 | parkir | Parkir Pintar | logika | 🚙 | Geser mobil keluarkan bintang |
| 92 | balik-ingat | Balik dan Ingat | logika | 🔄 | Ingat kartu berkedip |
| 93 | cermin-pola | Cermin Pola | logika | ◑ | Lengkapi simetri cermin |
| 94 | sambung-kabel | Sambung Kabel | logika | 🔌 | Flow tanpa bersinggungan |
| 95 | teka-teki | Teka-teki Siapa | logika | ❔ | Einstein junior 2-3 rumah |
| 96 | balok-pas | Balok yang Pas | logika | 📦 | Pilih balok pas ke lubang |
| 97 | pola-angka | Pola Angka | logika | 🔟 | Lanjutkan barisan |
| 98 | lawan-kata | Lawan Kata | logika | 🌡️ | Memory lawan kata |
| 99 | beda-satu | Mana yang Beda | logika | 🍒 | Odd-one-out cepat |
| 100 | raja-taman | Raja Taman | logika | 🏆 | Final 10 soal campuran, 3 nyawa, perisai salah-pertama |
| 101 | banjir-warna | Banjir Warna | logika | 🪣 | Banjir warna penuhi papan |
| 102 | padam-lampu | Padamkan Lampu | logika | 🪔 | Ketuk lampu sampai semua padam |
