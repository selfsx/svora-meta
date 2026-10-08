#!/usr/bin/env node
/**
 * @fileoverview Image generation / editing through OpenRouter (Nano Banana
 * family). Typical jobs: clean a source photo's background, re-light, extend
 * a 4:5 photo to 9:16, make a "colour trio" composite. Never for logos or
 * text — those are rendered by render-overlay.mjs.
 *
 *   node scripts/gen-image.mjs --prompt "…" --out creatives/_work/x.png [--ref photo.jpg …]
 *        [--model google/gemini-3.1-flash-image] [--aspect 9:16] [--resolution 1K] [--n 1]
 * Writes <out>.json beside the image: model, prompt, refs, cost.
 */

import {mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {generateImage, writeSidecar, MODELS} from './lib/openrouter.mjs';

const argv = process.argv.slice(2);
const flag = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const refs = [];
for (let i = 0; i < argv.length; i++) if (argv[i] === '--ref') refs.push(argv[i + 1]);
const prompt = flag('--prompt');
const out = flag('--out');
if (!prompt || !out) { console.log('usage: gen-image.mjs --prompt "…" --out file.png [--ref img …] [--model id] [--aspect 9:16] [--resolution 1K] [--n 1]'); process.exit(2); }

const model = flag('--model', MODELS.image_fast);
const n = Number(flag('--n', 1));
mkdirSync(path.dirname(out), {recursive: true});
console.error(`→ ${model} · refs ${refs.length} · ${flag('--aspect', 'auto')} ${flag('--resolution', '1K')}`);
const t0 = Date.now();
const {images, cost} = await generateImage({model, prompt, refs, aspect: flag('--aspect'), resolution: flag('--resolution', '1K'), n: n > 1 ? n : undefined});
if (!images.length) { console.error('no image returned'); process.exit(1); }
const files = [];
images.forEach((img, i) => {
  const file = images.length === 1 ? out : out.replace(/(\.\w+)$/, `-${i + 1}$1`);
  writeFileSync(file, img.buffer);
  writeSidecar(file, {step: 'image', model, prompt, refs, aspect: flag('--aspect') || null, resolution: flag('--resolution', '1K'), cost_usd: cost / images.length, media_type: img.mediaType});
  files.push(file);
});
console.log(`${files.join(', ')} · $${cost.toFixed(4)} · ${((Date.now() - t0) / 1000).toFixed(0)}s`);
