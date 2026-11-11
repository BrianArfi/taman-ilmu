/* Taman Ilmu: bagikan skor, lencana, peringkat, tantangan, kartu pamer, dan ajakan.
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

  function totalGame() { return TI.games ? TI.games.length : 100; }

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
      try { if (TI.Stats) TI.Stats.track('share', {}); } catch (e) { /* abaikan */ }
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
    const jen = TI.state.level === 'sd' ? 'SD' : 'TK';
    const inti = 'Aku peringkat ' + row.rank + ' papan pekan ini di Taman Ilmu (' + jen + ') dengan ' + row.xp + ' XP';
    const ajak = row.rank <= 3 ? 'Masuk 3 besar! Berani tantang aku: ' : 'Ayo tantang aku: ';
    return bagikan('Papan Juara · Taman Ilmu', inti + '! ' + ajak + inviteURL());
  }

  function invite() {
    return bagikan('Taman Ilmu',
      'Ayo main Taman Ilmu! ' + totalGame() + ' game seru belajar agama Islam, matematika, sains, dan logika untuk anak TK dan SD. ' +
      'Gratis, langsung di browser: ' + inviteURL());
  }

  // Undangan bersuara orang tua: untuk diteruskan ke grup WA sekolah/keluarga.
  function inviteOrtu() {
    return bagikan('Taman Ilmu',
      'Taman Ilmu: ' + totalGame() + ' game edukasi Islami untuk anak TK dan SD. ' +
      'Tanpa iklan, bisa offline, tanpa akun. Anak saya sudah ' + ringkas() + '. ' +
      'Coba gratis: ' + inviteURL());
  }

  // ---------- tantang teman: link ?tantang=gid&skor=N&dari=Nama ----------
  function challengeURL(game, stars) {
    const nama = (TI.state.profile && TI.state.profile.nama) || '';
    return BASE + '?tantang=' + encodeURIComponent(game.id) + '&skor=' + stars +
      '&dari=' + encodeURIComponent(nama);
  }
  // Baca tantangan dari URL. null kalau tidak ada atau gamenya tidak dikenal.
  function parseChallenge() {
    try {
      const q = new URLSearchParams(location.search);
      const gid = q.get('tantang');
      if (!gid) return null;
      const game = TI.games.find((g) => g.id === gid);
      if (!game) return null;
      const dari = String(q.get('dari') || 'Temanmu').slice(0, 16);
      const skor = Math.max(1, Math.min(3, parseInt(q.get('skor') || '1', 10) || 1));
      return { game, dari, skor, key: gid + ':' + skor + ':' + dari };
    } catch (e) { return null; }
  }
  function challenge(game, stars) {
    try { if (TI.Stats) TI.Stats.track('challenge', {}); } catch (e) { /* abaikan */ }
    const bintang = '⭐'.repeat(Math.max(1, stars)) + ' (' + stars + '/3)';
    return bagikan('Tantangan · Taman Ilmu',
      'Aku dapat ' + bintang + ' di game ' + game.title + '! Berani terima tantanganku? ' +
      'Kalahkan skorku di sini: ' + challengeURL(game, stars));
  }
  // Tantang keluarga: dibagikan orang tua ke grup WA keluarga, sudut pandang nama anak.
  function tantangKeluarga(game, stars) {
    try { if (TI.Stats) TI.Stats.track('challenge', {}); } catch (e) { /* abaikan */ }
    const nama = (TI.state.profile && TI.state.profile.nama) || '';
    const bintang = '⭐'.repeat(Math.max(1, stars)) + ' (' + stars + '/3)';
    const siapa = nama ? nama + ' dapat ' + bintang : 'Aku dapat ' + bintang;
    const lawan = nama ? 'skornya' : 'skorku';
    return bagikan('Tantangan Keluarga · Taman Ilmu',
      siapa + ' di game ' + game.title + '! Berani adu sama sepupu? ' +
      'Kalahkan ' + lawan + ' di sini: ' + challengeURL(game, stars));
  }

  // Pamer rajin main: rentetan hari beruntun.
  function streak() {
    const n = (TI.state.streak && TI.state.streak.count) || 0;
    return bagikan('Taman Ilmu',
      n >= 2
        ? 'Aku sudah main Taman Ilmu ' + n + ' hari berturut-turut! Sekarang ' + ringkas() + '. Ayo ikut: ' + inviteURL()
        : 'Aku main Taman Ilmu! Sekarang ' + ringkas() + '. Ayo main juga: ' + inviteURL());
  }

  // ---------- kartu pamer: gambar skor 1080x1350 untuk status WA/IG ----------
  function wrapText(g, text, cx, y, maxW, lh) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let line = '';
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; }
      else line = t;
    }
    if (line) lines.push(line);
    const y0 = y - ((lines.length - 1) * lh) / 2;
    lines.forEach((l, i) => g.fillText(l, cx, y0 + i * lh));
    return y0 + (lines.length - 1) * lh;
  }
  function rr(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  async function gambarKartu(game, stars) {
    const W = 1080, H = 1350;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    try { await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]); } catch (e) { /* font sistem */ }
    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#fff8ec'); bg.addColorStop(1, '#ffe9c2');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    const cols = ['#ffd23f', '#0e9f6e', '#2f6fed', '#ff6b6b', '#9b4dde', '#ff9f1c'];
    for (let i = 0; i < 90; i++) {
      g.fillStyle = cols[i % cols.length]; g.globalAlpha = 0.45;
      const s = 10 + ((i * 37) % 22);
      g.fillRect((i * 167) % W, (i * 251) % H, s, s * 0.6);
    }
    g.globalAlpha = 1;
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.fillStyle = '#2b2d42';
    g.font = '800 64px "Baloo 2", sans-serif';
    g.fillText('🌙 Taman Ilmu', W / 2, 140);
    g.font = '200px "Baloo 2", "Noto Naskh Arabic", sans-serif';
    g.fillText(game.icon || '⭐', W / 2, 400);
    g.fillStyle = '#2b2d42';
    g.font = '800 78px "Baloo 2", sans-serif';
    wrapText(g, game.title, W / 2, 540, 920, 92);
    g.font = '150px "Baloo 2", sans-serif';
    for (let i = 0; i < 3; i++) {
      g.fillStyle = i < stars ? '#ffc93c' : '#d9d2c3';
      g.fillText('★', W / 2 - 190 + i * 190, 760);
    }
    const nama = (TI.state.profile && TI.state.profile.nama) || '';
    g.fillStyle = '#0e9f6e';
    g.font = '800 62px "Baloo 2", sans-serif';
    g.fillText(nama, W / 2, 880);
    g.fillStyle = '#6b6f86';
    g.font = '700 50px "Baloo 2", sans-serif';
    g.fillText(ringkas(), W / 2, 955);
    g.fillStyle = '#ffffff';
    rr(g, 90, 1020, W - 180, 180, 36); g.fill();
    g.fillStyle = '#2b2d42';
    g.font = '700 44px "Baloo 2", sans-serif';
    g.fillText('Ayo main juga, gratis!', W / 2, 1095);
    g.fillStyle = '#2f6fed';
    g.font = '700 38px monospace';
    g.fillText(BASE.replace(/^https?:\/\//, ''), W / 2, 1155);
    g.fillStyle = '#6b6f86';
    g.font = '700 38px "Baloo 2", sans-serif';
    g.fillText(totalGame() + ' game edukasi anak Islami', W / 2, 1275);
    return cv;
  }

  async function card(game, stars) {
    let blob = null;
    try {
      const cv = await gambarKartu(game, stars);
      blob = await new Promise((res) => cv.toBlob(res, 'image/png'));
    } catch (e) { blob = null; }
    if (!blob) { TI.toast('🖼️', 'Gagal bikin gambar, coba lagi ya'); TI.sfx('salah'); return 'gagal'; }
    const file = new File([blob], 'taman-ilmu-' + game.id + '.png', { type: 'image/png' });
    const teks = teksScore(game, stars, false, (TI.state.profile && TI.state.profile.level) || 1);
    let hasil = 'gagal';
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: game.title + ' · Taman Ilmu', text: teks });
        hasil = 'share';
      } catch (e) {
        if (e && e.name === 'AbortError') return 'batal';
        hasil = 'gagal';
      }
    } else {
      // Tanpa bagi gambar (desktop): unduh PNG-nya, salin teksnya.
      try {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'taman-ilmu-' + game.id + '.png';
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        hasil = 'unduh';
      } catch (e) { hasil = 'gagal'; }
      try { await navigator.clipboard.writeText(teks); } catch (e) { /* abaikan */ }
    }
    if (hasil === 'share' || hasil === 'unduh') {
      try {
        if (TI.Stats) TI.Stats.track('card', {});
        TI.state.share = TI.state.share || {};
        TI.state.share.cardAt = TI.Progression.dayKey();
        if (TI.Badges) TI.Badges.evaluate(true);
        if (TI.save) TI.save();
      } catch (e) { /* abaikan */ }
      TI.sfx('menang');
      TI.toast('🖼️', hasil === 'unduh' ? 'Gambar tersimpan! Teksnya juga sudah tersalin.' : 'Kartu pamer terkirim!');
    } else {
      TI.sfx('salah');
      TI.toast('🖼️', 'Gagal berbagi gambar, coba lagi ya');
    }
    return hasil;
  }

  TI.Share = { scoreResult, badge, rank, invite, inviteURL, teksScore, challenge, challengeURL, parseChallenge, streak, card, tantangKeluarga, inviteOrtu };
})();
