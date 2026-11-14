# Catatan Loop Ide (diagnosis, bukan backlog)

## Putaran kron 8 Nov 2026 (~06:37 WIB) — GAGAL KOSONG
- 3 anak riset jalan beneran (23 + 22 + 10 tool calls, ~12 menit).
- Sintesis kembali KOSONG: `{"hasil":"{}"}`. Tidak ada ide yang bisa digabung.
- Dugaan: skrip `ide-workflow.js` tidak memaksa skema evidence pada anak,
  jadi sintesis tidak menerima teks bermanfaat (ref error/text kosong).
- Tindak lanjut: perbaiki `ide-workflow.js` (wajibkan schema + teks ringkas
  per anak, fallback pakai text anak bila sintesis kosong) SEBELUM putaran
  berikutnya mengambil alih lock ini.
- `.ide-lock` putaran ini DIBIARKAN sebagai penanda diagnosis; kron
  berikutnya ambil alih otomatis setelah umur >180 menit.

## Putaran manual 8 Nov 2026 — BERHASIL, SUDAH DIGABUNG
- 12 ide berperingkat mendarat lengkap (16 ide sumber: 6 playtest + 5 viral
  + 5 ortu; 2 merger, 2 dibuang beralasan). Masuk `ide-backlog.md`:
  11 TODO + 1 TOLAK (hijaiyah contoh SPEC); benih kabur "tantangan harian"
  diganti Duel Balasan + Misi Harian Global yang konkret.
- Pelajaran: skrip TANPA skema ketat (teks bebas) yang berhasil; versi
  berskema yang gagal. `ide-workflow.js` diperbaiki: sintesis wajib
  hasilkan daftar (instruksi anti-kosong) + fallback teks mentah bila
  sintesis kosong (cap 12000 char).

## Putaran kron 10 Nov 2026 malam — BERHASIL, SUDAH DIGABUNG
- 3 anak + sintesis selesai (15+18+10+3 tool calls). 12 ide berperingkat
  + 4 gugur-cap + 1 catatan hardcode '100 game'.
- Gabung ke 12 TODO: 7 baru langsung (strip, template ortu, tantang pekan,
  listrik, loncat, streak, ajak 2-sisi), 3 ganti entri lama yang kalah
  spesifik (Laporan Anak ganti Rapor Anak; rematch ganti Duel Balasan;
  Listrik S ganti Lab gabungan), 3 lama dipertahankan (Perisai, Misi
  Harian, Sertifikat). Hardcode 100 game dilipat ke ide template ortu.
- Dedup: Listrik S menelan separuh Lab gabungan; separuh wujud parkir di
  bawah (bukan dibuang). Loncat-lewati beda aspek dgn S69 (toleransi),
  jadi bukan duplikat.
- TAHAN ustadz (di TOLAK, bukan permanen): Adab arti opsional,
  Praktik-di-rumah. TOLAK permanen: Hijaiyah variasi (contoh SPEC).
- Gugur cap-12 sintesis, simpan untuk putaran berikut: (a) PWA manifest
  + OG + panduan pasang (index.html head :1-18 + ortu.js, M/4); (b) Kartu
  pamer lencana + papan (share.js gambarKartu 171-220 + badges.js:121 +
  board.js:82-84, M/4); (c) Wujud: hapus afterNote+Lanjut + slider SD
  (19-wujud.js:137-145,232-261,263-276, M/4); (d) Raja Taman variasi soal
  + HUD mahkota (100-raja-taman.js:80-92,137-169, M/4).
- Unresolved: peringkat-6 promo tak tertulis (adab dipilih via static);
  R3 tanpa smoke (baca kode 6 file saja).
- Pelajaran: resume-workflow dgn tail baru berhasil menarik notes+data
  anak tanpa re-run (4 panggilan replay dari jurnal). Skrip kanonis
  sebaiknya return evidence penuh sejak awal (TODO).

## Putaran kron 14 Nov 2026 — BERHASIL SEBAGIAN, DIGABUNG MANUAL
- 3 anak selesai penuh (33+14+13 calls): 6 ide game + 5 viral + 5 ortu,
  semua berlokasi file:baris. Sintesis GAGAL ranking (tak bisa baca 1
  handoff, output cuma metadata); parent menggabung manual dari 3 laporan.
- Gabung ke 9 TODO baru + 3 lama = 12: 5 S/5, 2 S/4, 2 S/3 di atas; 3 M
  lama di bawah. V4 (atribusi ajakan) didedup ke entri Ajak yg sudah ada
  (tambah lokasi badges.js + ajakSeen).
- TOLAK: hijaiyah rayakan (contoh SPEC, permanen).
- Parkir cap-12 untuk putaran berikut: (a) Raja HP bar (100-raja-taman
  L82-91+104-127, M/5); (b) Papan Teman lokal-only (board.js render +
  ajakBanner, M/4); (c) Rekap Nilai Islami pekanan (analytics render,
  M/5); (d) Kartu gambar papan+pekan (share.js gambarKartu, M/4);
  (e) Laporan bergambar+saran (analytics+share laporan, M/4);
  (f) Mode Ortu 1 menit (home/core ajakBanner, M/4).
- Unresolved: effort 6 ide game diestimasi parent (S, raja M); R3 tanpa
  smoke; peringkat-6 promo dihitung manual (laporan cuma top5+bawah5).
- Pelajaran: skrip luncuran putaran ini SUDAH pakai tail evidence-penuh
  (tanpa resume). Kanonis ide-workflow.js diperbarui ikut pola ini.

## Putaran kron 14 Nov 2026 (kedua) — BERHASIL PENUH, DIGABUNG
- 3 anak + sintesis OK (15+16+10+3 calls). Sintesis ranking 12 (5 ortu +
  5 viral + 2 turun dari evidence game; L3 game tanpa teks ide).
- Gabung ke 12 TODO: 7 sintesis (P1,P3,P4,P5,P6,P8,P9) + 5 hidupkan parkir
  putaran 3 (G4,O5-rekap,V5,O3,O4). P2,P7 TAHAN ustadz; P10 TOLAK hijaiyah.
- Parkir (effort L, tak diambil watcher): P11 grup berkode (L/5), P12
  target mingguan ortu (L/4). Parkir putaran 3 habis terpakai.
- Unresolved: 4 temuan game tak jadi ide (loncat/listrik/wujud/kabel);
  effort game diestimasi; peringkat-6 promo dihitung manual.
