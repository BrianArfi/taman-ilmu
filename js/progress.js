/* Taman Ilmu: mesin gamifikasi (XP, level, unlock, mastery, pekan, streak, tantangan).
   Game tidak perlu berubah: semuanya berjalan dari ctx.finish() di core.js.
   Kontrak ada di SPEC.md bagian 8. */
(function () {
  'use strict';
  const TI = window.TI;

  // ---------- kurva level (12 level, tematik taman) ----------
  const XP_LEVELS = [0, 60, 160, 320, 560, 900, 1350, 1900, 2600, 3500, 4600, 5800];
  const LEVEL_NAMES = ['Kecambah', 'Tunas', 'Semai', 'Sulur', 'Pohon Kecil', 'Rimbun',
    'Berbunga', 'Mekar', 'Berbuah', 'Panen Raya', 'Taman Indah', 'Penjaga Taman'];

  function levelOf(xp) {
    let l = 1;
    for (let i = 0; i < XP_LEVELS.length; i++) if (xp >= XP_LEVELS[i]) l = i + 1;
    return l;
  }
  function levelInfo(xp) {
    const l = levelOf(xp);
    const base = XP_LEVELS[l - 1];
    const maxed = l >= XP_LEVELS.length;
    const next = maxed ? base : XP_LEVELS[l];
    return { level: l, name: LEVEL_NAMES[l - 1], base, next, maxed };
  }

  // ---------- waktu WIB ----------
  const dayKey = () => new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
  function weekKey(date) {
    const d = new Date((date ? date.getTime() : Date.now()) + 7 * 3600 * 1000);
    const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    // pekan ISO dihitung dari Kamis pekan ini (benar di semua pergantian tahun)
    const dn = (t.getUTCDay() + 6) % 7; // Senin = 0
    t.setUTCDate(t.getUTCDate() - dn + 3);
    const isoYear = t.getUTCFullYear();
    const ft = new Date(Date.UTC(isoYear, 0, 4));
    const fdn = (ft.getUTCDay() + 6) % 7;
    ft.setUTCDate(ft.getUTCDate() - fdn + 3);
    const w = 1 + Math.round((t - ft) / (7 * 86400000));
    return isoYear + '-W' + String(w).padStart(2, '0');
  }
  // Senin 00:00 WIB berikutnya, sebagai epoch ms.
  function nextWeekStart() {
    const d = new Date(Date.now() + 7 * 3600 * 1000);
    const days = ((8 - d.getUTCDay()) % 7) || 7;
    const mid = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) + days * 86400000;
    return mid - 7 * 3600 * 1000;
  }

  // ---------- tantangan pekan (rotasi deterministik, sama untuk semua anak) ----------
  function challengeGame() {
    if (!TI.games.length) return null;
    const [y, w] = weekKey().split('-W').map(Number);
    const list = TI.games.slice().sort((a, b) => (a.id < b.id ? -1 : 1));
    return list[(y * 53 + w) % list.length];
  }

  function ensureWeekly() {
    const st = TI.state;
    const wk = weekKey();
    if (!st.weekly || st.weekly.weekKey !== wk) {
      st.weekly = { weekKey: wk, xp: {}, stars: {}, plays: {}, games: {}, tantanganDone: false };
    }
    return st.weekly;
  }

  function pruneDayLog() {
    const st = TI.state;
    const keep = {};
    for (const k of Object.keys(st.dayLog).sort().slice(-7)) keep[k] = st.dayLog[k]; // 7 hari: titik kartu streak
    st.dayLog = keep;
  }

  function updateStreak(dk) {
    const s = TI.state.streak;
    if (s.last === dk) return;
    const y = new Date(Date.now() + 7 * 3600 * 1000 - 86400000).toISOString().slice(0, 10);
    s.count = s.last === y ? (s.count || 0) + 1 : 1;
    s.last = dk;
  }

  // Semua game selalu terbuka (15 Nov 2026: sistem kunci dicabut; engagement dari bintang).

  // (gratis harian + teks cara membuka dicabut 15 Nov 2026 bersama sistem kunci)

  // ---------- mastery per (game, jenjang): 0 baru, 1 perunggu, 2 perak, 3 emas, 4 berlian ----------
  function tier(gid, jen) {
    const st = TI.state;
    const s = (st.stars[gid] || {})[jen] || 0;
    const p = ((st.plays || {})[gid] || {})[jen] || 0;
    if (s === 3 && p >= 5) return 4;
    if (s === 3) return 3;
    if (s >= 2) return 2;
    if (s >= 1) return 1;
    return 0;
  }

  // ---------- nama panggilan ----------
  const EMOJI_OK = '⭐🌙🌈🌸🌻🍀🍎⚽🎈💎🚀🔥';
  function cleanName(s) {
    let t = String(s || '').replace(/[‘’ʼʻ`]/g, "'").replace(/\s+/g, ' ').trim();
    let out = '';
    for (const ch of t) {
      if (/[\p{L}\p{N} '’\-]/u.test(ch) || EMOJI_OK.includes(ch)) out += ch;
    }
    return out.replace(/\s+/g, ' ').trim().slice(0, 16);
  }
  function nameValid(s) { return s.length >= 2; }

  // ---------- inti: dipanggil core.js saat game selesai ----------
  function onFinish(game, jen, stars, prevBest) {
    const st = TI.state;
    const p = st.profile;
    const dk = dayKey();
    let xp = 0;

    const firstHere = !((st.plays[game.id] || {})[jen]); // cek sebelum plays naik: core sudah menulis bintang lebih dulu
    const pg = (st.plays[game.id] = st.plays[game.id] || {});
    pg[jen] = (pg[jen] || 0) + 1;
    if (firstHere) xp += 15; // selesai pertama kali di jenjang ini
    if (stars > prevBest) xp += 10 * stars;          // rekor bintang naik
    const day = (st.dayLog[dk] = st.dayLog[dk] || {});
    const n = (day[game.id] || 0) + 1;
    day[game.id] = n;
    xp += n <= 3 ? 2 : n <= 5 ? 1 : 0;               // bonus dasar menurun, anti farming
    let bonusTeman = false;
    if (st.ajakDari && !st.ajakBonusDone) {
      st.ajakBonusDone = true;
      xp += 10;
      bonusTeman = true;
    }

    const w = ensureWeekly();
    w.xp[jen] = (w.xp[jen] || 0) + xp;
    w.stars[jen] = (w.stars[jen] || 0) + stars;
    w.plays[jen] = (w.plays[jen] || 0) + 1;
    w.games[game.id] = (w.games[game.id] || 0) + 1;

    let challengeDone = false;
    const ch = challengeGame();
    if (ch && ch.id === game.id && stars >= 2 && !w.tantanganDone) {
      w.tantanganDone = true;
      xp += 40;
      challengeDone = true;
      w.xp[jen] += 40;
      // Runtun pekan: lanjut bila pekan lalu juga selesai.
      const tr = (st.tantangRuntun = st.tantangRuntun || {});
      const prevWk = weekKey(new Date(Date.now() - 7 * 86400000));
      tr.count = (tr.lastWeek === prevWk) ? (tr.count || 0) + 1 : 1;
      tr.lastWeek = w.weekKey;
    }

    p.xp += xp;
    const lv = levelOf(p.xp);
    const levelUp = lv > p.level;
    p.level = lv;
    updateStreak(dk);
    pruneDayLog();

    const newBadges = TI.Badges ? TI.Badges.evaluate(true) : [];
    return { xp, levelUp, level: lv, badges: newBadges, challengeDone, bonusTeman, runtun: (st.tantangRuntun || {}).count || 0 };
  }

  function totals() {
    const st = TI.state;
    let stars = 0, plays = 0, full = 0;
    const byCat = {};
    for (const g of TI.games) {
      for (const jen of ['tk', 'sd']) {
        const s = (st.stars[g.id] || {})[jen] || 0;
        stars += s;
        if (s >= 1) (byCat[g.cat] = byCat[g.cat] || {})[g.id] = true;
        if (s === 3) full++;
        plays += ((st.plays[g.id] || {})[jen]) || 0;
      }
    }
    return { stars, plays, full, byCat };
  }

  // Bonus berbagi: +5 XP sekali sehari. Anak semangat mengajak teman,
  // tapi gak bisa farming XP dengan mengulang.
  function onShare() {
    const st = TI.state;
    const dk = dayKey();
    const s = (st.share = st.share || {});
    s.total = (s.total || 0) + 1;
    if (s.last === dk) return { xp: 0, levelUp: false, level: st.profile.level };
    s.last = dk;
    st.profile.xp += 5;
    const lv = levelOf(st.profile.xp);
    const levelUp = lv > st.profile.level;
    st.profile.level = lv;
    return { xp: 5, levelUp, level: lv };
  }

  // Tangga Duta: bonus naik di klaim ke-1/3/5/10, selainnya +20.
  const DUTA_TIERS = [[1, 20], [3, 35], [5, 50], [10, 100]];
  function dutaBonus(n) {
    for (const [t, xp] of DUTA_TIERS) if (n === t) return { tier: t, xp };
    return { tier: 0, xp: 20 };
  }
  function dutaNext(n) {
    for (const [t, xp] of DUTA_TIERS) if (t > n) return { n: t, xp, kurang: t - n };
    return null;
  }
  // Klaim balik pengundang: tangga Duta sekali per nama yang diajak main.
  // Nolak nama kosong, nama sendiri, dan klaim ganda.
  function klaimBonus(nama) {
    const st = TI.state;
    const k = (nama || '').trim();
    if (!k) return { xp: 0 };
    const aku = ((st.profile && st.profile.nama) || '').trim().toLowerCase();
    if (k.toLowerCase() === aku) return { xp: 0 };
    const m = (st.klaimDari = st.klaimDari || {});
    if (m[k.toLowerCase()]) return { xp: 0 };
    m[k.toLowerCase()] = dayKey();
    const n = Object.keys(m).length;
    const { tier, xp } = dutaBonus(n);
    st.profile.xp += xp;
    const lv = levelOf(st.profile.xp);
    const levelUp = lv > st.profile.level;
    st.profile.level = lv;
    if (TI.Badges) TI.Badges.grant('duta');
    if (TI.Badges) TI.Badges.evaluate(true);
    if (TI.save) TI.save();
    return { xp, tier, bonus3: tier === 3, count: n, next: dutaNext(n), levelUp, level: lv };
  }

  function init() {
    const st = TI.state;
    if (!st.profile) st.profile = { nama: 'Bintang ' + (10 + Math.floor(Math.random() * 90)), playerId: '', xp: 0, level: 1, badges: {}, namaChanged: false, seenNama: false, createdAt: dayKey() };
    if (!st.profile.playerId) {
      st.profile.playerId = (crypto && crypto.randomUUID) ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          return (c === 'x' ? r : (r & 3 | 8)).toString(16);
        });
    }
    st.profile.level = levelOf(st.profile.xp || 0);
    if (!st.share) st.share = {};
    if (!st.promoOff) st.promoOff = {};
    ensureWeekly();
    pruneDayLog();
    TI.Badges && TI.Badges.evaluate(true, true); // beri lencana lama secara senyap saat buka pertama
  }

  // ---------- layar #/nama ----------
  function nameScreen() {
    const st = TI.state;
    const input = TI.h('input', { class: 'name-input', maxlength: '16', value: st.profile.nama || '', 'aria-label': 'Nama panggilan', placeholder: 'Tulis namamu di sini' });
    const err = TI.h('p', { class: 'name-err', 'aria-live': 'polite' }, '');
    const emojiRow = TI.h('div', { class: 'name-emoji' },
      [...'⭐🌙🌈🌸🌻🍀🍎⚽🎈💎🚀🔥'].map((e) => TI.h('button', {
        type: 'button', class: 'name-emoji-btn', 'aria-label': 'Tambah emoji',
        onclick: () => { input.value = (input.value + e).slice(0, 16); TI.sfx('pop'); },
      }, e)));
    const save = TI.h('button', {
      type: 'button', class: 'ti-btn',
      onclick: () => {
        const clean = cleanName(input.value);
        if (!nameValid(clean)) { err.textContent = 'Nama 2 sampai 16 huruf ya'; TI.sfx('salah'); input.focus(); return; }
        st.profile.nama = clean;
        st.profile.namaChanged = true;
        st.profile.seenNama = true;
        if (TI.save) TI.save();
        TI.sfx('menang');
        TI.say('Halo ' + clean + '! Nama kamu sudah tersimpan.');
        setTimeout(() => { location.hash = '#/'; }, 900);
      },
    }, 'Simpan Nama');
    return TI.page('Siapa Namamu?', 'Nama ini tampil di papan juara. Tanpa nama asli ya, biar aman.',
      TI.h('div', { class: 'name-box' }, input, emojiRow, err, save));
  }

  TI.Progression = {
    XP_LEVELS, LEVEL_NAMES, levelOf, levelInfo, dayKey, weekKey, nextWeekStart,
    challengeGame, ensureWeekly,
    tier, cleanName, nameValid,
    onFinish, totals, onShare, klaimBonus, dutaBonus, dutaNext, init,
  };
  TI.VIEWS = TI.VIEWS || {};
  TI.VIEWS.nama = nameScreen;
  try { init(); } catch (e) { console.error(e); }
})();
