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
