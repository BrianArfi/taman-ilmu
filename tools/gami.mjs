// Uji gamifikasi Taman Ilmu: migrasi v1 ke v2, XP, level, semua-terbuka,
// tantangan pekan, lencana, anti-farming, dan papan offline. Tidak mengubah smoke.mjs dan ui.mjs.
// Pakai: node tools/gami.mjs  (opsional PLIVE=1 untuk cek papan live)
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'C:/Users/Brian/asb-app-src/node_modules/playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = pathToFileURL(path.join(root, 'index.html')).href;

const browser = await chromium.launch({ headless: true });
const results = [];
const check = (name, ok, extra = '') => { results.push(ok); console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${extra ? '  ' + extra : ''}`); };
const seedV1 = (v1) => JSON.stringify({ level: 'tk', sound: false, tab: 'semua', stars: {}, ...v1 });

async function makePage(v1 = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  await ctx.addInitScript((s) => {
    localStorage.clear();
    localStorage.setItem('tamanIlmu.v1', s);
    const st = window.setTimeout; window.setTimeout = (f, ms, ...a) => st(f, (ms || 0) / 4, ...a);
  }, seedV1(v1));
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|net::/.test(m.text())) errors.push(m.text()); });
  page.errors = errors;
  return { ctx, page };
}

// 1. Pemain baru
{
  const { ctx, page } = await makePage();
  await page.goto(url);
  await page.waitForSelector('.grid');
  const r = await page.evaluate(() => ({
    xp: TI.state.profile.xp, nama: TI.state.profile.nama, pid: !!TI.state.profile.playerId,
    cards: document.querySelectorAll('a.card').length, all: TI.games.length,
    locked: document.querySelectorAll('.card.is-locked').length,
    noApi: !TI.Progression.unlockedSet && !TI.Progression.dailyFree,
    freeCard: !!document.querySelector('.free-card'),
    promo: !!document.querySelector('.promo-banner'),
    strip: !!document.querySelector('.player-strip'), tantangan: !!document.querySelector('.tantangan'),
    banner: !!document.querySelector('.nama-banner'), xpBar: !!document.querySelector('.xp-bar'),
  }));
  check('pemain baru: v2 terbentuk, xp 0', r.xp === 0 && r.nama && r.pid);
  check('pemain baru: semua game terbuka, tanpa kartu gratis', r.cards === r.all && r.locked === 0 && !r.freeCard, `(buka=${r.cards}/${r.all})`);
  check('pemain baru: API kunci sudah dicabut', r.noApi);
  check('beranda: strip + tantangan + nama + promo', r.strip && r.tantangan && r.banner && r.xpBar && r.promo);
  check('pemain baru: tanpa error JS', page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
}

// 2. Migrasi v1 -> v2
{
  const { ctx, page } = await makePage({ stars: { hijaiyah: { tk: 3 }, wudhu: { tk: 1 } } });
  await page.goto(url);
  await page.waitForSelector('.grid');
  let r = await page.evaluate(() => ({
    xp: TI.state.profile.xp, level: TI.state.profile.level, stars: TI.state.stars,
    playsH: TI.state.plays.hijaiyah, playsW: TI.state.plays.wudhu,
  }));
  check('migrasi: xp backfill 45+25=70, level 2', r.xp === 70 && r.level === 2, `(xp=${r.xp})`);
  check('migrasi: bintang lama utuh', r.stars.hijaiyah.tk === 3 && r.stars.wudhu.tk === 1);
  // ganti jenjang supaya saveState jalan, lalu cek mirror v1
  await page.getByRole('button', { name: 'SD', exact: true }).click();
  r = await page.evaluate(() => {
    const v1 = JSON.parse(localStorage.getItem('tamanIlmu.v1'));
    return { v1stars: v1.stars, v1level: v1.level, v2level: TI.state.level };
  });
  check('migrasi: mirror v1 tetap terpakai uji', r.v1stars.hijaiyah.tk === 3 && r.v1level === 'sd' && r.v2level === 'sd');
  await ctx.close();
}

// 3. Main sampai selesai: XP formula, plays, unlock rantai, chip XP
{
  const { ctx, page } = await makePage();
  await page.goto(url + '#/main/hijaiyah');
  await page.waitForSelector('#stage');
  let done = false;
  for (let i = 0; i < 300 && !done; i++) {
    done = await page.evaluate(() => !!document.querySelector('.result'));
    if (!done) {
      const clicked = await page.evaluate(() => {
        const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
        const b = [...document.querySelectorAll('#stage button:not([disabled]):not([aria-disabled="true"])')].filter(vis);
        if (!b.length) return false;
        const el = b[Math.floor(Math.random() * b.length)];
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return true;
      });
      await page.waitForTimeout(80);
      if (!clicked) await page.waitForTimeout(200);
    }
  }
  check('main hijaiyah sampai hasil', done);
  if (done) {
    const r = await page.evaluate(() => {
      const s1 = (JSON.parse(localStorage.getItem('tamanIlmu.v1')).stars.hijaiyah || {}).tk || 0;
      const s2 = (TI.state.stars.hijaiyah || {}).tk || 0;
      return {
        s1, s2, plays: TI.state.plays.hijaiyah.tk, wk: TI.state.weekly.weekKey,
        wkNow: TI.Progression.weekKey(), wxp: TI.state.weekly.xp.tk,
        noApi: !TI.Progression.unlockedSet && !TI.Progression.dailyFree,
        // (API kunci dicabut)
        chip: document.querySelector('.xp-chip') && document.querySelector('.xp-chip').textContent,
        acts: [...document.querySelectorAll('.result-actions > *')].map((el) => (el.textContent || '').trim()),
      };
    });
    check('finish: bintang v2 === v1', r.s1 === r.s2 && r.s1 >= 1, `(s=${r.s1})`);
    check('finish: plays + weekly.weekKey', r.plays === 1 && r.wk === r.wkNow);
    check('finish: xp formula 15+10s+2', r.wxp === 15 + 10 * r.s1 + 2, `(weekly=${r.wxp})`);
    // (rantai unlock dicabut; semua game selalu terbuka)
    check('finish: API kunci tidak ada', r.noApi);
    check('finish: chip XP tampil di layar hasil', !!r.chip && /\+\d+ XP/.test(r.chip), `(${r.chip})`);
    check('finish: hasil punya 7 tombol (lagi, bagikan, tantang, keluarga, sekelas, kartu, pilih)', JSON.stringify(r.acts) === JSON.stringify(['Main Lagi', '📣 Bagikan', '🏆 Tantang', '🏠 Tantang Keluarga', '🏫 Tantang Sekelas', '🖼️ Kartu', 'Pilih Game']), `(${r.acts.join('|')})`);
  }
  check('main: tanpa error JS', page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
}

// 4. Tanpa kunci: semua terbuka di level berapa pun
{
  const { ctx, page } = await makePage();
  await page.goto(url);
  await page.waitForSelector('.grid');
  const r = await page.evaluate(() => {
    const all = TI.games.length;
    const open = () => document.querySelectorAll('a.card').length;
    const locked = () => document.querySelectorAll('.card.is-locked').length;
    TI.state.profile.level = 1;
    const l1 = { open: open(), locked: locked() };
    TI.state.profile.level = 30;
    const l30 = { open: open(), locked: locked() };
    return { all, l1, l30 };
  });
  check('terbuka: level 1 semua kartu terbuka', r.l1.open === r.all && r.l1.locked === 0, `(buka=${r.l1.open}/${r.all})`);
  check('terbuka: level 30 tetap semua terbuka', r.l30.open === r.all && r.l30.locked === 0);
  await ctx.close();
}

// 5. Kurva XP
{
  const { ctx, page } = await makePage();
  await page.goto(url);
  const r = await page.evaluate(() => [0, 59, 60, 5800, 99999].map((x) => TI.Progression.levelOf(x)));
  check('kurva xp: levelOf 0,59,60,5800 = 1,1,2,12', r[0] === 1 && r[1] === 1 && r[2] === 2 && r[3] === 12 && r[4] === 12, `(${r})`);
  await ctx.close();
}

// 6. weekKey + rollover pekan
{
  const { ctx, page } = await makePage();
  await page.goto(url);
  const r = await page.evaluate(() => {
    const a = TI.Progression.weekKey(new Date('2026-11-01T10:00:00Z')); // Minggu 17:00 WIB
    const b = TI.Progression.weekKey(new Date('2026-11-02T00:00:00Z')); // Senin 07:00 WIB
    TI.state.weekly = { weekKey: '2020-W01', xp: { tk: 99 }, stars: { tk: 5 }, plays: { tk: 3 }, games: { x: 1 }, tantanganDone: true };
    TI.Progression.ensureWeekly();
    return { a, b, now: TI.state.weekly.weekKey, current: TI.Progression.weekKey(), xp: TI.state.weekly.xp.tk, done: TI.state.weekly.tantanganDone };
  });
  check('weekKey: Minggu W44, Senin W45', r.a === '2026-W44' && r.b === '2026-W45', `(${r.a},${r.b})`);
  check('rollover: counter pekan ter-reset', r.now === r.current && r.xp === undefined && r.done === false);
  await ctx.close();
}

// 7. Tantangan pekan: deterministik + bonus 40 sekali
{
  const { ctx, page } = await makePage();
  await page.goto(url);
  const r = await page.evaluate(() => {
    const c1 = TI.Progression.challengeGame();
    const c2 = TI.Progression.challengeGame();
    TI.state.stars = {};
    const a = TI.Progression.onFinish(c1, 'tk', 2, 0);
    const b = TI.Progression.onFinish(c1, 'tk', 2, 2);
    return { same: c1.id === c2.id, inGames: TI.games.some((g) => g.id === c1.id), aD: a.challengeDone, aXp: a.xp, bD: b.challengeDone, bXp: b.xp, runt: TI.state.tantangRuntun };
  });
  check('tantangan: rotasi stabil dan id sah', r.same && r.inGames);
  check('tantangan: bonus +40 cuma sekali', r.aD && r.aXp === 77 && !r.bD && r.bXp === 2, `(a=${r.aXp},b=${r.bXp})`);
  check('tantangan: runtun pekan 1 tercatat', r.runt && r.runt.count === 1 && !!r.runt.lastWeek, '(runtun=1)');
  await ctx.close();
}

// 8. Lencana
{
  const { ctx, page } = await makePage();
  await page.goto(url);
  const r = await page.evaluate(() => {
    const s = {};
    for (const g of TI.games) s[g.id] = { tk: g.cat === 'islam' ? 1 : 3 };
    TI.state.stars = s; // semua game terisi: islam 1, sisanya 3 (total ikut jumlah game)
    TI.state.streak = { last: TI.Progression.dayKey(), count: 3 };
    const fresh = TI.Badges.evaluate(false); // hitung saja, jangan catat
    const stamped = Object.keys(TI.state.profile.badges).length;
    TI.Badges.grant('juara-pekan');
    return { fresh, stamped, juara: !!TI.state.profile.badges['juara-pekan'] };
  });
  const has = (id) => r.fresh.includes(id);
  check('lencana: hafizh-kecil, semangat-3-hari, bintang-100', has('hafizh-kecil') && has('semangat-3-hari') && has('bintang-100'), `(${r.fresh.length} lencana)`);
  check('lencana: tier bintang baru (50, lima, dua-lima)', has('bintang-50') && has('penuh-lima') && has('emas-dua-lima'));
  check('lencana: evaluate(false) tidak mencatat', r.stamped === 0);
  check('lencana: grant juara-pekan mencatat', r.juara);
  await ctx.close();
}

// 9. Anti-farming: 6 selesai hari yang sama -> xp dasar 2,2,2,1,1,0
{
  const { ctx, page } = await makePage();
  await page.goto(url);
  const r = await page.evaluate(() => {
    const g = TI.games[0];
    const deltas = [];
    let prev = 0;
    for (let i = 0; i < 6; i++) {
      const before = TI.state.profile.xp;
      const gain = TI.Progression.onFinish(g, 'tk', 1, prev);
      prev = 1;
      deltas.push(TI.state.profile.xp - before);
    }
    return deltas;
  });
  const want = [27, 2, 2, 1, 1, 0];
  check('anti-farm: xp dasar 2,2,2,1,1,0', JSON.stringify(r) === JSON.stringify(want), `(${r})`);
  await ctx.close();
}

// 10. Papan offline (file://): tidak ada fetch, pesan offline, tanpa error
{
  const { ctx, page } = await makePage();
  let fetched = false;
  await page.goto(url + '#/papan');
  await page.waitForTimeout(400);
  const r = await page.evaluate(() => ({
    online: TI.Board.online(),
    status: (document.querySelector('.board-status') || {}).textContent || '',
  }));
  page.on('request', (req) => { if (req.url().startsWith('http')) fetched = true; });
  await page.evaluate(() => TI.Board.report('tk'));
  await page.waitForTimeout(300);
  check('papan offline: file:// mati total', r.online === false && !fetched, `(status: ${r.status.slice(0, 40)})`);
  check('papan offline: pesan tampil', /koneksi internet/.test(r.status));
  check('papan offline: tanpa error JS', page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
}

// 11. Papan live (opsional): PLIVE=1. Harus load URL live, bukan file://
// (online() selalu false di file://). Butuh versi baru sudah ter-deploy.
if (process.env.PLIVE === '1') {
  const { ctx, page } = await makePage();
  await page.goto('https://brianarfi.github.io/taman-ilmu/index.html#/papan');
  await page.waitForTimeout(3500);
  const r = await page.evaluate(() => ({
    rows: document.querySelectorAll('.board-row').length,
    empty: !!document.querySelector('.board-empty'),
    status: (document.querySelector('.board-status') || {}).textContent || '',
  }));
  // papan kosong itu sah: fetch sukses ditandai status bersih + ada baris atau pesan kosong
  check('papan live: fetch sukses', r.status === '' && (r.rows > 0 || r.empty), `(rows=${r.rows}, status=${r.status})`);
  await ctx.close();
}

// 12. Berbagi: bonus +5 XP sekali sehari, link ajakan, teks skor, tombol lencana
{
  const { ctx, page } = await makePage();
  await page.goto(url);
  const r = await page.evaluate(() => {
    const a = TI.Progression.onShare();
    const b = TI.Progression.onShare();
    return {
      aXp: a.xp, bXp: b.xp, lvlA: a.level,
      url: TI.Share.inviteURL(),
      teks: TI.Share.teksScore(TI.games[0], 3, true, 2),
      judul: TI.games[0].title,
      adaShare: !!(TI.Share && TI.Share.scoreResult && TI.Share.badge && TI.Share.invite),
      adaViral: !!(TI.Share.challenge && TI.Share.card && TI.Share.streak && TI.Share.parseChallenge),
    };
  });
  check('bagikan: modul Share lengkap', r.adaShare);
  check('bagikan: tantang + kartu + streak ada', r.adaViral);
  check('bagikan: bonus +5 sekali sehari', r.aXp === 5 && r.bXp === 0, `(a=${r.aXp},b=${r.bXp})`);
  check('bagikan: link ajakan berformat', /taman-ilmu\/\?ajak=.+/.test(r.url), `(${r.url})`);
  check('bagikan: teks skor ada bintang, judul, link', r.teks.includes('⭐') && r.teks.includes(r.judul) && r.teks.includes('taman-ilmu'));
  // lencana yang terkumpul dapat tombol Bagikan di layar #/lencana
  await page.evaluate(() => { TI.Badges.grant('bintang-pertama'); });
  await page.evaluate(() => { location.hash = '#/lencana'; });
  await page.waitForSelector('.badge-grid');
  const b = await page.evaluate(() => ({
    earned: document.querySelectorAll('.badge-card.is-earned').length,
    share: document.querySelectorAll('.badge-share').length,
  }));
  check('bagikan: kartu lencana dapat tombol Bagikan', b.earned >= 1 && b.share === b.earned, `(earned=${b.earned}, share=${b.share})`);
  check('bagikan: tanpa error JS', page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
}

// 13. Ajakan: banner ?ajak=Nama muncul di beranda, tombol ajak ada, tutup tersimpan
{
  const { ctx, page } = await makePage();
  await page.goto(url + '?ajak=Budi');
  await page.waitForSelector('.grid');
  let r = await page.evaluate(() => ({
    banner: !!document.querySelector('.ajak-banner'),
    nama: (document.querySelector('.ajak-txt b') || {}).textContent,
    btn: !!document.querySelector('.ajak-btn'),
  }));
  check('ajak: banner Budi tampil di beranda', r.banner && r.nama === 'Budi');
  check('ajak: tombol Ajak teman main ada di footer', r.btn);
  await page.click('.ajak-banner .nama-later');
  await page.waitForSelector('.grid');
  r = await page.evaluate(() => ({ banner: !!document.querySelector('.ajak-banner'), seen: TI.state.ajakSeen }));
  check('ajak: tutup tersimpan, banner gak muncul lagi', !r.banner && r.seen === 'Budi');
  check('ajak: tanpa error JS', page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
}

// 14. Keterbukaan + pips kemahiran: tanpa kartu gratis, pips tampil
{
  const { ctx, page } = await makePage();
  await page.goto(url);
  await page.waitForSelector('.grid');
  const r = await page.evaluate(() => ({
    cards: document.querySelectorAll('a.card').length, all: TI.games.length,
    locked: document.querySelectorAll('.card.is-locked').length,
    card: !!document.querySelector('.free-card'),
    pips: document.querySelectorAll('.card .pips').length,
    noApi: !TI.Progression.dailyFree && !TI.Progression.dailyFreeInfo && !TI.Share.misiHarian,
  }));
  check('terbuka: semua kartu tautan, tanpa terkunci', r.cards === r.all && r.locked === 0, `(${r.cards}/${r.all})`);
  check('terbuka: tanpa kartu gratis + pips tiap kartu', !r.card && r.pips === r.all && r.noApi, `(pips=${r.pips})`);
  check('terbuka: tanpa error JS', page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
}

// 15. Promo: banner tampil, tutup sampai besok, #/kelas jalan
{
  const { ctx, page } = await makePage();
  await page.goto(url);
  await page.waitForSelector('.grid');
  let r = await page.evaluate(() => ({ banner: !!document.querySelector('.promo-banner'), cta: (document.querySelector('.promo-go') || {}).textContent }));
  check('promo: banner tampil di atas', r.banner && !!r.cta, `(${r.cta})`);
  await page.click('.promo-x');
  r = await page.evaluate(() => ({ banner: !!document.querySelector('.promo-banner') }));
  check('promo: tutup menghilangkan', !r.banner);
  await page.goto(url + '#/kelas');
  await page.waitForSelector('.kelas-hero');
  r = await page.evaluate(() => ({ daftar: !!document.querySelector('.kelas-cta') }));
  check('promo: halaman kelas tampil', r.daftar);
  check('promo: tanpa error JS', page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
}

// 16. Statistik: main tercatat, #/statistik tampil
{
  const { ctx, page } = await makePage();
  await page.goto(url);
  await page.waitForSelector('.grid');
  await page.goto(url + '#/main/hijaiyah');
  await page.waitForSelector('#stage');
  let done = false;
  for (let i = 0; i < 300 && !done; i++) {
    done = await page.evaluate(() => !!document.querySelector('.result'));
    if (!done) {
      await page.evaluate(() => {
        const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 4 && r.height > 4; };
        const b = [...document.querySelectorAll('#stage button:not([disabled]):not([aria-disabled="true"])')].filter(vis);
        if (b.length) b[Math.floor(Math.random() * b.length)].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      });
      await page.waitForTimeout(80);
    }
  }
  const r = await page.evaluate(() => { const m = TI.Stats.summary(); return { plays: m.plays, finishes: m.finishes, visits: m.visits }; });
  check('stats: main tercatat', r.plays >= 1 && r.finishes >= 1 && r.visits >= 1, JSON.stringify(r));
  await page.goto(url + '#/statistik');
  await page.waitForSelector('.stat-grid');
  const s = await page.evaluate(() => document.querySelectorAll('.stat-card').length);
  check('stats: dashboard tampil 8 kartu', s === 8, `(${s})`);
  check('stats: tanpa error JS', page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
}

// 17. Tantangan: banner ?tantang tampil, terima membuka game
{
  const { ctx, page } = await makePage();
  await page.goto(url + '?tantang=hijaiyah&skor=3&dari=Budi');
  await page.waitForSelector('.grid');
  let r = await page.evaluate(() => ({ banner: !!document.querySelector('.tantang-banner'), txt: (document.querySelector('.tantang-txt') || {}).textContent || '' }));
  check('tantang: banner Budi tampil', r.banner && r.txt.includes('Budi') && r.txt.includes('3 bintang'));
  await page.click('.tantang-go');
  await page.waitForSelector('#stage');
  check('tantang: terima membuka game', /#\/main\/hijaiyah/.test(page.url()));
  check('tantang: tanpa error JS', page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
}

// 18. Klaim balik pengundang: banner ?klaim, +20 sekali, tolak ganda/diri
{
  const { ctx, page } = await makePage();
  await page.goto(url + '?klaim=Ani');
  await page.waitForSelector('.grid');
  let r = await page.evaluate(() => ({
    banner: !!document.querySelector('.klaim-banner'),
    txt: (document.querySelector('.klaim-banner') || {}).textContent || '',
  }));
  check('klaim: banner Ani tampil', r.banner && r.txt.includes('Ani') && r.txt.includes('+20 XP'));
  await page.click('.klaim-banner .tantang-go');
  await page.waitForSelector('.grid');
  r = await page.evaluate(() => ({
    xp: TI.state.profile.xp, duta: !!TI.state.profile.badges.duta,
    banner: !!document.querySelector('.klaim-banner'),
    lagi: TI.Progression.klaimBonus('Ani'),
    diri: TI.Progression.klaimBonus(TI.state.profile.nama),
    kosong: TI.Progression.klaimBonus('  '),
  }));
  check('klaim: +20 XP + lencana Duta, banner hilang', r.xp === 20 && r.duta && !r.banner, `(xp=${r.xp})`);
  check('klaim: tolak ganda, diri, kosong', r.lagi.xp === 0 && r.diri.xp === 0 && r.kosong.xp === 0);
  r = await page.evaluate(() => {
    const b = TI.Progression.klaimBonus('Cici');
    const c = TI.Progression.klaimBonus('Dodi');
    return { b: b.xp, c: c.xp, bonus: c.bonus3 };
  });
  check('klaim: bonus 3 (+35 di klaim ke-3)', r.b === 20 && r.c === 35 && r.bonus === true, `(${r.b},${r.c})`);
  await page.evaluate(() => { TI.state.ajakDari = 'Budi'; TI.state.ajakBonusDone = true; });
  await page.getByRole('button', { name: /Matematika/ }).click();
  await page.waitForSelector('.grid');
  r = await page.evaluate(() => ({
    kirim: [...document.querySelectorAll('.ajak-banner')].some((el) => (el.textContent || '').includes('Kirim klaim')),
  }));
  check('klaim: invitee ditawari kirim klaim', r.kirim);
  check('klaim: tanpa error JS', page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
}

await browser.close();
const bad = results.filter((x) => !x).length;
console.log(`\n${results.length - bad}/${results.length} lolos`);
process.exit(bad ? 1 : 0);
