#!/usr/bin/env node
/**
 * @fileoverview Renders an HTML template (creatives/templates/<name>.html) to a
 * PNG with headless Chromium — brand fonts, Cyrillic and Polish diacritics
 * included. Two uses:
 *   1. a transparent overlay (hook + CTA + logo) to composite onto a video with
 *      video-finish.mjs;
 *   2. a complete static ad from a photo plus text.
 *
 *   node scripts/render-overlay.mjs --template overlay-hook-cta --format 9x16 \
 *        --var hook="Нарешті знайшла свій салон" --var cta="Записатися онлайн" --var lang=ua \
 *        --out creatives/_work/x.png [--image sources/…jpg] [--transparent]
 *   node scripts/render-overlay.mjs --spec spec.json   (same keys: template, format, vars, image, out, transparent)
 *
 * Templates get {{key}} substitutions plus {{fontsDir}}, {{logosDir}}, {{image}} (file:// URL),
 * {{w}}, {{h}}, and every brand color as {{color_orange}} etc. Safe zones: templates keep text
 * out of the top 14% and bottom 35% for 9:16 (Meta Reels/Stories UI).
 */

import {existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {rel} from './lib/env.mjs';
import {brand, concepts} from './lib/config.mjs';

const argv = process.argv.slice(2);
const flag = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
let o = {template: flag('--template'), format: flag('--format', '9x16'), out: flag('--out'), image: flag('--image'), transparent: argv.includes('--transparent'), vars: {}};
if (flag('--spec')) o = {...o, ...JSON.parse(readFileSync(flag('--spec'), 'utf8'))};
for (let i = 0; i < argv.length; i++) if (argv[i] === '--var') { const [k, ...v] = argv[i + 1].split('='); o.vars[k] = v.join('='); }
if (!o.template || !o.out) { console.log('usage: render-overlay.mjs --template <name> --out <png> [--format 9x16|4x5|1x1] [--image <file>] [--transparent] [--var k=v …]'); process.exit(2); }

const fmt = concepts().formats[o.format];
if (!fmt) { console.error(`unknown format ${o.format}`); process.exit(2); }
const tplFile = rel('creatives', 'templates', `${o.template}.html`);
if (!existsSync(tplFile)) { console.error(`template not found: ${tplFile}`); process.exit(2); }

const b = brand();
const vars = {
  ...Object.fromEntries(Object.entries(b.colors).map(([k, v]) => [`color_${k}`, v])),
  fontsDir: pathToFileURL(rel('brand', 'fonts')).href,
  logosDir: pathToFileURL(rel('brand', 'logos')).href,
  image: o.image ? pathToFileURL(path.resolve(o.image)).href : '',
  w: fmt.w, h: fmt.h, format: o.format, lang: 'pl', hook: '', sub: '', cta: '', price: '', badge: '',
  ...o.vars,
};
const html = readFileSync(tplFile, 'utf8').replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] ?? ''));

mkdirSync(path.dirname(o.out), {recursive: true});
// Written to disk and opened as file:// so the template can load brand fonts, logos and the photo
// from file:// URLs (an about:blank page from setContent cannot).
const htmlFile = path.resolve(`${o.out}.html`);
writeFileSync(htmlFile, html);
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: fmt.w, height: fmt.h}, deviceScaleFactor: 1});
await page.goto(pathToFileURL(htmlFile).href, {waitUntil: 'load'});
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(150);
await page.screenshot({path: o.out, omitBackground: !!o.transparent, type: 'png', clip: {x: 0, y: 0, width: fmt.w, height: fmt.h}});
await browser.close();
unlinkSync(htmlFile);
writeFileSync(`${o.out}.json`, JSON.stringify({template: o.template, format: o.format, image: o.image || null, transparent: !!o.transparent, vars: o.vars, created: new Date().toISOString()}, null, 2));
console.log(`${o.out} (${fmt.w}×${fmt.h}${o.transparent ? ', transparent' : ''})`);
