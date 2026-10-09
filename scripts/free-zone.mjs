#!/usr/bin/env node
/**
 * @fileoverview Finds the emptiest horizontal band of a clip or photo for an overlay block, so the CTA
 * (or a hook) never lands on the hands. Samples frames across the clip (after --cuts), scales each to the
 * delivery crop, measures per-row edge energy, keeps the MAX over time (a band must stay free for the
 * whole clip), then slides a window of the block height and picks the lowest energy. Rows under the Reels
 * UI are penalised (top 10 %, bottom 20 %) so an equally free band inside the safe zone wins.
 *
 *   node scripts/free-zone.mjs <video|image> [--cuts 3:16] [--block 0.12] [--frames 8] [--json]
 *   → {top_pct, bottom_pct, score, profile} — pass `--var cta_top=<top_pct>%` to render-overlay.mjs
 */

import {spawnSync} from 'node:child_process';

const argv = process.argv.slice(2);
const input = argv.find((a, i) => !a.startsWith('--') && !['--cuts', '--block', '--frames'].includes(argv[i - 1]));
const flag = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const W = 90, H = 160;  // analysis grid (9:16)
const block = Number(flag('--block', 0.12));
const nFrames = Number(flag('--frames', 8));
const isVideo = /\.(mp4|mov|webm)$/i.test(input);

const dur = isVideo ? Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', input], {encoding: 'utf8'}).stdout) || 8 : 0;
const cuts = flag('--cuts') ? flag('--cuts').split(',').map((c) => c.split(':').map(Number)) : [[0, dur]];
const times = [];
if (isVideo) {
  const total = cuts.reduce((t, [a, b]) => t + (b - a), 0);
  for (let i = 0; i < nFrames; i++) {
    let t = (i + 0.5) / nFrames * total;
    for (const [a, b] of cuts) { if (t <= b - a) { times.push(a + t); break; } t -= (b - a); }
  }
} else times.push(0);

const rows = new Float64Array(H);
for (const t of times) {
  const args = ['-v', 'error', ...(isVideo ? ['-ss', String(t)] : []), '-i', input, '-frames:v', '1', '-vf', `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},format=rgb24`, '-f', 'rawvideo', '-'];
  const r = spawnSync('ffmpeg', args, {maxBuffer: 1 << 24});
  const px = r.stdout;
  if (!px || px.length < W * H * 3) continue;
  const lum = new Float32Array(W * H), skin = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const R = px[i * 3], G = px[i * 3 + 1], B = px[i * 3 + 2];
    lum[i] = 0.299 * R + 0.587 * G + 0.114 * B;
    const cb = 128 - 0.168736 * R - 0.331264 * G + 0.5 * B, cr = 128 + 0.5 * R - 0.418688 * G - 0.081312 * B;
    skin[i] = (cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173 && lum[i] > 40) ? 1 : 0;  // classic YCbCr skin box
  }
  for (let y = 1; y < H - 1; y++) {
    let e = 0, sk = 0;
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      e += Math.abs(lum[i + 1] - lum[i - 1]) + Math.abs(lum[i + W] - lum[i - W]);
      sk += skin[i];
    }
    // a row that is 100 % skin counts like a very busy row (hands are the subject, never "empty")
    rows[y] = Math.max(rows[y], e / (W - 2) + 120 * (sk / (W - 2)));
  }
}
// penalties: Reels UI at the top 10 % and the bottom 20 % (caption, audio, profile), mild from 65–80 %
const weight = (y) => { const p = y / H; return p < 0.10 ? 3 : p > 0.80 ? 2 : p > 0.65 ? 1.3 : p < 0.14 ? 1.5 : 1; };
const bh = Math.round(H * block);
let best = {top: 0, score: Infinity};
for (let y = 2; y + bh < H - 2; y++) {
  let s = 0;
  for (let k = 0; k < bh; k++) s += rows[y + k] * weight(y + k);
  s /= bh;
  if (s < best.score - 1e-9 || (Math.abs(s - best.score) < 1e-9 && y > best.top)) best = {top: y, score: s};
}
const out = {input, cuts: flag('--cuts') || null, block, top_pct: +(best.top / H * 100).toFixed(1), bottom_pct: +((best.top + bh) / H * 100).toFixed(1), score: +best.score.toFixed(2), profile: Array.from(rows).map((v) => Math.round(v))};
console.log(JSON.stringify(argv.includes('--json') ? out : {...out, profile: undefined}));
