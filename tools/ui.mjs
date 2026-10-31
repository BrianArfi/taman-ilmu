// Uji tombol-tombol cangkang (yang tidak tersentuh uji acak): jenjang, suara, tab, kartu,
// kembali, Escape, Main Lagi, Pilih Game, bintang tersimpan. Pakai: node tools/ui.mjs
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'C:/Users/Brian/asb-app-src/node_modules/playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = pathToFileURL(path.join(root, 'index.html')).href;

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 } });
await ctx.addInitScript(() => {
  if (!sessionStorage.getItem('seeded')) { localStorage.clear(); sessionStorage.setItem('seeded', '1'); }
  const st = window.setTimeout; window.setTimeout = (f, ms, ...a) => st(f, (ms || 0) / 4, ...a);
});
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const results = [];
const check = (name, ok, extra = '') => { results.push(ok); console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${extra ? '  ' + extra : ''}`); };
const st = () => page.evaluate(() => JSON.parse(localStorage.getItem('tamanIlmu.v1') || '{}'));

await page.goto(url);
await page.waitForSelector('.grid');
const n = await page.locator('.card').count();
const reg = await page.evaluate(() => ({ all: TI.games.length, mat: TI.games.filter((g) => g.cat === 'mat').length }));
check('beranda menampilkan semua kartu', n === reg.all && n >= 20, `(${n} dari ${reg.all})`);

await page.getByRole('button', { name: 'SD', exact: true }).click();
check('tombol SD mengganti jenjang', (await st()).level === 'sd' && (await page.getByRole('button', { name: 'SD', exact: true }).getAttribute('aria-pressed')) === 'true');
await page.getByRole('button', { name: 'TK', exact: true }).click();
check('tombol TK mengganti jenjang', (await st()).level === 'tk');

await page.getByRole('button', { name: 'Matikan suara' }).click();
check('tombol suara mematikan', (await st()).sound === false && (await page.getByRole('button', { name: 'Nyalakan suara' }).count()) === 1);

await page.getByRole('button', { name: /Matematika/ }).click();
const mat = await page.locator('.card').count();
check('tab Matematika menyaring', mat === reg.mat, `(${mat})`);
await page.getByRole('button', { name: /Semua/ }).click();

await page.locator('.card').first().click();
await page.waitForSelector('#stage');
check('kartu membuka game', /#\/main\//.test(page.url()));
await page.getByRole('link', { name: 'Kembali ke menu' }).click();
await page.waitForSelector('.grid');
check('tombol kembali ke menu', true);

await page.locator('.card').first().click();
await page.waitForSelector('#stage');
await page.keyboard.press('Escape');
await page.waitForSelector('.grid');
check('Escape kembali ke menu', true);

async function finishHijaiyah() {
  for (let i = 0; i < 200; i++) {
    if (await page.locator('.result').count()) return true;
    const b = page.locator('#stage button:not([disabled]):not([aria-disabled="true"])');
    const c = await b.count();
    if (c) await b.nth(Math.floor(Math.random() * c)).click({ timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(80);
  }
  return false;
}
await page.goto(url + '#/main/hijaiyah');
await page.waitForSelector('#stage');
check('selesai sampai layar hasil', await finishHijaiyah());
await page.getByRole('button', { name: 'Main Lagi' }).click();
await page.waitForTimeout(300);
const restarted = (await page.locator('.result').count()) === 0 && (await page.locator('#stage .choice').count()) > 0;
check('Main Lagi memulai ulang', restarted);
await finishHijaiyah();
await page.getByRole('link', { name: 'Pilih Game' }).click();
await page.waitForSelector('.grid');
const stars = (await st()).stars?.hijaiyah?.tk || 0;
const total = await page.locator('.star-total').innerText();
check('bintang tersimpan dan tampil di beranda', stars >= 1 && total.includes(String(stars)), `(tk=${stars}, header="${total.replace(/\s+/g, ' ')}")`);

check('tanpa error JS', errors.length === 0, errors.join(' | '));
await browser.close();
const bad = results.filter((x) => !x).length;
console.log(`\n${results.length - bad}/${results.length} lolos`);
process.exit(bad ? 1 : 0);
