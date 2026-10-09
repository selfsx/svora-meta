#!/usr/bin/env node
/**
 * @fileoverview Runs a production wave from a job file (creatives/waves/<wave>.yaml) — the repeatable
 * way to build, localise and regenerate creatives. One job = one master; the runner expands it to
 * language × format, renders, finishes and registers every file with `creatives.mjs add --job`.
 *
 *   node scripts/wave.mjs creatives/waves/2026-10-A.yaml [--only V12,S8] [--langs ua,pl] [--redo] [--dry]
 *
 * Job file:
 *   batch: 2026-10-b03-waveA
 *   defaults: { cta: {ua: "@c01", …}, meta: {…} }          # per-language fallbacks for any text var
 *   jobs:
 *     - id: V1   type: video   angle: hero   concept: crazy   hook: reveal   source: DbT_EsKDTDo
 *       clip: creatives/_work/w1/DbT_EsKDTDo-clip.mp4   [cuts: "0:13.5,40.5:50.3"] [mute: true] [overlay_from: 0.3]
 *       [subs: {transcript: x.json, y: 0.6}]  [endcard: {template: static-hero, image: x.jpg, seconds: 1.5}]
 *       vars: { place: top, tone: dark }                   # any render-overlay var; vars_4x5 / vars_9x16 override per format
 *       langs: { ua: {hook: "@o01", sub: "…"}, pl: {…} }     # "@o01"/"@c01" = copy/<concept>/<lang>.yaml ids
 *     - id: S8   type: static  template: static-card  formats: [4x5, 9x16]  image: … vars: {…} langs: {…}
 * Existing (job, lang, format) entries are skipped unless --redo (then v+1). Everything lands as `draft`.
 */

import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import YAML from 'yaml';
import {rel} from './lib/env.mjs';
import {allCreatives, copyFor} from './lib/config.mjs';

const argv = process.argv.slice(2);
const file = argv[0];
const flag = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
if (!file || !existsSync(file)) { console.log('usage: wave.mjs <wave.yaml> [--only ids] [--langs l,l] [--redo] [--dry]'); process.exit(2); }
const wave = YAML.parse(readFileSync(file, 'utf8'));
const only = flag('--only') ? flag('--only').split(',') : null;
const langFilter = flag('--langs') ? flag('--langs').split(',') : null;
const redo = argv.includes('--redo'), dry = argv.includes('--dry');
const batch = wave.batch;
if (!existsSync(rel('creatives', batch, 'manifest.json'))) run('node', ['scripts/creatives.mjs', 'batch', batch]);
const work = rel('creatives', '_work', 'wave', path.basename(file, '.yaml'));
mkdirSync(work, {recursive: true});

const stripTags = (s) => String(s).replace(/<[^>]+>/g, '');
const existing = () => allCreatives().filter((c) => c.batch === batch);
let made = 0, skipped = 0, failed = 0;

for (const job of wave.jobs) {
  if (only && !only.includes(job.id)) continue;
  const langs = Object.keys(job.langs || {}).filter((l) => !langFilter || langFilter.includes(l));
  const formats = job.type === 'static' ? (job.formats || ['4x5']) : ['9x16'];
  for (const lang of langs) {
    for (const format of formats) {
      const jobKey = `${job.id}-${lang}-${format}`;
      const prior = existing().filter((c) => c.job === jobKey);
      if (prior.length && !redo) { skipped++; continue; }
      const v = prior.length ? Math.max(...prior.map((c) => c.v)) + 1 : 1;
      const text = resolveText(job, lang);
      if (dry) { console.log(`${jobKey} v${v}: ${stripTags(text.hook || '')} · ${stripTags(text.cta || '')}`); continue; }
      try {
        const out = job.type === 'static' ? buildStatic(job, lang, format, text, jobKey) : buildVideo(job, lang, text, jobKey);
        register(job, lang, format, text, out, jobKey, v);
        made++;
        console.log(`✓ ${jobKey} v${v}`);
      } catch (e) {
        failed++;
        console.error(`✗ ${jobKey}: ${e.message.split('\n')[0]}`);
      }
    }
  }
}
console.log(`wave ${path.basename(file)}: ${made} made · ${skipped} skipped (exist) · ${failed} failed`);

