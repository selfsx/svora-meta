#!/usr/bin/env node
/**
 * @fileoverview Finishes a clip for Meta: scale/crop to the target format
 * (video sizes from settings/concepts.yaml: 720×1280 / 720×900 / 720×720 —
 * 720p is the delivery standard here, no upscaling), composite a transparent overlay PNG
 * (from render-overlay.mjs), optional trim, optional music, H.264 + AAC,
 * faststart. Also `--still` to grab a poster frame.
 *
 *   node scripts/video-finish.mjs --in clip.mp4 --out creatives/<batch>/<name>.mp4 [--format 9x16]
 *        [--overlay overlay.png] [--overlay-from 0.6] [--trim 0:8] [--music brand/music/x.mp3] [--music-gain 0.8]
 *        [--mute] [--loop-to 8] [--pad blur] [--no-loudnorm]
 *   node scripts/video-finish.mjs --still --in clip.mp4 --out poster.jpg [--at 1.5]
 * Audio: the output is loudness-normalised to -14 LUFS (Reels level) unless --no-loudnorm. --music lays a
 * bed under the clip's own audio (ducked to 35%) or alone when the clip is silent/--mute; the bed fades
 * out over the last second. --pad blur fits a non-9:16 source whole over a blurred, dimmed copy of itself
 * (MAAG tuning: σ28, dim 18%, foreground 92% wide) instead of cover-cropping.
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

const fmtAll = concepts().formats[flag('--format', '9x16')];
const fmt = fmtAll.video || fmtAll; // videos ship at 720p; statics are rendered at 1080 separately
const overlay = flag('--overlay');
const overlayFrom = Number(flag('--overlay-from', 0));
const trim = flag('--trim');
const music = flag('--music');
const musicGain = Number(flag('--music-gain', 0.8));
const mute = argv.includes('--mute');
const loopTo = flag('--loop-to');
const pad = flag('--pad');
const loudnorm = !argv.includes('--no-loudnorm');
if (music && !existsSync(music)) { console.error(`missing music ${music}`); process.exit(2); }

const probe = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=codec_name', '-of', 'csv=p=0', input], {encoding: 'utf8'});
const hasAudio = probe.stdout.trim().length > 0;

const args = ['-y'];
if (loopTo) args.push('-stream_loop', '-1');
if (trim) args.push('-ss', trim.split(':')[0]);
args.push('-i', input);
if (overlay) args.push('-i', overlay);
if (music) args.push('-i', music);
const filters = [];
if (pad === 'blur') {
  const fgW = Math.round(fmt.w * 0.92 / 2) * 2;
  filters.push(`[0:v]split=2[bgsrc][fgsrc]`);
  filters.push(`[bgsrc]scale=${fmt.w}:${fmt.h}:force_original_aspect_ratio=increase,crop=${fmt.w}:${fmt.h},gblur=sigma=28,colorlevels=rimax=0.82:gimax=0.82:bimax=0.82[bg]`);
  filters.push(`[fgsrc]scale=${fgW}:-2[fg]`);
  filters.push(`[bg][fg]overlay=(W-w)/2:(H-h)/2,fps=30,setsar=1[v0]`);
} else {
  filters.push(`[0:v]scale=${fmt.w}:${fmt.h}:force_original_aspect_ratio=increase,crop=${fmt.w}:${fmt.h},fps=30,setsar=1[v0]`);
}
let v = '[v0]';
if (overlay) {
  filters.push(`[1:v]scale=${fmt.w}:${fmt.h}:flags=lanczos,format=rgba[ov]`); // overlays are rendered at 1080 and scaled down
  filters.push(`${v}[ov]overlay=0:0:enable='gte(t,${overlayFrom})'[v1]`);
  v = '[v1]';
}
filters.push(`${v}format=yuv420p[vout]`);
// Audio graph: clip audio (unless --mute) + optional music bed, then loudness normalisation.
const dur = Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', input], {encoding: 'utf8'}).stdout) || 8;
const outDur = loopTo ? Number(loopTo) : trim ? Number(trim.split(':')[1]) - Number(trim.split(':')[0]) : dur;
const useClipAudio = hasAudio && !mute;
const musicIdx = overlay ? 2 : 1;
const norm = loudnorm ? ',loudnorm=I=-14:TP=-1.5:LRA=11' : '';
let aout = null;
if (music && useClipAudio) {
  filters.push(`[${musicIdx}:a]atrim=0:${outDur},asetpts=PTS-STARTPTS,volume=${musicGain},afade=t=out:st=${Math.max(0, outDur - 1)}:d=1[bed]`);
  filters.push(`[0:a]volume=0.35[clip]`);
  filters.push(`[clip][bed]amix=inputs=2:duration=first:dropout_transition=0${norm}[aout]`);
  aout = '[aout]';
} else if (music) {
  filters.push(`[${musicIdx}:a]atrim=0:${outDur},asetpts=PTS-STARTPTS,volume=${musicGain},afade=t=out:st=${Math.max(0, outDur - 1)}:d=1${norm}[aout]`);
  aout = '[aout]';
} else if (useClipAudio && loudnorm) {
  filters.push(`[0:a]loudnorm=I=-14:TP=-1.5:LRA=11[aout]`);
  aout = '[aout]';
}
args.push('-filter_complex', filters.join(';'), '-map', '[vout]');
if (aout) args.push('-map', aout);
else if (useClipAudio) args.push('-map', '0:a?');
if (trim) args.push('-t', String(outDur));
if (loopTo) args.push('-t', loopTo);
args.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-profile:v', 'high', '-level', '4.1', '-movflags', '+faststart');
if (aout || useClipAudio) args.push('-c:a', 'aac', '-b:a', '128k', '-ar', '48000');
else args.push('-an');
args.push(out);
run(args);
writeFileSync(`${out}.json`, JSON.stringify({step: 'finish', input, overlay: overlay || null, overlay_from: overlayFrom, trim: trim || null, music: music || null, music_gain: music ? musicGain : null, mute, loop_to: loopTo || null, pad: pad || null, loudnorm, format: flag('--format', '9x16'), size: `${fmt.w}x${fmt.h}`, created: new Date().toISOString()}, null, 2));
const info = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,size', '-of', 'csv=p=0', out], {encoding: 'utf8'}).stdout.trim();
console.log(`${out} · ${fmt.w}×${fmt.h} · duration,size ${info}`);

function run(a) {
  const r = spawnSync('ffmpeg', a, {encoding: 'utf8'});
  if (r.status !== 0) { console.error(r.stderr.split('\n').slice(-15).join('\n')); process.exit(1); }
}
