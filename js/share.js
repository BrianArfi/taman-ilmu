/* Taman Ilmu: bagikan skor, lencana, peringkat, dan ajakan main.
   Jalurnya satu: Web Share API kalau ada (HP), kalau tidak salin ke clipboard
   lalu toast. Link yang dibagikan selalu bawa nama pengundang (?ajak=Nama),
   dan berbagi pertama tiap hari memberi +5 XP lewat Progression.onShare(). */
(function () {
  'use strict';
  const TI = window.TI;
  const BASE = (window.TI_CONFIG && window.TI_CONFIG.SITE_URL) || 'https://brianarfi.github.io/taman-ilmu/';

  function inviteURL() {
    const nama = (TI.state.profile && TI.state.profile.nama) || '';
    return BASE + '?ajak=' + encodeURIComponent(nama);
  }

  function ringkas() {
    const info = TI.Progression.levelInfo(TI.state.profile.xp || 0);
    const t = TI.Progression.totals();
    return 'Lv ' + info.level + ' ' + info.name + ' dengan ' + t.stars + ' bintang';
  }

  function teksScore(game, stars, levelUp, level) {
    const bintang = '⭐'.repeat(Math.max(1, stars)) + ' (' + stars + '/3)';
    let t;
    if (levelUp) {
      t = 'Aku naik ke Level ' + level + ' ' + TI.Progression.levelInfo(TI.state.profile.xp || 0).name +
        ' di Taman Ilmu! Baru saja dapat ' + bintang + ' di game ' + game.title;
    } else {
      t = 'Aku dapat ' + bintang + ' di game ' + game.title;
    }
    return t + '! Sekarang ' + ringkas() + '. Ayo main juga: ' + inviteURL();
  }

  async function kirim(title, text) {
    try {
      if (navigator.share) {
        await navigator.share({ title, text });
        return 'share';
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return 'batal';
    }
    // Tanpa Web Share (desktop tanpa layar bagikan, atau file://): salin teksnya.
    try {
      await navigator.clipboard.writeText(text);
      return 'salin';
    } catch (e) {
      const ta = TI.h('textarea', { style: 'position:fixed;opacity:0', 'aria-hidden': 'true' });
      ta.value = text;
      document.body.append(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
      ta.remove();
      return ok ? 'salin' : 'gagal';
    }
  }

  // Satu gerbang untuk semua tombol bagikan: kirim, beri bonus XP sekali sehari
  // kalau benar dibagikan, lalu kasih tahu anak lewat toast.
  async function bagikan(title, text) {
    const hasil = await kirim(title, text);
    let bonus = { xp: 0, levelUp: false, level: (TI.state.profile && TI.state.profile.level) || 1 };
    if (hasil === 'share' || hasil === 'salin') {
      try { bonus = TI.Progression.onShare(); } catch (e) { /* bonus gagal diam saja */ }
      if (TI.save) TI.save();
    }
    TI.sfx(hasil === 'gagal' ? 'salah' : 'menang');
    if (hasil === 'batal') return hasil;
    if (hasil === 'gagal') { TI.toast('📋', 'Gagal menyalin, coba lagi ya'); return hasil; }
    if (bonus.xp > 0) TI.toast('✨', 'Terima kasih sudah berbagi! ', '+' + bonus.xp + ' XP hari ini');
    else if (hasil === 'salin') TI.toast('📋', 'Tersalin! Tempel di WhatsApp ya');
    return hasil;
  }

  function scoreResult(game, stars, gain) {
    return bagikan(game.title + ' · Taman Ilmu',
      teksScore(game, stars, !!(gain && gain.levelUp), gain ? gain.level : ((TI.state.profile && TI.state.profile.level) || 1)));
  }

  function badge(d) {
    return bagikan('Lencana · Taman Ilmu',
      'Lencana baru ' + d.icon + ' ' + d.name + '! Sekarang ' + ringkas() + ' di Taman Ilmu. Ayo main juga: ' + inviteURL());
  }

  function rank(row) {
    return bagikan('Papan Juara · Taman Ilmu',
      'Aku peringkat ' + row.rank + ' papan pekan ini di Taman Ilmu (' + (TI.state.level === 'sd' ? 'SD' : 'TK') +
      ') dengan ' + row.xp + ' XP! Ayo tantang aku: ' + inviteURL());
  }

  function invite() {
    return bagikan('Taman Ilmu',
      'Ayo main Taman Ilmu! 50 game seru belajar agama Islam, matematika, sains, dan logika untuk anak TK dan SD. ' +
      'Gratis, langsung di browser: ' + inviteURL());
  }

  TI.Share = { scoreResult, badge, rank, invite, inviteURL, teksScore };
})();
