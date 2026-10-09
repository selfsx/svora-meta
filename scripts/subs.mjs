#!/usr/bin/env node
/**
 * @fileoverview Burn-in captions for re-cut reels: takes a transcript (transcribe.mjs) and the cut
 * list used by video-finish --cuts, writes an .ass file in the brand style (Roboto Condensed, cream
 * on a dark box, inside the 9:16 safe zone) with timestamps remapped to the cut output.
 *
 *   node scripts/subs.mjs --transcript x.transcript.json --cuts 0:13.5,40.5:50.3 --out x.ass [--size 720x1280] [--y 0.60]
 *   then: video-finish.mjs … --subs x.ass
 * Segments are clipped to the cuts; text keeps the original language/spelling.
 */

import {readFileSync, writeFileSync} from 'node:fs';

const argv = process.argv.slice(2);
const flag = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const tr = JSON.parse(readFileSync(flag('--transcript'), 'utf8'));
const cuts = flag('--cuts').split(',').map((c) => c.split(':').map(Number));
const [W, H] = flag('--size', '720x1280').split('x').map(Number);
const yFrac = Number(flag('--y', 0.60));  // caption baseline, fraction of height (inside the safe zone: < 0.65)
const out = flag('--out');
if (!out) { console.log('usage: subs.mjs --transcript x.json --cuts a:b,c:d --out x.ass'); process.exit(2); }

const ts = (s) => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = (s % 60).toFixed(2).padStart(5, '0'); return `${h}:${String(m).padStart(2, '0')}:${sec}`; };
const esc = (t) => t.replace(/\\/g, '\\\\').replace(/\{/g, '(').replace(/\}/g, ')');
const fontSize = Math.round(W * 0.062);  // ≈ 45px on 720 → readable on a phone
const marginV = Math.round(H * (1 - yFrac));
let ass = `[Script Info]\nScriptType: v4.00+\nPlayResX: ${W}\nPlayResY: ${H}\nWrapStyle: 0\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n` +
    `Style: Cap,Roboto Condensed,${fontSize},&H00EBF1F7,&H00EBF1F7,&H00000000,&HE01A1A1A,1,0,0,0,100,100,0,0,3,10,0,2,48,48,${marginV},1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
// BorderStyle 3 = opaque box (BackColour, alpha E0 ≈ 88%); Alignment 2 = bottom-centre; cream = &H00EBF1F7 (BGR).
let offset = 0, n = 0;
for (const [a, b] of cuts) {
  for (const s of tr.segments) {
    const st = Math.max(s.start, a), en = Math.min(s.end, b);
    if (en - st < 0.25) continue;
    ass += `Dialogue: 0,${ts(st - a + offset)},${ts(en - a + offset)},Cap,,0,0,0,,${esc(s.text)}\n`;
    n++;
  }
  offset += b - a;
}
writeFileSync(out, ass);
console.log(`${out} · ${n} captions · ${offset.toFixed(1)}s`);
