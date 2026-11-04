/* Taman Ilmu: statistik pemakaian + dashboard #/statistik.
   Lokal dulu: semua angka tersimpan di browser (tamanIlmu.stats.v1) dan dashboard
   jalan offline penuh. Kalau STATS_ON dan online, ringkasan anonim dikirim ke
   BOARD_URL + '/stats' (best-effort, gagal diam saja; mode no-cors + body
   text/plain). Kirim dan angka global (GET /stats/summary) hanya dicoba
   kalau STATS_UP true; selama false tidak ada fetch sama sekali.
   Tidak ada data pribadi: hanya ID acak pemain,
   ID game, dan angka. file:// tidak pernah fetch. */
(function () {
  'use strict';
  const TI = window.TI;
  const CFG = window.TI_CONFIG || {};
  const STORE = 'tamanIlmu.stats.v1';

  function blank() {
    return { v: 1, firstSeen: null, visits: 0, days: {}, plays: 0, finishes: 0, starsSum: 0,
      shares: 0, challenges: 0, cards: 0, boardViews: 0, freePlays: 0,
      promoViews: {}, promoClicks: {}, perGame: {} };
  }
  let S = blank();
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (raw && raw.v === 1) { S = Object.assign(blank(), raw); }
  } catch (e) { S = blank(); }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { /* mode privat */ } }

  const dayKey = () => (TI.Progression ? TI.Progression.dayKey()
    : new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10));
  const online = () => location.protocol !== 'file:' && CFG.STATS_ON !== false && CFG.STATS_UP === true && !!CFG.BOARD_URL;
  const me = () => (TI.state.profile && TI.state.profile.playerId) || '';

  function gstat(gid) {
    return (S.perGame[gid] = S.perGame[gid] || { s: 0, f: 0, b: 0 });
  }

  // Kirim ringkasan anonim (debounce 5 detik, fire-and-forget).
  let upTimer = 0;
  function scheduleUpload() {
    if (!online()) return;
    if (upTimer) return;
    upTimer = setTimeout(() => {
      upTimer = 0;
      try {
        const body = {
          player_id: me(), week_key: TI.Progression ? TI.Progression.weekKey() : null,
          visits: S.visits, days_active: Object.keys(S.days).length,
          plays: S.plays, finishes: S.finishes, stars: S.starsSum,
          shares: S.shares, challenges: S.challenges, cards: S.cards,
          free_plays: S.freePlays,
          per_game: S.perGame, client_time: Date.now(),
        };
        fetch(CFG.BOARD_URL + '/stats', { method: 'POST', mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(body),
          signal: AbortSignal.timeout(6000) }).catch(() => {});
      } catch (e) { /* statistik gagal tidak boleh mengganggu main */ }
    }, 5000);
  }

  function track(name, d) {
    d = d || {};
    try {
      const dk = dayKey();
      if (!S.firstSeen) S.firstSeen = dk;
      switch (name) {
        case 'home':
          S.visits++;
          S.days[dk] = (S.days[dk] || 0) + 1;
          break;
        case 'game_start': {
          S.plays++;
          const g = gstat(d.gid);
          g.s++;
          if (d.free) S.freePlays++;
          break;
        }
        case 'game_finish': {
          S.finishes++;
          S.starsSum += d.stars || 0;
          const g = gstat(d.gid);
          g.f++;
          if ((d.stars || 0) > (g.b || 0)) g.b = d.stars;
          break;
        }
        case 'share': S.shares++; break;
        case 'challenge': S.challenges++; break;
        case 'card': S.cards++; break;
        case 'board_view': S.boardViews++; break;
        case 'promo_view': S.promoViews[d.id] = (S.promoViews[d.id] || 0) + 1; break;
        case 'promo_click': S.promoClicks[d.id] = (S.promoClicks[d.id] || 0) + 1; break;
        default: return;
      }
      // Batasi memori: hari lebih dari 60 dibuang yang lama.
      const keys = Object.keys(S.days).sort();
      if (keys.length > 60) for (const k of keys.slice(0, keys.length - 60)) delete S.days[k];
      save();
      if (name === 'game_finish' || name === 'share' || name === 'home') scheduleUpload();
    } catch (e) { /* statistik gagal diam saja */ }
  }

  function summary() {
    const days = Object.keys(S.days).sort();
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const dk = new Date(Date.now() + 7 * 3600 * 1000 - i * 86400000).toISOString().slice(0, 10);
      last7.push({ day: dk.slice(5), n: S.days[dk] || 0 });
    }
    const top = Object.entries(S.perGame)
      .map(([gid, g]) => ({ gid, s: g.s, f: g.f, b: g.b }))
      .sort((a, b) => b.s - a.s).slice(0, 5);
    const byCat = {};
    for (const [gid, g] of Object.entries(S.perGame)) {
      const game = TI.games.find((x) => x.id === gid);
      const c = game ? game.cat : '?';
      byCat[c] = byCat[c] || { s: 0, f: 0 };
      byCat[c].s += g.s; byCat[c].f += g.f;
    }
    let pv = 0, pc = 0;
    for (const k in S.promoViews) pv += S.promoViews[k];
    for (const k in S.promoClicks) pc += S.promoClicks[k];
    return {
      visits: S.visits, daysActive: days.length, plays: S.plays, finishes: S.finishes,
      finishRate: S.plays ? Math.round((100 * S.finishes) / S.plays) : 0,
      avgStars: S.finishes ? (S.starsSum / S.finishes).toFixed(1) : '0',
      shares: S.shares, challenges: S.challenges, cards: S.cards,
      boardViews: S.boardViews, freePlays: S.freePlays,
      firstSeen: S.firstSeen, last7, top, byCat, promoViews: pv, promoClicks: pc,
      promoCTR: pv ? Math.round((100 * pc) / pv) : 0,
    };
  }

  // ---------- dashboard #/statistik (milik perangkat ini + global kalau ada server) ----------
  async function fetchGlobal(host) {
    if (!CFG.STATS_UP) {
      host.replaceChildren(TI.h('p', { class: 'board-note' }, 'Server statistik belum dipasang. Minta admin menyalakannya.'));
      return;
    }
    if (!online()) {
      host.replaceChildren(TI.h('p', { class: 'board-note' }, 'Data global butuh internet dan server statistik.'));
      return;
    }
    try {
      const r = await fetch(CFG.BOARD_URL + '/stats/summary', { signal: AbortSignal.timeout(6000) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const g = await r.json();
      host.replaceChildren(TI.h('div', { class: 'stat-grid' },
        TI.h('div', { class: 'stat-card' }, TI.h('b', null, String(g.visitors ?? '-')), TI.h('span', null, 'Anak main (global)')),
        TI.h('div', { class: 'stat-card' }, TI.h('b', null, String(g.plays ?? '-')), TI.h('span', null, 'Total main (global)')),
        TI.h('div', { class: 'stat-card' }, TI.h('b', null, String(g.finishes ?? '-')), TI.h('span', null, 'Selesai (global)')),
        TI.h('div', { class: 'stat-card' }, TI.h('b', null, String(g.shares ?? '-')), TI.h('span', null, 'Dibagikan (global)'))));
    } catch (e) {
      host.replaceChildren(TI.h('p', { class: 'board-note' }, 'Server statistik belum menjawab. Coba lagi nanti.'));
    }
  }

  function render() {
    const m = summary();
    const byId = (id) => TI.games.find((g) => g.id === id);
    const app = TI.page('Statistik', 'Perangkat ini' + (m.firstSeen ? ', main sejak ' + m.firstSeen : ''),
      TI.h('div', { class: 'stat-grid' },
        TI.h('div', { class: 'stat-card' }, TI.h('b', null, String(m.visits)), TI.h('span', null, 'Kunjungan')),
        TI.h('div', { class: 'stat-card' }, TI.h('b', null, String(m.daysActive)), TI.h('span', null, 'Hari aktif')),
        TI.h('div', { class: 'stat-card' }, TI.h('b', null, String(m.plays)), TI.h('span', null, 'Game dimainkan')),
        TI.h('div', { class: 'stat-card' }, TI.h('b', null, String(m.finishes)), TI.h('span', null, 'Game selesai')),
        TI.h('div', { class: 'stat-card' }, TI.h('b', null, m.finishRate + '%'), TI.h('span', null, 'Tingkat selesai')),
        TI.h('div', { class: 'stat-card' }, TI.h('b', null, '★ ' + m.avgStars), TI.h('span', null, 'Rata-rata bintang')),
        TI.h('div', { class: 'stat-card' }, TI.h('b', null, String(m.shares)), TI.h('span', null, 'Bagikan')),
        TI.h('div', { class: 'stat-card' }, TI.h('b', null, String(m.freePlays)), TI.h('span', null, 'Main gratis harian'))),
      TI.h('h3', { class: 'stat-h' }, 'Aktif 7 hari terakhir'),
      TI.h('div', { class: 'stat-week' }, m.last7.map((d) =>
        TI.h('span', { class: 'stat-day' + (d.n ? ' is-on' : ''), title: d.day + ': ' + d.n + ' kunjungan' }, d.day.slice(3)))),
      TI.h('h3', { class: 'stat-h' }, 'Game paling sering dimainkan'),
      m.top.length ? TI.h('ol', { class: 'stat-top' }, m.top.map((t) => {
        const g = byId(t.gid);
        return TI.h('li', null, (g ? g.icon + ' ' + g.title : t.gid) + ' (' + t.s + ' main, ★' + t.b + ')');
      })) : TI.h('p', { class: 'board-note' }, 'Belum ada. Main dulu yuk.'),
      TI.h('h3', { class: 'stat-h' }, 'Banner promosi'),
      TI.h('p', { class: 'board-note' }, 'Dilihat ' + m.promoViews + ' kali, diklik ' + m.promoClicks + ' kali (' + m.promoCTR + '%).'),
      TI.h('h3', { class: 'stat-h' }, 'Seluruh pemain'),
      TI.h('div', { class: 'stat-global', id: 'stat-global' }, TI.h('p', { class: 'board-note' }, 'Mengambil data global...')));
    fetchGlobal(app.querySelector('#stat-global'));
    return app;
  }

  TI.Stats = { track, summary };
  TI.VIEWS = TI.VIEWS || {};
  TI.VIEWS.statistik = render;
})();
