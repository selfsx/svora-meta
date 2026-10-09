#!/usr/bin/env node
/**
 * @fileoverview Runs a production wave from a job file (creatives/waves/<wave>.yaml) — the repeatable
 * way to build, localise and regenerate creatives. One job = one master; the runner expands it to
 * language × format, renders, finishes and registers every file with `creatives.mjs add --job`.
 *
 *   node scripts/wave.mjs creatives/waves/2026-10-A.yaml [--only V12,S8] [--langs ua,pl] [--redo] [--dry] [--no-register]
 *
 * Job file:
 *   batch: 2026-10-b03-waveA
 *   defaults: { cta: {ua: "@c01", …}, meta: {…}, offer_pct: {…}, offer_code: {…} }   # per-language fallbacks for any text var
 *   The offer (settings/brand.yaml → offers.meta-20, code SVME20) is structured, not a text line:
 *     offer_pct  "-20%"          → the sale tag (orange, -6°, dominant)
 *     offer_code "КОД SVME20"    → the coupon chip (dashed border; the last word is the code)
 *     price_old / price_new      → the struck old price + big new price. Set explicitly per job/lang (price jobs: V13, S7)
 *                                  or derived: a `sub`/`kicker` ending "190 zł" becomes the label "…" + the pair 190 → 152 zł,
 *                                  the with-code value read from brand.yaml offers.meta-20.prices_with_code (never computed here).
 *   Where it lands: video outro card (service label + price pair, tag, chip, CTA) · video body (tag + chip beside the CTA, only
 *   inside the measured free band — a busy frame keeps the body clean) · static-card (tag + price pair + chip under the hook)
 *   · static-pick (tag + chip with the CTA) · static-hero (offer row with the CTA; offer_stack: stack = narrow column).
 *   A job/lang switches it off with vars.offer: off, or offer_pct: "". body_clean: true keeps the body overlay to CTA + offer
 *   when the clip carries its own baked hook (the owner's reels, wave C) and there is no intro card.
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
import {allCreatives, brand, copyFor} from './lib/config.mjs';

const argv = process.argv.slice(2);
const file = argv[0];
const flag = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
if (!file || !existsSync(file)) { console.log('usage: wave.mjs <wave.yaml> [--only ids] [--langs l,l] [--redo] [--dry] [--no-register]'); process.exit(2); }
const wave = YAML.parse(readFileSync(file, 'utf8'));
const only = flag('--only') ? flag('--only').split(',') : null;
const langFilter = flag('--langs') ? flag('--langs').split(',') : null;
const redo = argv.includes('--redo'), dry = argv.includes('--dry'), noRegister = argv.includes('--no-register');  // --no-register: render only (QA), nothing is added to the manifest
const batch = wave.batch;
if (!existsSync(rel('creatives', batch, 'manifest.json'))) run('node', ['scripts/creatives.mjs', 'batch', batch]);
const work = rel('creatives', '_work', 'wave', path.basename(file, '.yaml'));
mkdirSync(work, {recursive: true});

const pwc = (brand().offers.find((o) => o.id === 'meta-20') || {}).prices_with_code || {};
/** "Hybrid manicure 190 zł" → {label: "Hybrid manicure", old: "190 zł", new: "152 zł"}; null when the text has no list price with a code price. */
function splitPrice(t) {
  const m = String(t || '').match(/^(.*?)[\s·—–-]*(?:(від|od|from|от)\s+)?(\d{2,3})\s*zł$/i);
  if (!m) return null;
  const svc = brand().services.find((x) => x.price === Number(m[3]) && pwc[x.id] !== undefined);
  if (!svc) return null;
  const pre = m[2] ? `${m[2]} ` : '';
  return {label: m[1].trim(), old: `${pre}${m[3]} zł`, new: `${pre}${pwc[svc.id]} zł`};
}
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
      const n = prior.length ? Number((prior[0].name.match(/_n(\d{3})_/) || [])[1]) || null : null;  // a redo is v+1 of the same n (naming law §3), never a new counter
      const text = resolveText(job, lang);
      if (dry) { console.log(`${jobKey} v${v}: ${stripTags(text.hook || '')} · ${stripTags(text.cta || '')}`); continue; }
      try {
        const out = job.type === 'static' ? buildStatic(job, lang, format, text, jobKey) : buildVideo(job, lang, text, jobKey);
        if (!noRegister) register(job, lang, format, text, out, jobKey, v, n);
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
  if (job.vars?.offer === 'off') { out.offer_pct = ''; out.offer_code = ''; }
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
  // the offer: sale tag + coupon chip (+ price pair where the kicker is "<service> <list price> zł"); static-pick gets tag + chip only
  if (job.template === 'static-card' && text.offer_pct && !text.price_old) {
    const sp = splitPrice(text.kicker);
    if (sp) text = {...text, kicker: sp.label, price_old: sp.old, price_new: sp.new};
  }
  run('node', renderArgs(job, lang, format, text, out, false));
  return out;
}

