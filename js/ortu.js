/* Taman Ilmu: halaman #/orangtua. Pojok kepercayaan untuk orang tua:
   tanpa iklan, main offline, tanpa data pribadi, suara Indonesia. */
(function () {
  'use strict';
  const TI = window.TI;

  function ortuScreen() {
    if (TI.Stats) TI.Stats.track('promo_view', { id: 'orangtua' });
    const total = TI.games ? TI.games.length : 100;
    const ajak = TI.h('button', { type: 'button', class: 'ti-btn ortu-cta', onclick: () => {
      TI.sfx('tap');
      if (TI.Stats) TI.Stats.track('promo_click', { id: 'orangtua-ajak' });
      if (TI.Share) TI.Share.invite();
    } }, '📣 Ajak Keluarga Main');
    return TI.page('Untuk Orang Tua', 'Kenapa Taman Ilmu aman dipasang di HP anak.',
      TI.h('div', { class: 'ortu-hero pop-in' },
        TI.h('span', { class: 'ortu-icon', 'aria-hidden': 'true' }, '🛡️'),
        TI.h('p', { class: 'ortu-lead' }, 'Taman Ilmu dibuat supaya anak main sambil belajar dan orang tua tetap tenang. Tanpa jebakan klik, tanpa tagihan kaget.'),
        TI.h('ul', { class: 'ortu-list' },
          TI.h('li', null, '🚫 Tanpa iklan. Tidak ada iklan pihak ketiga, anak tidak akan kepencet iklan.'),
          TI.h('li', null, '📴 Main offline. Semua game jalan tanpa internet, cuma papan juara yang butuh internet.'),
          TI.h('li', null, '🔒 Tanpa data pribadi. Tanpa akun dan tanpa nama asli, nama di papan cuma panggilan.'),
          TI.h('li', null, '🔊 Suara Bahasa Indonesia. Semua soal dibacakan, cocok untuk anak yang belum lancar membaca.'),
          TI.h('li', null, '🕌 Ramah keluarga. Tanpa gambar wajah, tanpa musik, hanya efek suara pendek.')),
        ajak,
        TI.h('p', { class: 'ortu-note' }, 'Ada ' + total + ' game untuk jenjang TK dan SD: agama Islam, matematika, sains, dan logika.')));
  }

  TI.VIEWS = TI.VIEWS || {};
  TI.VIEWS.orangtua = ortuScreen;
})();
