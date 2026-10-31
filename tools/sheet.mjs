// Lembar kontak screenshot: satu gambar berisi semua game, supaya bisa dicek sekilas.
// Pakai: node tools/sheet.mjs [suffix]   (suffix: "tk", "sd", "tk-hp", "sd-mid", ...; default "tk")
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'C:/Users/Brian/asb-app-src/node_modules/playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const shots = path.join(here, 'shots');
const suffix = process.argv[2] || 'tk';
const phone = suffix.includes('hp');
const files = fs.readdirSync(shots).filter((f) => !f.startsWith('_') && f.endsWith(`-${suffix}.png`) && f.split('-').length === suffix.split('-').length + 1).sort();
const order = ['hijaiyah', 'wudhu', 'rukun', 'shalat', 'nabi', 'kartu', 'adab', 'hitung', 'gelembung', 'banding', 'pola', 'bentuk', 'jam', 'warung', 'timbangan', 'apung', 'magnet', 'lempar', 'wujud', 'tatasurya'];
files.sort((a, b) => order.indexOf(a.split('-')[0]) - order.indexOf(b.split('-')[0]));
const cols = phone ? 7 : 5, w = phone ? 200 : 300;
const html = `<body style="margin:0;background:#333;font:13px sans-serif;color:#fff;display:grid;grid-template-columns:repeat(${cols},${w}px);gap:6px;padding:6px">` +
  files.map((f) => `<div><img src="${pathToFileURL(path.join(shots, f)).href}" style="width:${w}px;display:block"><div>${f}</div></div>`).join('') + '</body>';
const tmp = path.join(shots, `_sheet.html`);
fs.writeFileSync(tmp, html);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: cols * (w + 6) + 6, height: 600 } });
await page.goto(pathToFileURL(tmp).href);
await page.waitForTimeout(500);
const out = path.join(shots, `_sheet-${suffix}.png`);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
fs.unlinkSync(tmp);
console.log(out, files.length, 'gambar');
