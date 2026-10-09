#!/usr/bin/env node
/**
 * @fileoverview Keeps copy/<concept>/<lang>.yaml the single home of overlay text: every literal hook / cta
 * used in a wave file is appended (once, next free id) so lint checks its facts and later waves can
 * reference it by id. Prints what it added.
 *   node scripts/copy-sync.mjs creatives/waves/2026-10-A.yaml
 */
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import YAML from 'yaml';
import {rel} from './lib/env.mjs';

const wave = YAML.parse(readFileSync(process.argv[2], 'utf8'));
const adds = {};
for (const job of wave.jobs) {
  for (const [lang, t] of Object.entries(job.langs || {})) {
    for (const [sec, keys] of [['overlays', ['hook']], ['ctas', ['cta']]]) {
      for (const k of keys) {
        const v = t[k] ?? (wave.defaults?.[k]?.[lang]);
        if (!v || v.startsWith('@')) continue;
        ((adds[`${job.concept}/${lang}`] ||= {})[sec] ||= new Set()).add(v);
      }
    }
  }
}
let n = 0;
for (const [cl, secs] of Object.entries(adds)) {
  const f = rel('copy', `${cl}.yaml`);
  if (!existsSync(f)) { console.log(`  ! no ${f}`); continue; }
  let s = readFileSync(f, 'utf8'); const d = YAML.parse(s);
  for (const [sec, set] of Object.entries(secs)) {
    const ex = d[sec] || {}; let id = Math.max(0, ...Object.keys(ex).map((k) => Number(k.slice(1))));
    for (const t of set) {
      if (Object.values(ex).includes(t)) continue;
      id++; const line = `  ${sec[0]}${String(id).padStart(2, '0')}: "${t.replace(/"/g, '\\"')}"\n`;
      const m = s.match(new RegExp(`^${sec}:\\n((?:  .*\\n)*)`, 'm'));
      s = m ? s.slice(0, m.index + m[0].length) + line + s.slice(m.index + m[0].length) : s.replace(/\n*$/, `\n${sec}:\n${line}`);
      n++; console.log(`  + ${cl} ${sec} ${t}`);
    }
  }
  writeFileSync(f, s);
}
console.log(`copy-sync: ${n} lines added`);
