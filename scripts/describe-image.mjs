#!/usr/bin/env node
/**
 * @fileoverview Looks at a source photo (or a video frame) before any overlay is placed: what is in
 * the picture, where the nails are, which thirds are free for text, whether text is already baked
 * in, and a safe `place`/`tone` for render-overlay.mjs. Vision via OpenRouter chat (≈ $0.01/image).
 *
 *   node scripts/describe-image.mjs <image-or-video> [--at 3] [--out file.look.json] [--model id]
 *   node scripts/describe-image.mjs sources/instagram/raw/<code>/<code>_01.jpg --json   (print only)
 * Writes <file>.look.json beside the input by default; the creative-producer reads `place`, `tone`
 * and `avoid` from it. Never trust it blindly — look at the render before registering.
 */

import {existsSync, mkdtempSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import {chat, dataUrl, MODELS} from './lib/openrouter.mjs';

const argv = process.argv.slice(2);
const flag = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const input = argv.find((a) => !a.startsWith('--') && argv[argv.indexOf(a) - 1] !== '--at' && argv[argv.indexOf(a) - 1] !== '--out' && argv[argv.indexOf(a) - 1] !== '--model');
if (!input || !existsSync(input)) { console.log('usage: describe-image.mjs <image|video> [--at s] [--out x.look.json] [--json]'); process.exit(2); }

let image = input;
if (/\.(mp4|mov|webm)$/i.test(input)) {
  image = path.join(mkdtempSync(path.join(os.tmpdir(), 'look-')), 'frame.jpg');
  spawnSync('ffmpeg', ['-y', '-v', 'error', '-ss', flag('--at', '3'), '-i', input, '-frames:v', '1', '-q:v', '3', image]);
}
// Downscale for the model (cost + speed); UltraHDR JPEGs are fine for ffmpeg.
const small = path.join(mkdtempSync(path.join(os.tmpdir(), 'look-')), 'small.jpg');
spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', image, '-vf', 'scale=768:-2', '-q:v', '4', small]);

const PROMPT = `You are preparing an Instagram/Facebook ad overlay for a nail studio. Analyse this photo and answer ONLY with JSON:
{
 "subject": "one sentence: what is shown (hands, nails, face, objects, setting)",
 "nails": {"shape": "", "length": "short|medium|long|extra-long", "colour": "", "design": "", "concept": "classic|art|crazy|pedi|brows|brand"},
 "person_visible": "none|hands only|face|body",
 "background": "short description",
 "tone": "dark|light|mixed  (overall brightness where text would sit)",
 "baked_text": true|false,
 "thirds": {"top": "free|busy", "middle": "free|busy", "bottom": "free|busy"},
 "nails_at": "top|middle|bottom|everywhere",
 "place": "top|middle|bottom  (where a 3-line text block + button can go WITHOUT covering nails; prefer top, then bottom, then middle)",
 "avoid": "what the text must not cover",
 "crop_9x16": "center|top|bottom  (which part to keep when cover-cropping to vertical)",
 "hook_angles": ["3 short ad hook ideas in English that fit THIS picture"],
 "risks": "anything Meta could flag or that looks unprofessional (skin, text, clutter, other brand logos), or none"
}`;

const {text, cost} = await chat([{role: 'user', content: [{type: 'image_url', image_url: {url: dataUrl(small)}}, {type: 'text', text: PROMPT}]}], {model: flag('--model', MODELS.text), temperature: 0.1});
let look;
try { look = JSON.parse(text.replace(/^```(json)?/m, '').replace(/```$/m, '').trim()); } catch (e) { console.error(text); throw new Error('model did not return JSON'); }
look = {...look, input, frame_at: /\.(mp4|mov|webm)$/i.test(input) ? Number(flag('--at', 3)) : null, model: flag('--model', MODELS.text), cost_usd: cost, created: new Date().toISOString()};
const out = flag('--out', `${input}.look.json`);
if (!argv.includes('--json')) writeFileSync(out, JSON.stringify(look, null, 2));
console.log(JSON.stringify(look, null, 2));
if (!argv.includes('--json')) console.error(`→ ${out} · $${cost.toFixed(4)}`);
