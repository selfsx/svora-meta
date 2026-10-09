#!/usr/bin/env node
/**
 * @fileoverview Lints copy/<concept>/<lang>.yaml against the schema in
 * copy/README.md: sections, id format, Meta character limits, emoji count,
 * price mentions that disagree with settings/brand.yaml. Read-only.
 *
 *   node scripts/copy-lint.mjs [copy/crazy/ua.yaml …]   (default: every file)
 */

import {readdirSync, readFileSync, existsSync} from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import {rel} from './lib/env.mjs';
import {brand, concepts} from './lib/config.mjs';

const LIMITS = {headlines: 40, primaries: 125, descriptions: 30, overlays: 40, ctas: 24};
const REQUIRED = ['headlines', 'primaries', 'descriptions', 'overlays', 'ctas'];
// list prices, plus the "with code" prices of confirmed offers (settings/brand.yaml → offers[].prices_with_code)
const knownPrices = new Set([...brand().services.map((s) => String(s.price)),
  ...(brand().offers || []).filter((o) => o.confirmed).flatMap((o) => Object.values(o.prices_with_code || {}).map(String))]);
const knownConcepts = Object.keys(concepts().concepts);
const emoji = /\p{Extended_Pictographic}/gu;

let files = process.argv.slice(2);
if (!files.length) {
  const dir = rel('copy');
  files = readdirSync(dir, {withFileTypes: true}).filter((d) => d.isDirectory()).flatMap((d) =>
    readdirSync(path.join(dir, d.name)).filter((f) => f.endsWith('.yaml')).map((f) => path.join(dir, d.name, f)));
}
let problems = 0;
const warn = (f, m) => { problems++; console.log(`${path.relative(rel(), f)}: ${m}`); };

for (const f of files) {
  if (!existsSync(f)) { warn(f, 'missing'); continue; }
  let doc;
  try { doc = YAML.parse(readFileSync(f, 'utf8')); } catch (e) { warn(f, `YAML error: ${e.message.split('\n')[0]}`); continue; }
  const concept = path.basename(path.dirname(f));
  const lang = path.basename(f, '.yaml');
  if (doc.concept !== concept) warn(f, `concept "${doc.concept}" ≠ folder ${concept}`);
  if (doc.lang !== lang) warn(f, `lang "${doc.lang}" ≠ file ${lang}`);
  if (!knownConcepts.includes(concept)) warn(f, `unknown concept folder ${concept}`);
  for (const sec of REQUIRED) {
    const m = doc[sec];
    if (!m || typeof m !== 'object' || !Object.keys(m).length) { warn(f, `section ${sec} missing or empty`); continue; }
    for (const [id, text] of Object.entries(m)) {
      if (!/^[hpdoc]\d{2}$/.test(id) || id[0] !== sec[0]) warn(f, `${sec}.${id}: id must be ${sec[0]}NN`);
      if (typeof text !== 'string' || !text.trim()) { warn(f, `${sec}.${id}: empty`); continue; }
      const plain = text.replace(/<\/?b>/g, '');
      const len = [...plain].length; // code points, as Meta counts (an emoji is one character)
      if (len > LIMITS[sec]) warn(f, `${sec}.${id}: ${len} chars > ${LIMITS[sec]}`);
      const e = (plain.replace(/(?:[⭐★]\uFE0F?){2,}/gu, '⭐').match(emoji) || []).length;  // a run of rating stars (⭐⭐⭐⭐⭐ / ★★★★★) is one emoji
      if (sec === 'primaries' && e > 2) warn(f, `${sec}.${id}: ${e} emoji > 2`);
      if (sec !== 'primaries' && e > 1) warn(f, `${sec}.${id}: ${e} emoji > 1`);
      const words = plain.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
      if (sec === 'overlays' && words > 6) warn(f, `${sec}.${id}: ${words} words > 6`);
      for (const p of plain.matchAll(/(\d{2,3})\s?(?:zł|PLN|zl)/gi)) {
        if (!knownPrices.has(p[1])) warn(f, `${sec}.${id}: price ${p[1]} zł is not in settings/brand.yaml`);
      }
      if (/\bit'?s not .+?, it'?s\b/i.test(plain)) warn(f, `${sec}.${id}: "it's not X, it's Y" AI tell`);
    }
  }
}
console.log(problems ? `${problems} problem(s) in ${files.length} file(s)` : `ok — ${files.length} file(s) clean`);
process.exit(problems ? 1 : 0);
