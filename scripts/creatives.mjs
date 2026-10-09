#!/usr/bin/env node
/**
 * @fileoverview Creative manifests: list, validate, stats, add, and promote
 * finished files from creatives/_work into a batch. The manifest is the
 * portfolio's source of truth (`.claude/other/creatives.md` has the schema).
 *
 *   node scripts/creatives.mjs list [--lang ua] [--concept crazy] [--type vd] [--status approved]
 *   node scripts/creatives.mjs validate                       names, files, formats, probe dimensions
 *   node scripts/creatives.mjs stats
 *   node scripts/creatives.mjs batch <batch-name>             creates creatives/<batch>/manifest.json
 *   node scripts/creatives.mjs add <batch> --file creatives/_work/x.mp4 --concept crazy --hook reveal --angle hero \
 *        --source DaxwkGBtqcU --lang ua [--format 9x16] [--v 1] [--hook-text "…"] [--copy h01,p03,d01] [--look x.look.json]
 *        [--pipeline x.mp4.json …] [--cost-shared]  → renames/moves the file to creatives/<batch>/<name>.<ext>, status draft
 *        (--cost-shared: a language/hook twin of an already-paid generation — records the pipeline, counts $0)
 *   node scripts/creatives.mjs set <name> status=approved|rejected|live [notes=…]
 */

