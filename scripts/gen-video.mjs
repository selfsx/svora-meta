#!/usr/bin/env node
/**
 * @fileoverview Image-to-video (and text-to-video) through OpenRouter with
 * Seedance 2.5. The source photo is the first frame, so the nail design stays
 * identical; the prompt describes camera and hand motion only.
 *
 *   node scripts/gen-video.mjs --first sources/…jpg --prompt "…" --out creatives/_work/x.mp4
 *        [--last img] [--ref img …] [--duration 8] [--size 720x1280 | --aspect 9:16 --resolution 720p]
 *        [--audio|--no-audio] [--seed 1842] [--model bytedance/seedance-2.5]
 *   node scripts/gen-video.mjs --models      # what the provider accepts right now (sizes, durations, pricing)
 * Writes <out>.json beside the video: model, prompt, inputs, seed, job id, cost.
 * Cost guide (Oct 2026): ≈ $0.10–0.12 per second at 480p, ≈ $0.23/s at 720p → an 8 s 720p clip ≈ $1.8.
 */

import {mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {generateVideo, listVideoModels, writeSidecar, MODELS} from './lib/openrouter.mjs';

const argv = process.argv.slice(2);
const flag = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
if (argv.includes('--models')) {
  const m = await listVideoModels();
  const rows = (m.data || m.models || []).filter((x) => /seedance|veo|kling|wan/i.test(x.id || x.slug || ''));
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}
const refs = [];
for (let i = 0; i < argv.length; i++) if (argv[i] === '--ref') refs.push(argv[i + 1]);
const prompt = flag('--prompt');
const out = flag('--out');
if (!prompt || !out) { console.log('usage: gen-video.mjs --prompt "…" --out file.mp4 [--first img] [--last img] [--ref img …] [--duration 8] [--size 720x1280] [--no-audio] [--seed n] [--model id]'); process.exit(2); }

const model = flag('--model', MODELS.video);
const o = {
  model, prompt, firstFrame: flag('--first'), lastFrame: flag('--last'), refs,
  duration: Number(flag('--duration', 8)), size: flag('--size'), aspect: flag('--aspect'), resolution: flag('--resolution'),
  audio: !argv.includes('--no-audio'), seed: flag('--seed') ? Number(flag('--seed')) : undefined,
  onStatus: (s) => process.stderr.write(`  ${s}\n`),
};
if (!o.size && !o.aspect) { o.aspect = '9:16'; o.resolution = o.resolution || '720p'; }
mkdirSync(path.dirname(out), {recursive: true});
console.error(`→ ${model} · ${o.duration}s · ${o.size || `${o.aspect} ${o.resolution}`} · audio ${o.audio} · first ${o.firstFrame || '-'}`);
const t0 = Date.now();
const {buffer, cost, jobId, raw} = await generateVideo(o);
writeFileSync(out, buffer);
writeSidecar(out, {step: 'animate', model, prompt, first_frame: o.firstFrame || null, last_frame: o.lastFrame || null, refs, duration: o.duration, size: o.size || null, aspect: o.aspect || null, resolution: o.resolution || null, generate_audio: o.audio, seed: o.seed ?? null, job_id: jobId, cost_usd: cost, generation_id: raw.generation_id || null});
console.log(`${out} · $${cost.toFixed(3)} · ${((Date.now() - t0) / 1000).toFixed(0)}s · job ${jobId}`);
