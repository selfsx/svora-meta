#!/usr/bin/env node
/**
 * @fileoverview Timed transcript of a reel's speech (UA/RU/PL/EN) through OpenRouter audio input
 * (Gemini), for picking a 10–20 s segment and for subtitles. Writes <video>.transcript.json:
 * {language, segments: [{start, end, text}], summary, hooks: [...]}. ≈ $0.01–0.03 per minute.
 *
 *   node scripts/transcribe.mjs sources/instagram/raw/<code>/<code>_01.mp4 [--model google/gemini-2.5-flash] [--out x.json]
 */

import {existsSync, mkdtempSync, readFileSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import {chat} from './lib/openrouter.mjs';

const argv = process.argv.slice(2);
const flag = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const input = argv.find((a, i) => !a.startsWith('--') && !['--model', '--out'].includes(argv[i - 1]));
if (!input || !existsSync(input)) { console.log('usage: transcribe.mjs <video|audio> [--model id] [--out file.json]'); process.exit(2); }

const tmp = mkdtempSync(path.join(os.tmpdir(), 'tr-'));
const mp3 = path.join(tmp, 'a.mp3');
spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', input, '-vn', '-ac', '1', '-ar', '16000', '-b:a', '48k', mp3]);
const dur = Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', input], {encoding: 'utf8'}).stdout) || 0;

const PROMPT = `Transcribe this ${dur.toFixed(0)}-second audio of a nail-studio owner talking (Ukrainian, Russian, Polish or English — detect it). Answer ONLY with JSON:
{"language":"ua|ru|pl|en","segments":[{"start":0.0,"end":2.4,"text":"…"}],"summary":"one sentence: what she says","hooks":["the 3 most quotable lines, verbatim, with their start seconds"]}
Segments: natural phrases of 1–6 words each, 1–3 s, accurate timestamps in seconds; keep the original language and spelling.`;
const model = flag('--model', 'google/gemini-2.5-flash');
const {text, cost} = await chat([{role: 'user', content: [{type: 'input_audio', input_audio: {data: readFileSync(mp3).toString('base64'), format: 'mp3'}}, {type: 'text', text: PROMPT}]}], {model, temperature: 0.1});
let t;
try { t = JSON.parse(text.replace(/^```(json)?/m, '').replace(/```$/m, '').trim()); } catch (e) { console.error(text); throw new Error('model did not return JSON'); }
t = {...t, input, duration: dur, model, cost_usd: cost, created: new Date().toISOString()};
const out = flag('--out', `${input}.transcript.json`);
writeFileSync(out, JSON.stringify(t, null, 2));
console.log(`${out} · ${t.language} · ${t.segments.length} segments · $${cost.toFixed(4)}`);
console.log(t.summary);
for (const h of t.hooks || []) console.log('  » ' + h);
