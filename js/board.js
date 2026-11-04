/* Taman Ilmu: papan juara (pekan ini dan sepanjang waktu) + pengiriman skor.
   Papan butuh internet; game tetap jalan penuh tanpa internet. file:// tidak pernah fetch. */
(function () {
  'use strict';
  const TI = window.TI;
  const CFG = window.TI_CONFIG || {};
  const CACHE_KEY = 'tamanIlmu.board';
  let cache = {};
  try { cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch (e) { cache = {}; }

  const online = () => location.protocol !== 'file:' && CFG.BOARD_ON !== false && !!CFG.BOARD_URL;
  const me = () => (TI.state.profile && TI.state.profile.playerId) || '';

  function saveCache() { try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (e) { /* mode privat */ } }

  async function post(body) {
    const r = await fetch(CFG.BOARD_URL + '/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
  }

  // Kirim total pekan ini. Fire-and-forget setelah layar hasil tampil: game tidak menunggu.
  function report(jen) {
    if (!online()) return;
    const P = TI.Progression;
    const st = TI.state;
    try {
      const w = P.ensureWeekly();
      const body = {
        player_id: st.profile.playerId,
        nickname: st.profile.nama,
        week_key: w.weekKey,
        jenjang: jen === 'sd' ? 'sd' : 'tk',
        xp: w.xp[jen] || 0,
        stars_week: w.stars[jen] || 0,
        plays: w.plays[jen] || 0,
        games_done: Object.keys(w.games).length,
        client_time: Date.now(),
      };
      post(body).catch(() => { setTimeout(() => { post(body).catch(() => { }); }, 5000); });
    } catch (e) { /* papan gagal tidak boleh mengganggu main */ }
  }

  async function fetchBoard(mode, jen) {
    const P = TI.Progression;
    const q = new URLSearchParams({ mode, jenjang: jen, me: me() });
    if (mode === 'week') q.set('week', P.weekKey());
    const r = await fetch(CFG.BOARD_URL + '/board?' + q.toString(), { signal: AbortSignal.timeout(6000) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    const key = mode + ':' + jen + (mode === 'week' ? ':' + P.weekKey() : '');
    cache[key] = { at: Date.now(), rows: data.rows || [], week: data.week || null };
    saveCache();
    return data.rows || [];
  }

  function cachedRows(mode, jen) {
    const P = TI.Progression;
    const key = mode + ':' + jen + (mode === 'week' ? ':' + P.weekKey() : '');
    return cache[key] || null;
  }

  // ---------- layar #/papan ----------
  let mode = 'week';
  let jen = 'tk';
  let seq = 0;

  function medal(n) { return n === 1 ? '🥇' : n === 2 ? '🥈' : n === 3 ? '🥉' : String(n); }

  function rowsNode(rows, offline) {
    const P = TI.Progression;
    const host = TI.h('div', { class: 'board-rows' });
    if (offline) host.append(TI.h('p', { class: 'board-note' }, 'Data terakhir tersimpan di HP ini.'));
    if (!rows.length) {
      host.append(TI.h('p', { class: 'board-empty' }, 'Belum ada pemain. Main dulu biar masuk papan!'));
      return host;
    }
    rows.forEach((r) => {
      host.append(TI.h('div', { class: 'board-row' + (r.me ? ' is-me' : '') + (r.rank <= 3 ? ' is-top' : '') },
        TI.h('span', { class: 'board-rank' }, medal(r.rank)),
        TI.h('span', { class: 'board-name' }, (r.nickname || 'Tanpa nama') + (r.me ? ' (kamu)' : '')),
        TI.h('span', { class: 'board-xp' }, r.xp + ' XP'),
        TI.h('span', { class: 'board-stars' }, '★ ' + r.stars)));
    });
    return host;
  }

  function render() {
    try { if (TI.Stats) TI.Stats.track('board_view', {}); } catch (e) { /* abaikan */ }
    const P = TI.Progression;
    const mySeq = ++seq;
    jen = TI.state.level === 'sd' ? 'sd' : 'tk';
    const wk = P.weekKey();
    const app = TI.page('Papan Juara', mode === 'week' ? 'Pekan ' + wk + ' · reset tiap Senin' : 'Sepanjang waktu',
      TI.h('div', { class: 'board-tools' },
        TI.h('div', { class: 'seg', role: 'group', 'aria-label': 'Pilih papan' },
          ['week', 'all'].map((m) => TI.h('button', {
            type: 'button', class: 'seg-btn', 'aria-pressed': String(mode === m),
            onclick: () => { mode = m; sfxTap(); render(); },
          }, m === 'week' ? 'Pekan Ini' : 'Sepanjang Waktu'))),
        TI.h('div', { class: 'seg', role: 'group', 'aria-label': 'Pilih jenjang' },
          ['tk', 'sd'].map((j) => TI.h('button', {
            type: 'button', class: 'seg-btn', 'aria-pressed': String(jen === j),
            onclick: () => { jen = j; sfxTap(); render(); },
          }, j.toUpperCase()))),
        TI.h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Segarkan papan', onclick: () => { sfxTap(); render(); } }, '🔄')),
      // status di luar board-host: replaceChildren di bawah tidak boleh menghapusnya
      TI.h('p', { class: 'board-status' }, 'Mengambil papan...'),
      TI.h('div', { class: 'board-host', id: 'board-host' }, rowsNode([], false)),
      TI.h('p', { class: 'board-note', id: 'board-countdown' }, ''));

    updateCountdown();
    const meRow = TI.h('p', { class: 'board-note' }, 'Nama kamu: ' + (TI.state.profile.nama || '') + ' (ubah di beranda)');
    app.append(meRow);

    if (!online()) {
      const c = cachedRows(mode, jen);
      app.querySelector('.board-status').textContent = 'Papan butuh koneksi internet. Main offline saja ya.';
      const host = app.querySelector('#board-host');
      host.replaceChildren(c ? rowsNode(c.rows, true) : TI.h('p', { class: 'board-empty' }, ''));
      if (!c) app.querySelector('.board-status').append(TI.h('br'), TI.h('span', null, 'Papan belum punya data di HP ini.'));
      return app;
    }

    fetchBoard(mode, jen).then((rows) => {
      if (mySeq !== seq) return;
      app.querySelector('.board-status').textContent = '';
      app.querySelector('#board-host').replaceChildren(rowsNode(rows, false));
      const mine = rows.find((r) => r.me);
      if (mode === 'week' && mine && mine.rank <= 10) TI.Badges.grant('juara-pekan');
    }).catch(() => {
      if (mySeq !== seq) return;
      const c = cachedRows(mode, jen);
      app.querySelector('.board-status').textContent = 'Papan tidak tersedia, main offline saja ya.';
      app.querySelector('#board-host').replaceChildren(c ? rowsNode(c.rows, true) : TI.h('p', { class: 'board-empty' }, ''));
    });
    return app;
  }

  function updateCountdown() {
    const el = document.getElementById('board-countdown');
    if (!el) return;
    const ms = TI.Progression.nextWeekStart() - Date.now();
    if (ms > 0) {
      const h = Math.floor(ms / 3600000), d = Math.floor(h / 24);
      el.textContent = 'Papan baru dalam ' + (d ? d + ' hari ' : '') + (h % 24) + ' jam.';
    }
  }

  function sfxTap() { TI.sfx('tap'); }

  TI.Board = { report, online, fetchBoard, cachedRows, render };
  TI.VIEWS = TI.VIEWS || {};
  TI.VIEWS.papan = render;
})();
