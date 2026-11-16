/* Konfigurasi papan juara online. Papan mati kalau BOARD_ON false atau URL kosong,
   dan otomatis mati saat dibuka dari file:// (uji otomatis tidak memanggil jaringan). */
window.TI_CONFIG = {
  BOARD_URL: 'https://taman-ilmu.43-134-70-149.sslip.io',
  SITE_URL: 'https://brianarfi.github.io/taman-ilmu/',
  BOARD_ON: true,
  // Statistik anonim: kalau true dan online, ringkasan pemakaian dikirim ke BOARD_URL + '/stats'.
  // Tanpa server statistik pun dashboard lokal (#/statistik) tetap jalan penuh.
  STATS_ON: true,
  // Server sudah sediakan POST /stats + /stats/event dan GET /stats/* (ti-api 1.1).
  STATS_UP: true,
  // Tautan pendaftaran kelas "Bikin Game Sendiri". Kosong = tombol Daftar menampilkan "segera dibuka".
  KELAS_URL: '',
  // Banner promosi di atas beranda. Berputar tiap hari kalau lebih dari satu.
  // url boleh '#/kelas' (halaman dalam) atau https (dibuka di tab baru).
  PROMOS: [
    {
      id: 'kelas-game',
      icon: '🎮',
      title: 'Bikin Game Sendiri!',
      text: 'Anak bisa bikin aplikasi game seperti Taman Ilmu. Ikuti kelasnya, dari nol sampai jadi.',
      cta: 'Lihat Kelas',
      url: '#/kelas',
    },
  ],
};
