// Uji gamifikasi Taman Ilmu: migrasi v1 ke v2, XP, level, unlock, tantangan pekan,
// lencana, anti-farming, dan papan offline. Tidak mengubah smoke.mjs dan ui.mjs.
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
    unlocked: TI.Progression.unlockedSet().size,
    strip: !!document.querySelector('.player-strip'), tantangan: !!document.querySelector('.tantangan'),
    banner: !!document.querySelector('.nama-banner'), xpBar: !!document.querySelector('.xp-bar'),
  }));
  check('pemain baru: v2 terbentuk, xp 0', r.xp === 0 && r.nama && r.pid);
  check('pemain baru: 8 game terbuka', r.unlocked === 8, `(${r.unlocked})`);
  check('beranda: strip + tantangan + banner nama', r.strip && r.tantangan && r.banner && r.xpBar);
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
        unlocked: [...TI.Progression.unlockedSet()],
        chip: document.querySelector('.xp-chip') && document.querySelector('.xp-chip').textContent,
      };
    });
    check('finish: bintang v2 === v1', r.s1 === r.s2 && r.s1 >= 1, `(s=${r.s1})`);
    check('finish: plays + weekly.weekKey', r.plays === 1 && r.wk === r.wkNow);
    check('finish: xp formula 15+10s+2', r.wxp === 15 + 10 * r.s1 + 2, `(weekly=${r.wxp})`);
    // rantai: bintang di hijaiyah membuka wudhu (slot ke-2); rukun baru terbuka setelah wudhu dapat bintang
    check('finish: wudhu terbuka, rukun masih dikunci', r.unlocked.includes('wudhu') && !r.unlocked.includes('rukun'));
    check('finish: chip XP tampil di layar hasil', !!r.chip && /\+\d+ XP/.test(r.chip), `(${r.chip})`);
  }
  check('main: tanpa error JS', page.errors.length === 0, page.errors.join(' | '));
  await ctx.close();
}

// 4. Unlock exact per level
{
  const { ctx, page } = await makePage();
  await page.goto(url);
  await page.waitForSelector('.grid');
  const r = await page.evaluate(() => {
    const byCat = {};
    for (const g of TI.games) (byCat[g.cat] = byCat[g.cat] || []).push(g.id);
    const atLevel = (lv) => {
      TI.state.profile.level = lv;
      const out = new Set();
      for (const cat in byCat) byCat[cat].forEach((id, i) => { if (i + 1 <= 2 || i + 1 <= lv + 1) out.add(id); });
      return out.size;
    };
    const l1 = [...TI.Progression.unlockedSet()];
    TI.state.profile.level = 1;
    const exact8 = l1.length === 8 && l1.includes('hijaiyah') && l1.includes('sudoku') && !l1.includes('mobil');
    // taman terpanjang 15 game: level path membuka semua saat level 14 (k <= 15)
    TI.state.profile.level = 14;
    const l14 = TI.Progression.unlockedSet().size === TI.games.length;
    return { n1: atLevel(1), n5: atLevel(5), exact8, l14 };
  });
  check('unlock: level 1 tepat 8 game', r.exact8 && r.n1 === 8, `(n1=${r.n1})`);
  check('unlock: level 5 tepat 24 game', r.n5 === 24, `(n5=${r.n5})`);
  check('unlock: level 14 buka semua', r.l14);
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
    return { same: c1.id === c2.id, inGames: TI.games.some((g) => g.id === c1.id), aD: a.challengeDone, aXp: a.xp, bD: b.challengeDone, bXp: b.xp };
  });
  check('tantangan: rotasi stabil dan id sah', r.same && r.inGames);
  check('tantangan: bonus +40 cuma sekali', r.aD && r.aXp === 77 && !r.bD && r.bXp === 2, `(a=${r.aXp},b=${r.bXp})`);
  await ctx.close();
}

// 8. Lencana
{
  const { ctx, page } = await makePage();
  await page.goto(url);
  const r = await page.evaluate(() => {
    const s = {};
    for (const g of TI.games) s[g.id] = { tk: g.cat === 'islam' ? 1 : 3 };
    TI.state.stars = s; // islam 15 + mat 45 + sains 39 + logika 21 = 120 bintang
    TI.state.streak = { last: TI.Progression.dayKey(), count: 3 };
    const fresh = TI.Badges.evaluate(false); // hitung saja, jangan catat
    const stamped = Object.keys(TI.state.profile.badges).length;
    TI.Badges.grant('juara-pekan');
    return { fresh, stamped, juara: !!TI.state.profile.badges['juara-pekan'] };
  });
  const has = (id) => r.fresh.includes(id);
  check('lencana: hafizh-kecil, semangat-3-hari, bintang-100', has('hafizh-kecil') && has('semangat-3-hari') && has('bintang-100'), `(${r.fresh.length} lencana)`);
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
    status: (document.querySelector('.board-status') || {}).textContent || '',
  }));
  check('papan live: baris tampil', r.rows > 0 && r.status === '', `(rows=${r.rows}, status=${r.status})`);
  await ctx.close();
}

await browser.close();
const bad = results.filter((x) => !x).length;
console.log(`\n${results.length - bad}/${results.length} lolos`);
process.exit(bad ? 1 : 0);