function buildVideo(job, lang, text, jobKey) {
  const ov = path.join(work, `${jobKey}-ov.png`);
  // intro: the hook lives on a 1-second card up front; the body overlay carries only the CTA (+meta) so the product stays clean
  const bodyText = job.intro || job.body_clean ? {...text, hook: '', sub: '', meta: text.offer_pct ? '' : text.meta} : text;  // body_clean: the clip carries its own baked hook (owner's reel)  // with the offer beside the CTA the url line goes (the outro has it)
  // where is the frame empty for the whole clip? (edges + skin, after cuts) → the CTA block goes there
  const fz = JSON.parse(run('node', ['scripts/free-zone.mjs', job.clip, '--block', text.offer_pct ? '0.105' : '0.10', ...(job.cuts ? ['--cuts', String(job.cuts)] : [])]));
  const freeBand = fz.score < (job.free_max ?? 60);  // above this the whole frame is busy (hands everywhere): keep the body clean
  const vjob = {...job, vars: {...(job.vars || {}), cta_top: `${fz.top_pct}%`}};
  run('node', renderArgs(vjob, lang, '9x16', freeBand ? bodyText : {...bodyText, cta: '', meta: '', offer_pct: '', offer_code: ''}, ov, true));
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
  if (job.intro && job.outro !== false && !job.endcard) {
    job.endcard = {template: 'static-card', seconds: job.outro?.seconds || (text.offer_pct ? 2 : 1.5), vars: {align: 'center', logo_pos: 'center', place: 'middle', hook_size: 96, bg: job.intro.vars?.bg || 'black', ...(job.outro?.vars || {})}};
  }
  if (!job.intro && !job.endcard) { run('node', [...args, '--out', out]); return out; }

  // 1. the body: cuts, captions, overlay — its own audio untouched (we mix at the end)
  const body = path.join(work, `${jobKey}-body.mp4`);
  run('node', [...args, '--no-loudnorm', '--out', body]);
  const bodyDur = Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', body], {encoding: 'utf8'}).stdout) || 8;
  const bodyHasAudio = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=codec_name', '-of', 'csv=p=0', body], {encoding: 'utf8'}).stdout.trim().length > 0;
  // 2. the cards
  const parts = [];  // [{file, seconds, isCard}]
  if (job.intro) {
    const card = path.join(work, `${jobKey}-intro.png`);
    const cardJob = {...job, template: job.intro.template || 'static-card', image: job.intro.image || null, vars: {align: 'center', logo_pos: 'center', place: 'middle', hook_size: 120, ...(job.intro.vars || {}), cta: ''}};
    // a price job (explicit price_old/price_new) opens on the price pair with the sale tag and the code, not on a bare hook
    const priceIntro = text.price_old ? {offer_pct: text.offer_pct, offer_code: text.offer_code, price_old: text.price_old, price_new: text.price_new} : {};
    run('node', renderArgs(cardJob, lang, '9x16', {kicker: text.sub || '', hook: text.hook, cta: '', meta: '', ...priceIntro}, card, false));
    parts.push({file: card, seconds: job.intro.seconds || 1.2, isCard: true});
  }
  parts.push({file: body, seconds: bodyDur, isCard: false});
  if (job.endcard) {
    const card = path.join(work, `${jobKey}-card.png`);
    // outro: service label (+ price pair) · sale tag · coupon chip · CTA. A price job labels it with the hook (the product), others with the sub line.
    let o = {kicker: text.sub || '', hook: '', cta: text.cta, meta: text.meta || '', offer_pct: text.offer_pct, offer_code: text.offer_code};
    if (text.price_old) o = {...o, kicker: stripTags(text.hook), price_old: text.price_old, price_new: text.price_new};
    else { const sp = text.offer_pct ? splitPrice(text.sub) : null; if (sp) o = {...o, kicker: sp.label, price_old: sp.old, price_new: sp.new}; }
    run('node', renderArgs({...job, template: job.endcard.template, image: job.endcard.image || null, vars: {...(job.vars || {}), ...(job.endcard.vars || {})}}, lang, '9x16', job.endcard.template === 'static-card' ? o : text, card, false));
    parts.push({file: card, seconds: job.endcard.seconds || 1.5, isCard: true});
  }
  // 3. video assembly (cards → 720×1280 stills), then ONE audio pass over the whole piece:
  //    music bed (when brand/music has one) under everything, clip audio ducked beneath it; without a bed the clip's
  //    own audio starts under the intro card and fades out across the outro, so the cards are never dead silent.
  const total = parts.reduce((t, p) => t + p.seconds, 0);
  const introSec = job.intro ? (job.intro.seconds || 1.2) : 0;
  const inputs = [], vf = [];
  parts.forEach((p, i) => { if (p.isCard) inputs.push('-loop', '1', '-t', String(p.seconds), '-i', p.file); else inputs.push('-i', p.file); vf.push(p.isCard ? `[${i}:v]scale=720:1280,fps=30,format=yuv420p,setsar=1[v${i}]` : `[${i}:v]fps=30,format=yuv420p,setsar=1[v${i}]`); });
  const bodyIdx = parts.findIndex((p) => !p.isCard);
  const music = job.music && existsSync(job.music) ? job.music : null;
  const musicIdx = music ? parts.length : -1;
  if (music) inputs.push('-stream_loop', '-1', '-i', music);
  const fc = [...vf, `${parts.map((_, i) => `[v${i}]`).join('')}concat=n=${parts.length}:v=1:a=0[v]`];
  const fadeOut = Math.min(1.5, total / 4);
  let aout = null;
  if (music && bodyHasAudio) {
    fc.push(`[${musicIdx}:a]atrim=0:${total},asetpts=PTS-STARTPTS,volume=${job.music_gain ?? 0.8},afade=t=in:d=0.3,afade=t=out:st=${total - fadeOut}:d=${fadeOut}[bed]`);
    fc.push(`[${bodyIdx}:a]adelay=${Math.round(introSec * 1000)}|${Math.round(introSec * 1000)},apad=whole_dur=${total},volume=0.35[clip]`);
    fc.push(`[bed][clip]amix=inputs=2:duration=first:dropout_transition=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]`);
    aout = '[a]';
  } else if (music) {
    fc.push(`[${musicIdx}:a]atrim=0:${total},asetpts=PTS-STARTPTS,volume=${job.music_gain ?? 0.8},afade=t=in:d=0.3,afade=t=out:st=${total - fadeOut}:d=${fadeOut},loudnorm=I=-14:TP=-1.5:LRA=11[a]`);
    aout = '[a]';
  } else if (bodyHasAudio) {
    // start the clip's sound with the intro card (ambient sound, not lip-synced), pad under the outro, fade both ends
    // the clip's sound is shorter than intro+body+outro: stretch it to the whole piece (atempo keeps the pitch; ≥ 0.5×)
    const tempo = Math.max(0.5, bodyDur / total);
    fc.push(`[${bodyIdx}:a]atempo=${tempo.toFixed(4)},apad=whole_dur=${total},atrim=0:${total},afade=t=in:d=0.3,afade=t=out:st=${total - fadeOut}:d=${fadeOut},loudnorm=I=-14:TP=-1.5:LRA=11[a]`);
    aout = '[a]';
  }
  const fa = ['-y', '-v', 'error', ...inputs, '-filter_complex', fc.join(';'), '-map', '[v]'];
  if (aout) fa.push('-map', aout, '-c:a', 'aac', '-b:a', '128k', '-ar', '48000'); else fa.push('-an');
  fa.push('-t', String(total), '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-movflags', '+faststart', out);
  run('ffmpeg', fa);
  writeFileSync(`${out}.json`, JSON.stringify({step: 'finish', input: job.clip, overlay: ov, cuts: job.cuts || null, cta_top_pct: freeBand ? fz.top_pct : null, free_zone_score: fz.score,
    intro: job.intro ? {seconds: introSec} : null, outro: job.endcard ? {seconds: job.endcard.seconds || 1.5} : null, music: music, audio: aout ? (music ? 'bed' + (bodyHasAudio ? '+clip' : '') : 'clip stretched over the cards, faded') : 'none', created: new Date().toISOString()}, null, 2));
  return out;
}

function register(job, lang, format, text, out, jobKey, v, n) {
  const a = ['scripts/creatives.mjs', 'add', batch, '--file', out, '--concept', job.concept, '--hook', job.hook, '--angle', job.angle, '--source', job.source, '--lang', lang, '--format', format, '--v', String(v), '--job', jobKey, '--hook-text', stripTags(text.hook || text.kicker || '')];
  if (n) a.push('--n', String(n));
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
