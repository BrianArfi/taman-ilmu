# Loop Promo Video Taman Ilmu (ke Kisah Islam Anak)

Standing gas Brian 15 Nov 2026 (lihat Lessons di CLAUDE.md): upload otomatis
TANPA approval per video. Syarat: maks 1 upload/hari, semua kecatat di log,
kill switch, lolos QA story-time, klaim jujur.

## State

- Log upload: `tools/improve/reports/promo-video-log.jsonl` (1 baris per upload: tgl, slug, game, videoId/url, durasi).
- Kill switch: `tools/improve/reports/promo-video.STOP` (ada = berhenti total).
- Rotasi game: `tools/improve/reports/promo-video-next.md` (game berikut + yang sudah).
- Cap: tolak upload ke-2 di tanggal WIB yang sama (cek log dulu).

## Satu putaran (cron mingguan)

1. Berhenti jika file STOP ada. Berhenti jika log sudah ada upload hari ini.
2. Ambil game berikut dari rotasi (prioritas skor promo top, selingi islam).
3. Produksi 1 Short 9:16 (30-45 dtk) via skill story-time: resep website +
   social-short, style clay, VO Indonesia edge-tts + SFX tanpa musik, end card
   QR + link https://brianarfi.github.io/taman-ilmu/ . Kerja di H:, disk_guard
   sebelum render, hapus scratch sesudahnya.
4. QA wajib lolos: script check, story qa, contact sheet dicek. Klaim jujur
   (verifikasi ulang: tanpa iklan/daftar di index.html, hitung games/*.js).
5. Upload ke channel Kisah Islam Anak (perintah terbukti video 1, diisi di
   bawah), catat ke log, notifikasi satu baris via tg-send bulan.
6. Update rotasi. Deliver MP4 + cover + sheet ke inbox dated folder.

## Upload (perintah terbukti)

> Diisi sesudah video 1 terbukti terupload (putaran perdana 15 Nov 2026).

- Alat:
- Channel/akun:
- Perintah:
- Verifikasi:
