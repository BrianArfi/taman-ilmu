// Uji asap Taman Ilmu: buka tiap game (TK dan SD), main acak sampai layar hasil muncul,
// catat error JS, overflow horizontal di HP, dan simpan screenshot.
// Pakai: node tools/smoke.mjs [id-game ...] [--phone] [--max=160]
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const PW = process.env.PLAYWRIGHT_PATH || 'C:/Users/Brian/asb-app-src/node_modules/playwright';
const { chromium } = require(PW);

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const url = pathToFileURL(path.join(root, 'index.html')).href;
const shots = path.join(here, 'shots');
fs.mkdirSync(shots, { recursive: true });

const args = process.argv.slice(2);
const only = args.filter((a) => !a.startsWith('--'));
const maxActions = +(args.find((a) => a.startsWith('--max=')) || '--max=160').slice(6);
const levels = (args.find((a) => a.startsWith('--levels=')) || '--levels=tk,sd').slice(9).split(',');
const timeLimit = +(args.find((a) => a.startsWith("--time=")) || "--time=120").slice(7) * 1000;

const browser = await chromium.launch({ headless: true });

async function newPage(viewport, level) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, hasTouch: viewport.width < 600 });
  await ctx.addInitScript((lvl) => {
    localStorage.setItem('tamanIlmu.v1', JSON.stringify({ level: lvl, sound: false, tab: 'semua', stars: {} }));
    const st = window.setTimeout, si = window.setInterval;
    window.setTimeout = (f, ms, ...a) => st(f, Math.max(0, (ms || 0) / 4), ...a); // percepat jeda antar soal
    window.setInterval = (f, ms, ...a) => si(f, Math.max(4, (ms || 0) / 2), ...a);
  }, level);
  // blok font online supaya uji tetap jalan tanpa internet
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|ERR_FAILED|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  page.on('requestfailed', (r) => { if (!/fonts\.g/.test(r.url())) errors.push('missing: ' + r.url().split('/').slice(-2).join('/')); });
  return { ctx, page, errors };
}

const probe = await newPage({ width: 1024, height: 768 }, 'tk');
await probe.page.goto(url);
await probe.page.waitForTimeout(300);
const ids = await probe.page.evaluate(() => window.TI.games.map((g) => g.id));
const homeErrors = probe.errors.slice();
await probe.page.screenshot({ path: path.join(shots, '_home.png'), fullPage: true });
await probe.ctx.close();

const todo = only.length ? ids.filter((id) => only.includes(id)) : ids;
console.log(`games registered: ${ids.length} (${ids.join(', ')})`);
const isMissingGame = (e) => /^missing: games\//.test(e); // file game builder lain yang belum dibuat
const missingGames = homeErrors.filter(isMissingGame);
if (missingGames.length) console.log(`belum ada (${missingGames.length} file game): ` + missingGames.map((e) => e.slice(15)).join(', '));
const otherHome = homeErrors.filter((e) => !isMissingGame(e));
if (otherHome.length) console.log('HOME errors:\n  ' + otherHome.join('\n  '));

async function play(id, level, viewport, tag) {
  const { ctx, page, errors } = await newPage(viewport, level);
  await page.goto(url + '#/main/' + id);
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(shots, `${id}-${level}${tag}.png`) });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  let actions = 0, finished = false, midShot = false;
  const t0 = Date.now();
  while (actions < maxActions && Date.now() - t0 < timeLimit) {
    finished = await page.evaluate(() => !!document.querySelector('.result'));
    if (finished) break;
    const did = await page.evaluate(() => {
      const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 4 && r.height > 4 && cs.visibility !== 'hidden' && cs.pointerEvents !== 'none'; };
      const ranges = [...document.querySelectorAll('#stage input[type=range]')].filter(vis);
      if (ranges.length && Math.random() < 0.35) {
        const r = ranges[Math.floor(Math.random() * ranges.length)];
        const min = +r.min || 0, max = +r.max || 100, step = +r.step || 1;
        r.value = String(min + Math.round((Math.random() * (max - min)) / step) * step);
        r.dispatchEvent(new Event('input', { bubbles: true }));
        r.dispatchEvent(new Event('change', { bubbles: true }));
        return 'range';
      }
      const cands = [...document.querySelectorAll('#stage button:not([disabled]):not([aria-disabled="true"]), #stage [data-tap]')].filter(vis);
      if (!cands.length) return null;
      const el = cands[Math.floor(Math.random() * cands.length)];
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      ['pointerdown', 'pointerup'].forEach((t) => el.dispatchEvent(new PointerEvent(t, { bubbles: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true })));
      // MouseEvent, bukan el.click(): elemen SVG (juring, slot) tidak punya .click()
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y }));
      return (typeof el.className === 'string' ? el.className : el.getAttribute('class')) || el.tagName;
    });
    if (did) actions++;
    if (!midShot && actions >= 6) { midShot = true; await page.screenshot({ path: path.join(shots, `${id}-${level}${tag}-mid.png`) }); }
    await page.waitForTimeout(did ? 90 : 250);
  }
  if (finished) await page.screenshot({ path: path.join(shots, `${id}-${level}${tag}-end.png`) });
  const stars = await page.evaluate((gid) => { try { return JSON.parse(localStorage.getItem('tamanIlmu.v1')).stars[gid]; } catch (e) { return null; } }, id);
  // keluar lewat Escape: pastikan kembali ke menu tanpa error
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const backHome = await page.evaluate(() => !!document.querySelector('.grid'));
  await ctx.close();
  return { id, level: level + tag, finished, actions, secs: ((Date.now() - t0) / 1000).toFixed(0), overflow, backHome, stars, errors };
}

const phone = args.includes('--phone');
const jobs = [];
for (const id of todo) for (const lv of levels) {
  jobs.push(() => play(id, lv, { width: 1024, height: 768 }, ''));
  if (phone) jobs.push(() => play(id, lv, { width: 390, height: 844 }, '-hp'));
}
const results = [];
let next = 0;
await Promise.all(Array.from({ length: 4 }, async () => { while (next < jobs.length) { const j = jobs[next++]; results.push(await j()); } }));
results.sort((a, b) => (a.id + a.level).localeCompare(b.id + b.level));

let bad = 0;
for (const r of results) {
  r.errors = r.errors.filter((e) => !isMissingGame(e));
  const ok = r.finished && !r.errors.length && r.overflow <= 1 && r.backHome;
  if (!ok) bad++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${r.id.padEnd(11)} ${r.level.padEnd(6)} finished=${r.finished} actions=${r.actions} ${r.secs}s overflowX=${r.overflow} escHome=${r.backHome} stars=${JSON.stringify(r.stars)}`);
  for (const e of [...new Set(r.errors)].slice(0, 6)) console.log('       ' + e);
}
console.log(`\n${results.length - bad}/${results.length} lolos. Screenshot di ${shots}`);
await browser.close();
process.exit(bad ? 1 : 0);
