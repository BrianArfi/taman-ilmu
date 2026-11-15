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

## Upload (perintah terbukti video 1, 15 Nov 2026)

- Alat: post.py di Mac mini via `ssh macmini`. Token kisah HANYA ada di
  mini (`~/Brobri/skills/post/youtube_token_kisah.json`); JANGAN coba
  upload dari PC/WSL.
- Channel: Kisah Islam Anak, alias `kisah`, privacy `public`, format `yt_short`.
- Perintah (contoh slug taman-ilmu-short1):
  1. `ssh macmini 'mkdir -p ~/kids/inbox/<slug>'`
  2. `scp out.mp4 macmini:~/kids/inbox/<slug>/out.mp4`
     + caption.txt ke folder yang sama
  3. Antre: `ssh macmini "cd ~/Brobri && ~/kids/py/bin/python
     skills/post/post.py preview --account kisah --platforms youtube
     --type video --media ~/kids/inbox/<slug>/out.mp4
     --caption-file ~/kids/inbox/<slug>/caption.txt
     --schedule 'YYYY-MM-DD HH:MM'"` lalu catat id antre.
  4. Kirim: `ssh macmini 'cd /Users/openclawmacmini1/Brobri &&
     /Users/openclawmacmini1/kids/py/bin/python skills/post/post.py
     send --id <id> --yes --yt-privacy public'`
- ATURAN KUTIP SSH: jangan pakai tanda kutip ganda di dalam perintah
  remote dari PowerShell (dilucuti lapisan ssh Windows). Perintah remote
  tanpa kutip ganda, atau bungkus PS kutip ganda + remote kutip tunggal.
- Verifikasi: `status: sent` di queue json + baris post_log
  (`~/Brobri/data/post_log.jsonl`) + buka URL youtu.be (HTTP 200, judul
  ketemu di HTML). Status sent = sah meski ssh sempat "Connection reset".
- Insiden 15 Nov: flip post.py 13:43 tanpa cover_title.py merusak SEMUA
  send video mini; diperbaiki 14:13 dengan menyalin modul dari repo live.
  Kalau send gagal ModuleNotFoundError: salin modul yang hilang dari
  `/home/brobri/antigravity-projects/Brobri/skills/post/` ke mini.
