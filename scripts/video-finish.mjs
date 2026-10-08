#!/usr/bin/env node
/**
 * @fileoverview Finishes a clip for Meta: scale/crop to the target format
 * (1080×1920 / 1080×1350 / 1080×1080), composite a transparent overlay PNG
 * (from render-overlay.mjs), optional trim, optional music, H.264 + AAC,
 * faststart. Also `--still` to grab a poster frame.
 *
 *   node scripts/video-finish.mjs --in clip.mp4 --out creatives/<batch>/<name>.mp4 [--format 9x16]
 *        [--overlay overlay.png] [--overlay-from 0.6] [--trim 0:8] [--music brand/audio/x.mp3] [--mute] [--loop-to 8]
 *   node scripts/video-finish.mjs --still --in clip.mp4 --out poster.jpg [--at 1.5]
 * Meta limits honoured: ≤ 4 GB, H.264, yuv420p, 30 fps, AAC 128 kbps, ≤ 60 s for Reels recommended.
 */

import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {concepts} from './lib/config.mjs';

const argv = process.argv.slice(2);
const flag = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const input = flag('--in'), out = flag('--out');
if (!input || !out) { console.log('usage: video-finish.mjs --in clip.mp4 --out final.mp4 [--format 9x16] [--overlay png] [--overlay-from s] [--trim a:b] [--music mp3] [--mute] [--loop-to s] | --still --in clip.mp4 --out poster.jpg [--at s]'); process.exit(2); }
if (!existsSync(input)) { console.error(`missing ${input}`); process.exit(2); }
mkdirSync(path.dirname(out), {recursive: true});

if (argv.includes('--still')) {
  run(['-y', '-ss', flag('--at', '1.0'), '-i', input, '-frames:v', '1', '-q:v', '2', out]);
  console.log(out);
  process.exit(0);
}

const fmt = concepts().formats[flag('--format', '9x16')];
const overlay = flag('--overlay');
const overlayFrom = Number(flag('--overlay-from', 0));
const trim = flag('--trim');
const music = flag('--music');
const mute = argv.includes('--mute');
const loopTo = flag('--loop-to');

const probe = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=codec_name', '-of', 'csv=p=0', input], {encoding: 'utf8'});
const hasAudio = probe.stdout.trim().length > 0;

const args = ['-y'];
if (loopTo) args.push('-stream_loop', '-1');
if (trim) args.push('-ss', trim.split(':')[0]);
args.push('-i', input);
if (overlay) args.push('-i', overlay);
if (music) args.push('-i', music);
const filters = [`[0:v]scale=${fmt.w}:${fmt.h}:force_original_aspect_ratio=increase,crop=${fmt.w}:${fmt.h},fps=30,setsar=1[v0]`];
let v = '[v0]';
if (overlay) {
  filters.push(`[1:v]format=rgba[ov]`);
  filters.push(`${v}[ov]overlay=0:0:enable='gte(t,${overlayFrom})'[v1]`);
  v = '[v1]';
}
filters.push(`${v}format=yuv420p[vout]`);
args.push('-filter_complex', filters.join(';'), '-map', '[vout]');
const musicIdx = overlay ? 2 : 1;
if (music) args.push('-map', `${musicIdx}:a`, '-shortest');
else if (hasAudio && !mute) args.push('-map', '0:a?');
if (trim) args.push('-t', String(Number(trim.split(':')[1]) - Number(trim.split(':')[0])));
if (loopTo) args.push('-t', loopTo);
args.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-profile:v', 'high', '-level', '4.1', '-movflags', '+faststart');
if (music || (hasAudio && !mute)) args.push('-c:a', 'aac', '-b:a', '128k', '-ar', '48000');
else args.push('-an');
args.push(out);
run(args);
writeFileSync(`${out}.json`, JSON.stringify({step: 'finish', input, overlay: overlay || null, overlay_from: overlayFrom, trim: trim || null, music: music || null, mute, loop_to: loopTo || null, format: flag('--format', '9x16'), size: `${fmt.w}x${fmt.h}`, created: new Date().toISOString()}, null, 2));
const info = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,size', '-of', 'csv=p=0', out], {encoding: 'utf8'}).stdout.trim();
console.log(`${out} · ${fmt.w}×${fmt.h} · duration,size ${info}`);

function run(a) {
  const r = spawnSync('ffmpeg', a, {encoding: 'utf8'});
  if (r.status !== 0) { console.error(r.stderr.split('\n').slice(-15).join('\n')); process.exit(1); }
}