/** Resolves hook/sub/cta/meta for a language: job.langs[lang] → wave.defaults → copy ids ("@o03"). */
function resolveText(job, lang) {
  const cp = copyFor(job.concept, lang) || {};
  const src = {...pick(wave.defaults || {}, lang), ...(job.langs[lang] || {})};
  const out = {};
  for (const [k, v] of Object.entries(src)) {
    if (typeof v !== 'string') continue;
    if (v.startsWith('@')) {
      const id = v.slice(1);
      const hit = (cp.overlays || {})[id] || (cp.ctas || {})[id];
      if (!hit) throw new Error(`${job.id}/${lang}: copy id ${id} not in copy/${job.concept}/${lang}.yaml`);
      out[k] = hit;
    } else out[k] = v;
  }
  return out;
}
function pick(defaults, lang) { const o = {}; for (const [k, v] of Object.entries(defaults)) if (v && typeof v === 'object' && v[lang] !== undefined) o[k] = v[lang]; return o; }

function renderArgs(job, lang, format, text, outPng, transparent) {
  const a = ['scripts/render-overlay.mjs', '--template', job.template || 'overlay-hook-cta', '--format', format, '--out', outPng, '--var', `lang=${lang}`];
  if (transparent) a.push('--transparent');
  if (job.image) a.push('--image', job.image);
  for (const [k, v] of Object.entries({...(job.vars || {}), ...(job[`vars_${format}`] || {}), ...text})) a.push('--var', `${k}=${v}`);
  return a;
}

function buildStatic(job, lang, format, text, jobKey) {
  const out = path.join(work, `${jobKey}.png`);
  if (job.template === 'static-card' && !text.kicker && text.sub) text = {...text, kicker: text.sub, sub: ''};  // photo cards: the sub line becomes the kicker
  run('node', renderArgs(job, lang, format, text, out, false));
  return out;
}

