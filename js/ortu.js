/* Taman Ilmu: halaman #/orangtua. Pojok kepercayaan untuk orang tua:
   tanpa iklan, main offline, tanpa data pribadi, suara Indonesia. */
(function () {
  'use strict';
  const TI = window.TI;

  // Satu sumber: dipakai layar + teks forward (anti basi).
  const POIN = [
    '🚫 Tanpa iklan. Tidak ada iklan pihak ketiga, anak tidak akan kepencet iklan.',
    '📴 Main offline. Semua game jalan tanpa internet, cuma papan juara yang butuh internet.',
    '🔒 Tanpa data pribadi. Tanpa akun dan tanpa nama asli, nama di papan cuma panggilan.',
    '🔊 Suara Bahasa Indonesia. Semua soal dibacakan, cocok untuk anak yang belum lancar membaca.',
    '🕌 Ramah keluarga. Tanpa gambar wajah, tanpa musik, hanya efek suara pendek.',
  ];
  TI.OrtuPoin = POIN;

  function ortuScreen() {
    if (TI.Stats) TI.Stats.track('promo_view', { id: 'orangtua' });
    const total = TI.games ? TI.games.length : 100;
    const ajak = TI.h('button', { type: 'button', class: 'ti-btn ortu-cta', onclick: () => {
      TI.sfx('tap');
      if (TI.Stats) TI.Stats.track('promo_click', { id: 'orangtua-ajak' });
      if (TI.Share) TI.Share.invite();
    } }, '📣 Ajak Keluarga Main');
    const ajakOrtu = TI.h('button', { type: 'button', class: 'ti-btn is-ghost ortu-cta', onclick: () => {
      TI.sfx('tap');
      if (TI.Stats) TI.Stats.track('promo_click', { id: 'orangtua-wa-ortu' });
      if (TI.Share) TI.Share.inviteOrtu();
    } }, 'Bagikan ke grup WA');
    const salin = TI.h('button', { type: 'button', class: 'ti-btn is-ghost ortu-cta', onclick: () => {
      TI.sfx('tap');
      if (TI.Stats) TI.Stats.track('promo_click', { id: 'orangtua-salin' });
      if (TI.Share) TI.Share.infoOrtu();
    } }, 'Salin info buat grup WA');
    const pasang = TI.PWA && !TI.PWA.mandiri() && !TI.PWA.ios()
      ? TI.h('span', { class: 'ortu-pasang' },
        TI.h('button', { type: 'button', class: 'ti-btn ortu-cta', 'data-pwa': 'pasang', hidden: true, onclick: () => {
          TI.sfx('tap');
          if (TI.Stats) TI.Stats.track('promo_click', { id: 'orangtua-pasang' });
          TI.PWA.pasang();
        } }, '📲 Pasang ke Layar Utama'),
        TI.h('span', { class: 'ortu-note', 'data-pwa': 'manual' }, '📲 ' + (TI.PWA.manual() || ''))) : null;
    const pasangIos = TI.PWA && !TI.PWA.mandiri() && TI.PWA.ios()
      ? TI.h('p', { class: 'ortu-note' }, '📲 Pasang ke Layar Utama: ketuk Bagikan di Safari, lalu Tambah ke Layar Utama.') : null;
    const hal = TI.page('Untuk Orang Tua', 'Kenapa Taman Ilmu aman dipasang di HP anak.',
      TI.h('div', { class: 'ortu-hero pop-in' },
        TI.h('span', { class: 'ortu-icon', 'aria-hidden': 'true' }, '🛡️'),
        TI.h('p', { class: 'ortu-lead' }, 'Taman Ilmu dibuat supaya anak main sambil belajar dan orang tua tetap tenang. Tanpa jebakan klik, tanpa tagihan kaget.'),
        TI.h('ul', { class: 'ortu-list' }, POIN.map((p) => TI.h('li', null, p))),
        ajak,
        ajakOrtu,
        salin,
        pasang,
        pasangIos,
        TI.h('p', { class: 'ortu-note' }, 'Ada ' + total + ' game untuk jenjang TK dan SD: agama Islam, matematika, sains, dan logika.')));
    if (TI.PWA) TI.PWA.paint();
    return hal;
  }

  TI.VIEWS = TI.VIEWS || {};
  TI.VIEWS.orangtua = ortuScreen;
})();
