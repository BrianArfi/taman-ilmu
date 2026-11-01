/* Taman Ilmu: lencana (16), layar #/lencana, dan toast lencana baru.
   Semua ikon benda atau tumbuhan, tanpa wajah dan tanpa mata (aturan SPEC bagian 3). */
(function () {
  'use strict';
  const TI = window.TI;
  const P = () => TI.Progression;

  const DEFS = [
    { id: 'bintang-pertama', icon: '⭐', name: 'Bintang Pertama', how: 'Dapat 1 bintang di game mana pun',
      test: (t) => t.stars >= 1 },
    { id: 'bintang-penuh', icon: '🌟', name: 'Bintang Sepenuh Judul', how: 'Dapat 3 bintang di satu game',
      test: (t, st) => Object.values(st.stars).some((r) => Object.values(r).includes(3)) },
    { id: 'tukang-kebun', icon: '🌱', name: 'Tukang Kebun', how: 'Selesaikan semua game di satu taman',
      test: (t) => Object.keys(TI.CATS).some((c) => { const m = t.byCat[c] || {}; return TI.games.filter((g) => g.cat === c).every((g) => m[g.id]); }) },
    { id: 'jelajah-taman', icon: '🧭', name: 'Jelajah Taman', how: 'Main minimal satu game di setiap taman',
      test: (t) => Object.keys(TI.CATS).every((c) => TI.games.some((g) => g.cat === c && t.byCat[g.cat] && t.byCat[g.cat][g.id])) },
    { id: 'hafizh-kecil', icon: '📖', name: 'Hafizh Kecil', how: 'Selesaikan 15 game Agama Islam',
      test: (t) => TI.games.filter((g) => g.cat === 'islam').every((g) => t.byCat.islam && t.byCat.islam[g.id]) },
    { id: 'ahli-angka', icon: '🔢', name: 'Ahli Angka', how: 'Selesaikan 15 game Matematika',
      test: (t) => TI.games.filter((g) => g.cat === 'mat').every((g) => t.byCat.mat && t.byCat.mat[g.id]) },
    { id: 'ahli-sains', icon: '🔬', name: 'Ahli Sains', how: 'Selesaikan 13 game Sains',
      test: (t) => TI.games.filter((g) => g.cat === 'sains').every((g) => t.byCat.sains && t.byCat.sains[g.id]) },
    { id: 'pemikir-cilik', icon: '🧩', name: 'Pemikir Cilik', how: 'Selesaikan 7 game Logika',
      test: (t) => TI.games.filter((g) => g.cat === 'logika').every((g) => t.byCat.logika && t.byCat.logika[g.id]) },
    { id: 'bintang-100', icon: '💯', name: 'Bintang Seratus', how: 'Kumpulkan 100 bintang',
      test: (t) => t.stars >= 100 },
    { id: 'bintang-200', icon: '💎', name: 'Dua Ratus Bintang', how: 'Kumpulkan 200 bintang',
      test: (t) => t.stars >= 200 },
    { id: 'sang-emas', icon: '🥇', name: 'Sang Emas', how: 'Dapat 3 bintang di 10 game',
      test: (t) => t.full >= 10 },
    { id: 'rajin-latihan', icon: '📚', name: 'Rajin Latihan', how: 'Bermain 50 kali',
      test: (t) => t.plays >= 50 },
    { id: 'semangat-3-hari', icon: '🔥', name: 'Semangat 3 Hari', how: 'Bermain 3 hari berturut-turut',
      test: (t, st) => (st.streak.count || 0) >= 3 },
    { id: 'tantangan-tuntas', icon: '🎯', name: 'Tantangan Tuntas', how: 'Selesaikan tantangan pekan ini',
      test: (t, st) => !!(st.weekly && st.weekly.tantanganDone) },
    { id: 'juara-pekan', icon: '🏆', name: 'Juara Pekan', how: 'Masuk 10 besar papan pekan ini', board: true },
    { id: 'penjaga-taman', icon: '🌳', name: 'Penjaga Taman', how: 'Capai level 12',
      test: (t, st) => (st.profile.level || 1) >= 12 },
  ];

  const earned = (st) => st.profile.badges || {};

  // Hitung semua lencana yang layak. mark = true: catat tanggal + tampilkan toast.
  // silent = true: catat tanpa toast (pemanggilan pertama saat halaman dibuka).
  function evaluate(mark, silent) {
    const st = TI.state;
    if (!st.profile.badges) st.profile.badges = {};
    const t = P().totals();
    const fresh = [];
    for (const d of DEFS) {
      if (earned(st)[d.id] || d.board) continue; // board (juara-pekan) diberikan lewat papan
      let ok = false;
      try { ok = !!(d.test && d.test(t, st)); } catch (e) { ok = false; }
      if (ok) fresh.push(d.id);
    }
    if (mark && fresh.length) {
      const today = P().dayKey();
      for (const id of fresh) st.profile.badges[id] = today;
      if (!silent && TI.save) TI.save();
      if (!silent) queueToast(fresh);
    }
    return fresh;
  }

  function grant(id) {
    const d = DEFS.find((x) => x.id === id);
    if (!d || earned(TI.state)[id]) return;
    TI.state.profile.badges[id] = P().dayKey();
    if (TI.save) TI.save();
    queueToast([id]);
  }

  // ---------- toast ----------
  const queue = [];
  let showing = false;
  // Toast umum: dipakai lencana dan fitur lain (mis. bonus berbagi di share.js).
  function toast(icon, text, bold) {
    queue.push({ icon, text, bold });
    if (!showing) nextToast();
  }
  function nextToast() {
    const item = queue.shift();
    if (!item) { showing = false; return; }
    showing = true;
    if (document.hidden) { nextToast(); return; }
    const el = TI.h('div', { class: 'ti-toast pop-in', role: 'status' },
      TI.h('span', { class: 'ti-toast-ic', 'aria-hidden': 'true' }, item.icon),
      TI.h('span', null, item.text, item.bold ? TI.h('b', null, item.bold) : null));
    document.body.append(el);
    setTimeout(() => {
      el.classList.add('is-out');
      setTimeout(() => { el.remove(); nextToast(); }, 160);
    }, 2600);
  }
  function queueToast(ids) {
    for (const id of ids) {
      const d = DEFS.find((x) => x.id === id);
      if (d) toast(d.icon, 'Lencana baru: ', d.name);
    }
  }

  // ---------- layar #/lencana ----------
  function render() {
    const st = TI.state;
    const got = earned(st);
    const list = DEFS;
    const n = Object.keys(got).length;
    const app = TI.page('Lencana', n + ' dari ' + list.length + ' lencana terkumpul',
      TI.h('div', { class: 'badge-grid' }, list.map((d) => {
        const when = got[d.id];
        return TI.h('div', { class: 'badge-card' + (when ? ' is-earned' : ''), 'aria-label': d.name + (when ? ', terkumpul' : ', belum terkumpul') },
          TI.h('span', { class: 'badge-ic', 'aria-hidden': 'true' }, when ? d.icon : '🔒'),
          TI.h('b', { class: 'badge-name' }, d.name),
          TI.h('span', { class: 'badge-how' }, d.how),
          TI.h('span', { class: 'badge-when' }, when ? 'Didapat ' + when : 'Belum terkumpul'),
          when && TI.Share ? TI.h('button', { type: 'button', class: 'badge-share', 'aria-label': 'Bagikan lencana ' + d.name, onclick: () => TI.Share.badge(d) }, '📣 Bagikan') : null);
      })));
    return app;
  }

  function teaserIcons(k = 3) {
    const got = TI.state.profile.badges || {};
    const ids = Object.keys(got);
    const icons = ids.slice(0, k).map((id) => (DEFS.find((d) => d.id === id) || {}).icon || '🏅');
    return { icons, more: Math.max(0, ids.length - k), total: DEFS.length };
  }

  TI.toast = toast;
  TI.Badges = { DEFS, evaluate, grant, render, teaserIcons };
  TI.VIEWS = TI.VIEWS || {};
  TI.VIEWS.lencana = render;
})();
