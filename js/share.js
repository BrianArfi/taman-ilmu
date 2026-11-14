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
      try { if (TI.Badges) TI.Badges.evaluate(true); } catch (e) { /* abaikan */ }
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
  function challengeURL(game, stars, lawan, seri) {
    const nama = (TI.state.profile && TI.state.profile.nama) || '';
    let u = BASE + '?tantang=' + encodeURIComponent(game.id) + '&skor=' + stars +
      '&dari=' + encodeURIComponent(nama);
    if (lawan) u += '&lawan=' + encodeURIComponent(lawan);
    if (seri) u += '&seri=' + encodeURIComponent(seri);
    return u;
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
      const lawan = String(q.get('lawan') || '').slice(0, 16);
      const seri = /^\d{1,2}-\d{1,2}$/.test(q.get('seri') || '') ? q.get('seri') : '';
      const key = gid + ':' + skor + ':' + dari + ((lawan || seri) ? ':' + lawan + ':' + seri : '');
      return { game, dari, skor, lawan, seri, key };
    } catch (e) { return null; }
  }
  function challenge(game, stars, lawan, seri) {
    try { if (TI.Stats) TI.Stats.track('challenge', {}); } catch (e) { /* abaikan */ }
    const bintang = '⭐'.repeat(Math.max(1, stars)) + ' (' + stars + '/3)';
    return bagikan('Tantangan · Taman Ilmu',
      'Aku dapat ' + bintang + ' di game ' + game.title + '! Berani terima tantanganku? ' +
      (lawan && seri ? 'Duel lawan ' + lawan + ': ' + seri + ' untukku. ' : '') +
      'Kalahkan skorku di sini: ' + challengeURL(game, stars, lawan, seri));
  }
  // Tantangan pekan: teks jujur ikut status main (belum main = ajakan, sudah = adu skor).
  function tantangPekan(game, best) {
    try { if (TI.Stats) TI.Stats.track('challenge', {}); } catch (e) { /* abaikan */ }
    const bintang = '⭐'.repeat(Math.max(1, best)) + ' (' + Math.max(1, best) + '/3)';
    const teks = best > 0
      ? 'Aku dapat ' + bintang + ' di game ' + game.title + ' (Tantangan Pekan Ini)! Berani terima tantanganku? Kalahkan skorku di sini: ' + challengeURL(game, best)
      : 'Tantangan Pekan Ini: game ' + game.title + '! Semua anak main game yang sama minggu ini. Ikut main dan tantang aku: ' + challengeURL(game, 1);
    return bagikan('Tantangan Pekan · Taman Ilmu', teks);
  }
  // Misi Harian Global: game gratis hari ini sama untuk semua anak.
  function misiHarian(game, best) {
    try { if (TI.Stats) TI.Stats.track('challenge', {}); } catch (e) { /* abaikan */ }
    const bintang = '⭐'.repeat(Math.max(1, best)) + ' (' + Math.max(1, best) + '/3)';
    const teks = best > 0
      ? 'Aku dapat ' + bintang + ' di Misi Hari Ini: game ' + game.title + '! Semua anak dapat misi yang sama. Ikut main dan tantang aku: ' + challengeURL(game, best)
      : 'Misi Hari Ini: game ' + game.title + '! Semua anak dapat misi yang sama hari ini. Ikut main dan tantang aku: ' + challengeURL(game, 1);
    return bagikan('Misi Harian · Taman Ilmu', teks);
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
  // Tantang sekelas: untuk diteruskan ke grup WA sekolah/kelas.
  function tantangKelas(game, stars) {
    try { if (TI.Stats) TI.Stats.track('challenge', {}); } catch (e) { /* abaikan */ }
    const nama = (TI.state.profile && TI.state.profile.nama) || '';
    const bintang = '⭐'.repeat(Math.max(1, stars)) + ' (' + stars + '/3)';
    const siapa = nama ? nama + ' dapat ' + bintang : 'Aku dapat ' + bintang;
    const lawan = nama ? 'skornya' : 'skorku';
    return bagikan('Tantangan Sekelas · Taman Ilmu',
      siapa + ' di game ' + game.title + '! Anak sekelas ada yang berani adu? ' +
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

  // Laporan anak untuk pasangan/keluarga: ringkasan kemajuan jenjang aktif.
  function laporan() {
    const lvl = TI.state.level === 'sd' ? 'SD' : 'TK';
    const nama = (TI.state.profile && TI.state.profile.nama) || 'Anak';
    const m = TI.Stats ? TI.Stats.summary() : { lvlDone: 0, lvlTotal: 0, lvlAvg: '0', byCat: {} };
    let topCat = '', topF = 0;
    for (const c of Object.keys(m.byCat || {})) {
      const f = m.byCat[c].f || 0;
      if (f > topF) { topF = f; topCat = c; }
    }
    const catNama = { islam: 'Agama Islam', mat: 'Matematika', sains: 'Sains', logika: 'Logika' };
    const rajin = topCat ? ' Paling rajin: ' + (catNama[topCat] || topCat) + '.' : '';
    return bagikan('Laporan Anak · Taman Ilmu',
      'Laporan main ' + nama + ' di Taman Ilmu (' + lvl + '): ' + m.lvlDone + '/' + m.lvlTotal +
      ' game selesai, rata-rata ★' + m.lvlAvg + '.' + rajin + ' Ayo main juga: ' + inviteURL());
  }

  // Kartu info ortu: teks alasan aman siap forward ke grup WA.
  function infoOrtu() {
    const poin = TI.OrtuPoin || [];
    const isi = poin.length ? '\n' + poin.join('\n') : '';
    return bagikan('Taman Ilmu',
      'Taman Ilmu: ' + totalGame() + ' game edukasi Islami TK/SD.' + isi +
      '\nCoba gratis: ' + inviteURL());
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

  const SERTIFIKAT = {
    shalat: { judul: 'Hafal 5 Waktu Shalat', lesson: 'Shalat wajib ada 5 waktu: Subuh, Zuhur, Ashar, Maghrib, Isya. Jumlahnya 17 rakaat sehari.' },
    adab: { judul: 'Adab Baik', lesson: 'Anak shalih membiasakan ucapan baik dan adab yang baik setiap hari.' },
  };
  const BULAN_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  function tanggalID() {
    const d = new Date(Date.now() + 7 * 3600 * 1000);
    return d.getUTCDate() + ' ' + BULAN_ID[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
  }
  async function gambarSertifikat(game, stars) {
    const W = 1080, H = 1350;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    try { await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]); } catch (e) { /* font sistem */ }
    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#fffdf4'); bg.addColorStop(1, '#f7ecd4');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#d4a017'; g.lineWidth = 14;
    rr(g, 40, 40, W - 80, H - 80, 40); g.stroke();
    g.strokeStyle = '#d4a017'; g.lineWidth = 4;
    rr(g, 70, 70, W - 140, H - 140, 28); g.stroke();
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    const nama = (TI.state.profile && TI.state.profile.nama) || 'Anak Hebat';
    const info = SERTIFIKAT[game.id] || { judul: game.title, lesson: '' };
    g.fillStyle = '#2b2d42';
    g.font = '800 60px "Baloo 2", sans-serif';
    g.fillText('🌙 Taman Ilmu', W / 2, 190);
    g.fillStyle = '#9a6b00';
    g.font = '800 84px "Baloo 2", sans-serif';
    g.fillText('SERTIFIKAT', W / 2, 320);
    g.fillStyle = '#2b2d42';
    g.font = '700 54px "Baloo 2", sans-serif';
    g.fillText('Penghargaan untuk', W / 2, 420);
    g.fillStyle = '#0e9f6e';
    g.font = '800 76px "Baloo 2", sans-serif';
    wrapText(g, nama, W / 2, 540, 880, 90);
    g.fillStyle = '#2b2d42';
    g.font = '700 48px "Baloo 2", sans-serif';
    wrapText(g, info.judul + ' · ' + game.title, W / 2, 660, 880, 60);
    g.font = '120px "Baloo 2", sans-serif';
    for (let i = 0; i < 3; i++) {
      g.fillStyle = i < stars ? '#ffc93c' : '#d9d2c3';
      g.fillText('★', W / 2 - 150 + i * 150, 820);
    }
    g.fillStyle = '#6b6f86';
    g.font = '700 44px "Baloo 2", sans-serif';
    wrapText(g, info.lesson, W / 2, 930, 860, 56);
    g.fillStyle = '#6b6f86';
    g.font = '700 44px "Baloo 2", sans-serif';
    g.fillText(tanggalID(), W / 2, 1150);
    g.fillStyle = '#2f6fed';
    g.font = '700 38px monospace';
    g.fillText(BASE.replace(/^https?:\/\//, ''), W / 2, 1220);
    return cv;
  }
  async function card(game, stars, jenis) {
    let blob = null;
    try {
      const cv = await (jenis === 'sertifikat' && SERTIFIKAT[game.id] ? gambarSertifikat(game, stars) : gambarKartu(game, stars));
      blob = await new Promise((res) => cv.toBlob(res, 'image/png'));
    } catch (e) { blob = null; }
    if (!blob) { TI.toast('🖼️', 'Gagal bikin gambar, coba lagi ya'); TI.sfx('salah'); return 'gagal'; }
    const file = new File([blob], 'taman-ilmu-' + (jenis === 'sertifikat' ? 'sertifikat-' : '') + game.id + '.png', { type: 'image/png' });
    const isSerti = jenis === 'sertifikat' && SERTIFIKAT[game.id];
    const teks = isSerti
      ? 'Aku dapat sertifikat ' + SERTIFIKAT[game.id].judul + ' (' + stars + '/3) di Taman Ilmu! Ayo main juga: ' + inviteURL()
      : teksScore(game, stars, false, (TI.state.profile && TI.state.profile.level) || 1);
    let hasil = 'gagal';
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: (isSerti ? 'Sertifikat ' : '') + game.title + ' · Taman Ilmu', text: teks });
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
        a.download = file.name;
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

  // Cetak sertifikat: buka gambar di jendela baru + dialog cetak; gagal = unduh saja.
  async function cetak(game, stars) {
    let url = '';
    try {
      const cv = await gambarSertifikat(game, stars);
      const blob = await new Promise((res) => cv.toBlob(res, 'image/png'));
      if (!blob) throw new Error('kanvas');
      url = URL.createObjectURL(blob);
      const w = window.open('', '_blank');
      if (!w) throw new Error('popup');
      w.document.write('<!doctype html><html><head><title>Sertifikat ' + game.title + '</title></head>' +
        '<body style="margin:0;text-align:center"><img src="' + url + '" style="width:100%" onload="window.print()"></body></html>');
      w.document.close();
      TI.sfx('menang');
      TI.toast('🖨️', 'Siap dicetak! Atur kertas A4 portrait ya');
    } catch (e) {
      if (url) URL.revokeObjectURL(url);
      TI.sfx('salah');
      TI.toast('🖨️', 'Unduh dulu, lalu cetak dari galeri ya');
      card(game, stars, 'sertifikat');
    }
  }

  TI.Share = { scoreResult, badge, rank, invite, inviteURL, teksScore, challenge, challengeURL, parseChallenge, streak, card, cetak, tantangKeluarga, tantangKelas, inviteOrtu, tantangPekan, laporan, infoOrtu, misiHarian };
})();
