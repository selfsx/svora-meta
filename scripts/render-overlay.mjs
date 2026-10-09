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
 * {{w}}, {{h}}, every brand color as {{color_orange}} etc., and the layout vars below (place, tone,
 * sizes). The shared type sheet creatives/templates/_type.css is substituted the same way.
 * Safe zones: 9:16 keeps text out of the top 14% and bottom 35% (Meta Reels/Stories UI).
 * Pick `place` and `tone` from `describe-image.mjs` (what is where in the photo), never by default.
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
const v916 = o.format === '9x16';
const vars = {
  ...Object.fromEntries(Object.entries(b.colors).map(([k, v]) => [`color_${k}`, v])),
  fontsDir: pathToFileURL(rel('brand', 'fonts')).href,
  logosDir: pathToFileURL(rel('brand', 'logos')).href,
  image: o.image ? pathToFileURL(path.resolve(o.image)).href : '',
  w: fmt.w, h: fmt.h, format: o.format, lang: 'pl', hook: '', sub: '', cta: '', meta: '', price: '', badge: '', kicker: '', lines: '',
  // Layout defaults per format (templates share creatives/templates/_type.css). 9:16 keeps everything
  // inside the Meta safe zone: logo at 15%, group `top` starts under it, group `bottom` ends above 35%.
  place: 'top', tone: 'dark',
  hook_size: v916 ? 112 : 92, sub_size: v916 ? 46 : 40, cta_size: v916 ? 58 : 50, meta_size: v916 ? 36 : 32,
  logo_top: v916 ? '15%' : '48px', group_top: v916 ? 'calc(15% + 120px)' : '160px', group_bottom: v916 ? '37%' : '72px',
  // static-blur-pad: foreground width / vertical position (MAAG tuning for 9:16; smaller + higher for 4:5 so the copy fits under)
  fg_w: v916 ? '92%' : '70%', fg_top: v916 ? '15%' : '56px', fg_shift: '-50%, 0',  // top of the safe zone; copy goes under/over per `place`
  photo_pos: 'center',
  // static-pick: the three-tile row (between the hook group and the CTA group)
  pick_top: v916 ? '38%' : '30%', pick_h: v916 ? '16%' : '46%',
  // static-card: text-led cards. bg=cream (default) or black; the group sits `bottom` under an optional photo tile
  bg: 'cream', tile_h: v916 ? '21%' : '30%', line_size: v916 ? 44 : 38,
  ...o.vars,
};
for (const k of ['image2', 'image3']) if (vars[k] && !vars[k].startsWith('file:')) vars[k] = pathToFileURL(path.resolve(vars[k])).href;
if (vars.price && !vars.meta) vars.meta = vars.price;  // older callers passed --var price=
vars.badge_display = vars.badge ? 'inline-block' : 'none';
vars.sub_display = vars.sub ? 'inline-block' : 'none';
vars.hook_display = vars.hook ? 'block' : 'none';
vars.cta_display = vars.cta ? 'inline-flex' : 'none';
vars.logo_display = vars.logo === 'none' ? 'none' : 'block';
vars.card_bg = vars.bg === 'black' ? b.colors.black : b.colors.cream;
vars.card_fg = vars.bg === 'black' ? b.colors.cream : b.colors.black;
vars.card_logo = vars.bg === 'black' ? 'light' : 'black';
vars.card_rule = vars.bg === 'black' ? 'rgba(247,241,235,.25)' : 'rgba(26,26,26,.15)';
vars.tile_display = vars.image ? 'block' : 'none';
vars.kicker_display = vars.kicker ? 'block' : 'none';
vars.lines_display = vars.lines ? 'block' : 'none';
vars.meta_display = vars.meta ? 'inline-block' : 'none';
mkdirSync(path.dirname(o.out), {recursive: true});
// The shared stylesheet is itself a template: substitute, write beside the page, link it.
const cssSrc = readFileSync(rel('creatives', 'templates', '_type.css'), 'utf8').replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] ?? ''));
const cssFile = path.resolve(`${o.out}.css`);
writeFileSync(cssFile, cssSrc);
vars.typeCss = pathToFileURL(cssFile).href;
const html = readFileSync(tplFile, 'utf8').replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] ?? ''));

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
unlinkSync(cssFile);
writeFileSync(`${o.out}.json`, JSON.stringify({template: o.template, format: o.format, image: o.image || null, transparent: !!o.transparent, vars: o.vars, created: new Date().toISOString()}, null, 2));
console.log(`${o.out} (${fmt.w}×${fmt.h}${o.transparent ? ', transparent' : ''})`);