import {existsSync, mkdirSync, readFileSync, renameSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {rel} from './lib/env.mjs';
import {allCreatives, concepts} from './lib/config.mjs';
import {creativeName, parseCreativeName} from './lib/naming.mjs';
import {table} from './lib/table.mjs';

const argv = process.argv.slice(2);
const cmd = argv[0];
const flag = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const C = concepts();

const manifestPath = (batch) => rel('creatives', batch, 'manifest.json');
const loadManifest = (batch) => JSON.parse(readFileSync(manifestPath(batch), 'utf8'));
const saveManifest = (batch, m) => writeFileSync(manifestPath(batch), JSON.stringify({...m, updated: new Date().toISOString()}, null, 2));

({list, validate, stats, batch, add, set}[cmd] || usage)();

function list() {
  let rows = allCreatives();
  for (const k of ['lang', 'concept', 'type', 'status', 'format', 'batch']) if (flag(`--${k}`)) rows = rows.filter((c) => c[k] === flag(`--${k}`));
  console.log(table(['name', 'type', 'format', 'lang', 'status', 'batch', 'cost $'], rows.map((c) => [c.name, c.type, c.format, c.lang, c.status, c.batch, c.cost_usd ?? 0])));
  console.log(`${rows.length} creatives`);
}

function validate() {
  let bad = 0;
  for (const c of allCreatives()) {
    const p = parseCreativeName(c.name);
    const why = [];
    if (!p) why.push('name breaks the naming law');
    if (!existsSync(c.path)) why.push('file missing');
    if (p && (p.type !== c.type || p.format !== c.format || p.lang !== c.lang || p.concept !== c.concept)) why.push('fields disagree with the name');
    if (p && !C.concepts[p.concept]) why.push(`unknown concept ${p.concept}`);
    if (p && !C.hooks[p.hook]) why.push(`unknown hook ${p.hook}`);
    if (!c.angle) why.push('no angle (settings/concepts.yaml → angles)');
    else if (!C.angles[c.angle]) why.push(`unknown angle ${c.angle}`);
    if (existsSync(c.path)) {
      const want = C.formats[c.format] && (c.type === 'vd' ? (C.formats[c.format].video || C.formats[c.format]) : C.formats[c.format]);
      const pr = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,duration', '-of', 'csv=p=0', c.path], {encoding: 'utf8'}).stdout.trim().split(',');
      const [w, h, dur] = pr.map(Number);
      if (want && (w !== want.w || h !== want.h)) why.push(`is ${w}×${h}, ${c.format} needs ${want.w}×${want.h}`);
      if (c.type === 'vd' && dur && (dur < 4 || dur > 60)) why.push(`duration ${dur.toFixed(1)}s outside 4–60`);
    }
    if (why.length) { bad++; console.log(`✗ ${c.batch}/${c.name}: ${why.join('; ')}`); }
  }
  console.log(bad ? `${bad} invalid` : 'all creatives valid');
  process.exit(bad ? 1 : 0);
}

function stats() {
  const byAngle = allCreatives().reduce((m, c) => ((m[c.angle || '-'] = (m[c.angle || '-'] || 0) + 1), m), {});
  console.log('angles: ' + Object.entries(byAngle).map(([k, v]) => `${k} ${v}`).join(' · '));
  const rows = allCreatives();
  const by = (k) => Object.entries(rows.reduce((m, c) => ((m[c[k]] = (m[c[k]] || 0) + 1), m), {})).map(([a, n]) => `${a}:${n}`).join('  ');
  console.log(`total ${rows.length} · cost $${rows.reduce((s, c) => s + (c.cost_usd || 0), 0).toFixed(2)}`);
  for (const k of ['status', 'type', 'format', 'lang', 'concept', 'hook', 'batch']) console.log(`${k.padEnd(8)} ${by(k)}`);
}

function batch() {
  const name = argv[1];
  if (!name || !/^[a-z0-9-]+$/.test(name)) { console.log('batch name: lowercase, digits, hyphens, e.g. 2026-10-b01-crazy'); process.exit(2); }
  mkdirSync(rel('creatives', name), {recursive: true});
  if (existsSync(manifestPath(name))) { console.log('exists'); return; }
  saveManifest(name, {batch: name, created: new Date().toISOString(), creatives: []});
  console.log(`creatives/${name}/manifest.json`);
}

function add() {
  const b = argv[1];
  if (!b || !existsSync(manifestPath(b))) { console.log('batch missing — create it first: creatives.mjs batch <name>'); process.exit(2); }
  const file = flag('--file');
  if (!file || !existsSync(file)) { console.log('--file missing'); process.exit(2); }
  const m = loadManifest(b);
  const ext = path.extname(file).slice(1).toLowerCase();
  const type = flag('--type', ['mp4', 'mov', 'webm'].includes(ext) ? 'vd' : 'st');
  const fields = {concept: flag('--concept'), hook: flag('--hook'), source: flag('--source'), type, n: Number(flag('--n', m.creatives.length + 1)), v: Number(flag('--v', 1)), format: flag('--format', '9x16'), lang: flag('--lang')};
  for (const k of ['concept', 'hook', 'source', 'lang']) if (!fields[k]) { console.log(`--${k} missing`); process.exit(2); }
  if (!C.concepts[fields.concept]) { console.log(`unknown concept ${fields.concept} (settings/concepts.yaml)`); process.exit(2); }
  if (!C.hooks[fields.hook]) { console.log(`unknown hook ${fields.hook} (settings/concepts.yaml)`); process.exit(2); }
  const angle = flag('--angle');
  if (!angle || !C.angles[angle]) { console.log(`--angle missing or unknown (settings/concepts.yaml → angles: ${Object.keys(C.angles).join(' ')})`); process.exit(2); }
  const look = flag('--look') && existsSync(flag('--look')) ? JSON.parse(readFileSync(flag('--look'), 'utf8')) : null;
  const name = creativeName(fields);
  if (m.creatives.some((c) => c.name === name)) { console.log(`exists: ${name}`); process.exit(2); }
  const target = rel('creatives', b, `${name}.${ext}`);
  const pipeline = [];
  for (let i = 0; i < argv.length; i++) if (argv[i] === '--pipeline' && existsSync(argv[i + 1])) pipeline.push(JSON.parse(readFileSync(argv[i + 1], 'utf8')));
  const sidecar = `${file}.json`;
  if (existsSync(sidecar) && !pipeline.length) pipeline.push(JSON.parse(readFileSync(sidecar, 'utf8')));
  renameSync(file, target);
  const copy = flag('--copy') ? Object.fromEntries(flag('--copy').split(',').map((id) => [id[0] === 'h' ? 'headline' : id[0] === 'p' ? 'primary' : 'description', id])) : null;
  const entry = {name, file: `${name}.${ext}`, type, format: fields.format, lang: fields.lang, concept: fields.concept, hook: fields.hook, hook_text: flag('--hook-text', ''), angle, job: flag('--job', null), source: fields.source, v: fields.v,
    look: look ? {place: look.place, tone: look.tone, avoid: look.avoid, baked_text: look.baked_text, risks: look.risks} : null,
    status: 'draft', copy, pipeline, cost_usd: argv.includes('--cost-shared') ? 0 : pipeline.reduce((s, p) => s + (Number(p.cost_usd) || 0), 0), cost_shared: argv.includes('--cost-shared') || undefined, created: new Date().toISOString(), notes: ''};
  m.creatives.push(entry);
  saveManifest(b, m);
  console.log(`${b}/${entry.file} (status draft)`);
}

function set() {
  const name = argv[1];
  const c = allCreatives().find((x) => x.name === name);
  if (!c) { console.log(`not found: ${name}`); process.exit(2); }
  const m = loadManifest(c.batch);
  const e = m.creatives.find((x) => x.name === name);
  for (const kv of argv.slice(2)) { const [k, ...v] = kv.split('='); e[k] = v.join('='); }
  if (e.status && !['draft', 'approved', 'rejected', 'live', 'retired'].includes(e.status)) { console.log('status must be draft|approved|rejected|live|retired'); process.exit(2); }
  saveManifest(c.batch, m);
  console.log(`${name}: ${argv.slice(2).join(' ')}`);
}

function usage() {
  console.log('usage: creatives.mjs list|validate|stats|batch <name>|add <batch> …|set <name> k=v');
  process.exit(2);
}
