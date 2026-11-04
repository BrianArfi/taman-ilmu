/* Taman Ilmu: banner promosi di atas beranda + halaman kelas #/kelas.
   Daftar banner dari TI_CONFIG.PROMOS, berputar tiap hari. Banner bisa ditutup,
   tutup berlaku sampai besok. Tayang dan klik tercatat di TI.Stats. */
(function () {
  'use strict';
  const TI = window.TI;
  const CFG = window.TI_CONFIG || {};

  function today() {
    return TI.Progression ? TI.Progression.dayKey()
      : new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
  }
  function promos() {
    const list = Array.isArray(CFG.PROMOS) ? CFG.PROMOS.filter((p) => p && p.id && p.title) : [];
    return list;
  }
  function pick() {
    const list = promos();
    if (!list.length) return null;
    const dk = today();
    const off = (TI.state.promoOff = TI.state.promoOff || {});
    const open = list.filter((p) => off[p.id] !== dk);
    if (!open.length) return null;
    const n = Math.floor(new Date(dk + 'T00:00:00Z').getTime() / 86400000);
    return open[((n % open.length) + open.length) % open.length];
  }

  function banner() {
    const p = pick();
    if (!p) return null;
    const external = /^https?:/i.test(p.url || '');
    const go = TI.h('a', {
      class: 'ti-btn promo-go', href: p.url || '#/kelas',
      ...(external ? { target: '_blank', rel: 'noopener' } : {}),
      onclick: () => { TI.sfx('tap'); if (TI.Stats) TI.Stats.track('promo_click', { id: p.id }); },
    }, p.cta || 'Lihat');
    const el = TI.h('div', { class: 'promo-banner pop-in', role: 'complementary', 'aria-label': 'Promosi: ' + p.title },
      TI.h('span', { class: 'promo-icon', 'aria-hidden': 'true' }, p.icon || '📣'),
      TI.h('div', { class: 'promo-body' },
        TI.h('b', null, p.title),
        TI.h('span', { class: 'promo-txt' }, p.text || '')),
      go,
      TI.h('button', { type: 'button', class: 'promo-x', 'aria-label': 'Tutup promosi',
        onclick: () => {
          TI.sfx('tap');
          (TI.state.promoOff = TI.state.promoOff || {})[p.id] = today();
          if (TI.save) TI.save();
          el.remove();
        } }, '✕'));
    if (TI.Stats) TI.Stats.track('promo_view', { id: p.id });
    return el;
  }

  // ---------- halaman kelas: jualan kelas bikin game untuk anak ----------
  function kelasScreen() {
    const daftar = TI.h('button', { type: 'button', class: 'ti-btn kelas-cta', onclick: () => {
      TI.sfx('tap');
      if (TI.Stats) TI.Stats.track('promo_click', { id: 'kelas-daftar' });
      const url = CFG.KELAS_URL || '';
      if (/^https?:/i.test(url)) window.open(url, '_blank', 'noopener');
      else TI.toast('📝', 'Pendaftaran segera dibuka. Tunggu kabar dari kami ya.');
    } }, 'Daftar Sekarang');
    return TI.page('Bikin Game Sendiri!', 'Kelas online untuk anak: dari main game jadi bikin game.',
      TI.h('div', { class: 'kelas-hero pop-in' },
        TI.h('span', { class: 'kelas-icon', 'aria-hidden': 'true' }, '🎮'),
        TI.h('p', { class: 'kelas-lead' }, 'Anak suka main Taman Ilmu? Di kelas ini anak belajar bikin aplikasi gamenya sendiri, langkah demi langkah, sampai bisa dimainkan dan dipamerkan ke teman.'),
        TI.h('ul', { class: 'kelas-list' },
          TI.h('li', null, '🧩 Mulai dari nol, tanpa pengalaman coding.'),
          TI.h('li', null, '🕌 Proyek pertamanya game edukasi Islami.'),
          TI.h('li', null, '🏠 Orang tua bisa mendampingi dari rumah.'),
          TI.h('li', null, '🏅 Pulang bawa game jadi karya sendiri.')),
        daftar,
        TI.h('p', { class: 'kelas-note' }, 'Untuk anak 7 sampai 12 tahun. Jadwal dan biaya menyusul, amankan kursi dulu.')));
  }

  TI.Promo = { banner };
  TI.VIEWS = TI.VIEWS || {};
  TI.VIEWS.kelas = kelasScreen;
})();