function buildVideo(job, lang, text, jobKey) {
  const ov = path.join(work, `${jobKey}-ov.png`);
  // intro: the hook lives on a 1-second card up front; the body overlay carries only the CTA (+meta) so the product stays clean
  const bodyText = job.intro ? {...text, hook: '', sub: ''} : text;
  // where is the frame empty for the whole clip? (edges + skin, after cuts) → the CTA block goes there
  const fz = JSON.parse(run('node', ['scripts/free-zone.mjs', job.clip, '--block', '0.10', ...(job.cuts ? ['--cuts', String(job.cuts)] : [])]));
  const freeBand = fz.score < (job.free_max ?? 60);  // above this the whole frame is busy (hands everywhere): keep the body clean
  const vjob = {...job, vars: {...(job.vars || {}), cta_top: `${fz.top_pct}%`}};
  run('node', renderArgs(vjob, lang, '9x16', freeBand ? bodyText : {...bodyText, cta: '', meta: ''}, ov, true));
  const args = ['scripts/video-finish.mjs', '--in', job.clip, '--overlay', ov, '--overlay-from', String(job.overlay_from ?? 0.3)];
  if (job.cuts) args.push('--cuts', String(job.cuts));
  if (job.mute) args.push('--mute');
  if (job.music && existsSync(job.music)) args.push('--music', job.music);
  if (job.subs) {
    const ass = path.join(work, `${jobKey}.ass`);
    const sa = ['scripts/subs.mjs', '--transcript', job.subs.transcript, '--cuts', String(job.cuts), '--out', ass, '--y', String(job.subs.y ?? 0.6)];
    if (lang !== job.subs.lang) sa.push('--translate', lang);
    run('node', sa);
    args.push('--subs', ass);
  }
  let out = path.join(work, `${jobKey}.mp4`);
  if (job.intro) {
    const body = path.join(work, `${jobKey}-body.mp4`);
    run('node', [...args, '--out', body]);
    const card = path.join(work, `${jobKey}-intro.png`);
    const cardJob = {...job, template: job.intro.template || 'static-card', image: job.intro.image || null, vars: {align: 'center', logo_pos: 'center', place: 'middle', hook_size: 120, ...(job.intro.vars || {}), cta: ''}};
    run('node', renderArgs(cardJob, lang, '9x16', {kicker: text.sub || '', hook: text.hook, cta: '', meta: ''}, card, false));
    const sec = job.intro.seconds || 1.2;
    const withIntro = path.join(work, `${jobKey}-intro.mp4`);
    const a = ['-y', '-v', 'error', '-loop', '1', '-t', String(sec), '-i', card, '-i', body];
    const hasA = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=codec_name', '-of', 'csv=p=0', body], {encoding: 'utf8'}).stdout.trim().length > 0;
    const fc = hasA
      ? `[0:v]scale=720:1280,fps=30,format=yuv420p,setsar=1[c];anullsrc=r=48000:cl=stereo,atrim=0:${sec}[sa];[c][sa][1:v][1:a]concat=n=2:v=1:a=1[v][a]`
      : `[0:v]scale=720:1280,fps=30,format=yuv420p,setsar=1[c];[c][1:v]concat=n=2:v=1:a=0[v]`;
    a.push('-filter_complex', fc, '-map', '[v]');
    if (hasA) a.push('-map', '[a]', '-c:a', 'aac', '-b:a', '128k'); else a.push('-an');
    a.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-movflags', '+faststart', withIntro);
    run('ffmpeg', a);
    args.length = 0; args.push('__done__', withIntro);
  }
  if (job.intro && job.outro !== false && !job.endcard) {
    job.endcard = {template: 'static-card', seconds: job.outro?.seconds || 1.5, vars: {align: 'center', logo_pos: 'center', place: 'middle', hook_size: 96, bg: job.intro.vars?.bg || 'black', ...(job.outro?.vars || {})}};
  }
  if (job.endcard) {
    // finish the clip, render the card for this language, append it as a 1.5 s tail
    const body = args[0] === '__done__' ? args[1] : path.join(work, `${jobKey}-body.mp4`);
    if (args[0] !== '__done__') run('node', [...args, '--out', body]);
    const card = path.join(work, `${jobKey}-card.png`);
    run('node', renderArgs({...job, template: job.endcard.template, image: job.endcard.image || null, vars: {...(job.vars || {}), ...(job.endcard.vars || {})}}, lang, '9x16', job.endcard.template === 'static-card' ? {kicker: text.sub || '', hook: text.hook, cta: text.cta, meta: text.meta || ''} : text, card, false));
    const sec = job.endcard.seconds || 1.5;
    const hasA2 = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=codec_name', '-of', 'csv=p=0', body], {encoding: 'utf8'}).stdout.trim().length > 0;
    const fc2 = hasA2
      ? `[1:v]scale=720:1280,fps=30,format=yuv420p,setsar=1[c];anullsrc=r=48000:cl=stereo,atrim=0:${sec}[sa];[0:v][0:a][c][sa]concat=n=2:v=1:a=1[v][a]`
      : `[1:v]scale=720:1280,fps=30,format=yuv420p,setsar=1[c];[0:v][c]concat=n=2:v=1:a=0[v]`;
    const ea = ['-y', '-v', 'error', '-i', body, '-loop', '1', '-t', String(sec), '-i', card, '-filter_complex', fc2, '-map', '[v]'];
    if (hasA2) ea.push('-map', '[a]', '-c:a', 'aac', '-b:a', '128k'); else ea.push('-an');
    ea.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-movflags', '+faststart', out);
    run('ffmpeg', ea);
    writeFileSync(`${out}.json`, JSON.stringify({step: 'finish', input: job.clip, overlay: ov, cuts: job.cuts || null, cta_top_pct: freeBand ? fz.top_pct : null, free_zone_score: fz.score, intro: job.intro ? {seconds: job.intro.seconds || 1.2} : null, endcard: {template: job.endcard.template, seconds: sec}, created: new Date().toISOString()}, null, 2));
  } else if (args[0] === '__done__') {
    out = args[1];
    writeFileSync(`${out}.json`, JSON.stringify({step: 'finish', input: job.clip, overlay: ov, cuts: job.cuts || null, cta_top_pct: freeBand ? fz.top_pct : null, free_zone_score: fz.score, intro: {template: job.intro.template || 'static-card', seconds: job.intro.seconds || 1.2}, created: new Date().toISOString()}, null, 2));
  } else {
    run('node', [...args, '--out', out]);
  }
  return out;
}

function register(job, lang, format, text, out, jobKey, v) {
  const a = ['scripts/creatives.mjs', 'add', batch, '--file', out, '--concept', job.concept, '--hook', job.hook, '--angle', job.angle, '--source', job.source, '--lang', lang, '--format', format, '--v', String(v), '--job', jobKey, '--hook-text', stripTags(text.hook || text.kicker || '')];
  if (job.look && existsSync(job.look)) a.push('--look', job.look);
  if (existsSync(`${out}.json`)) a.push('--pipeline', `${out}.json`);
  for (const p of job.pipeline || []) if (existsSync(p)) a.push('--pipeline', p);
  // a paid generation is counted once: by the first creative made from it (in this run or an earlier batch)
  if (job.pipeline && job.pipeline.length && (job.cost_counted || allCreatives().some((c) => c.source === job.source && c.cost_usd > 0))) a.push('--cost-shared');
  job.cost_counted = true;
  run('node', a);
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, {encoding: 'utf8', cwd: rel()});
  if (r.status !== 0) throw new Error(`${cmd} ${args.slice(0, 3).join(' ')}…\n${(r.stderr || r.stdout).split('\n').slice(-6).join('\n')}`);
  return r.stdout;
}
