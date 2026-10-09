#!/usr/bin/env node
/**
 * @fileoverview Catalogue of the Instagram archive for creative selection.
 * Reads sources/instagram/index.json (+ raw/ when present), writes
 * sources/instagram/catalog.json and catalog.md (own posts, grouped by year,
 * with era, caption language, keyword concept guess, engagement, media) and,
 * with --sheets, contact sheets (ImageMagick montage) for visual tagging.
 *
 *   node scripts/ig-catalog.mjs [--since 2025-01-01] [--sheets] [--cols 6] [--tile 220]
 * Tags set by hand/agents live in index.json under `tags` (concept, quality, notes) and survive re-runs.
 */

import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {rel} from './lib/env.mjs';

const argv = process.argv.slice(2);
const flag = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const since = Math.floor(new Date(flag('--since', '2017-01-01')).getTime() / 1000);
const OWN = new Set(['svora.nails', 'svora.nails.warszawa']);
const index = JSON.parse(readFileSync(rel('sources', 'instagram', 'index.json'), 'utf8'));

const KW = {
  crazy: /crazy|3d|extra ?long|cat ?claws|кіг(о|т)|когт|stiletto|шпиль|довг(і|их)|длинн|екстрим|экстрим|szpon|pazur|długie/i,
  art: /nail ?art|\bart\b|дизайн|zdobien|малюн|рисун|flower|квіт|цвет(ы|оч)|leopard|chrome|хром|втирк|pyłk|french|френч|aquarel|акварел|kwiat/i,
  classic: /nude|milky|glazed|hybryd|гібрид|гибрид|класик|classic|minimal|natural|натурал|jednolit|однотон/i,
  pedi: /pedicure|педикюр|pedi\b|стоп|stóp|feet/i,
  brows: /brwi|брови|brow|lamin|ламін|ламин/i,
  brand: /salon|салон|team|команд|mariana|маріан|мариан|wynajem|opini|відгук|отзыв|interior|інтер|интер|pop-up|event|івент|prezent|promoc|акці|акци|zniżk|rabat|-20|20%|sierpniu/i,
};
const lang = (c) => /[іїєґ]/i.test(c) ? 'ua' : /[а-я]/i.test(c) ? 'ru' : /[ąćęłńóśźż]/i.test(c) ? 'pl' : /[a-z]{3,}/i.test(c) ? 'en' : '-';
const era = (t) => (t && t < Date.UTC(2022, 5, 1) / 1000) ? 'ukraine' : 'warsaw';
const day = (t) => (t ? new Date(t * 1000).toISOString().slice(0, 10) : '?');

const rows = Object.values(index.posts)
    .filter((p) => OWN.has(p.owner) || !p.owner)
    .filter((p) => !p.taken_at || p.taken_at >= since)
    .map((p) => {
      const cap = p.caption || '';
      const guess = Object.entries(KW).filter(([, re]) => re.test(cap)).map(([k]) => k);
      const first = (p.media && p.media[0]) || null;
      const thumb = first && first.image ? rel(first.image) : null;
      return {
        code: p.code, date: day(p.taken_at), ts: p.taken_at || 0, era: era(p.taken_at), owner: p.owner || '?',
        kind: p.is_video ? 'video' : p.is_carousel ? 'carousel' : 'photo', slides: (p.media_urls || p.media || []).length,
        likes: p.like_count ?? null, comments: p.comment_count ?? null, lang: lang(cap), guess, tags: p.tags || null,
        caption: cap.replace(/\s+/g, ' ').trim(), fetched: !!p.fetched, thumb, url: `https://www.instagram.com/p/${p.code}/`,
        dims: first ? `${first.width || first.vwidth || '?'}×${first.height || first.vheight || '?'}` : '?',
      };
    })
    .sort((a, b) => b.ts - a.ts);

mkdirSync(rel('sources', 'instagram'), {recursive: true});
writeFileSync(rel('sources', 'instagram', 'catalog.json'), JSON.stringify({generated: new Date().toISOString(), since: flag('--since', '2017-01-01'), posts: rows}, null, 2));

const byYear = {};
for (const r of rows) (byYear[r.date.slice(0, 4)] ||= []).push(r);
let md = `# Instagram catalogue — @svora.nails own posts\n\nGenerated ${new Date().toISOString().slice(0, 10)} from \`index.json\`. ${rows.length} posts. ` +
    `\`guess\` = keyword guess from the caption (not a verdict); \`tags\` = hand/agent tags in index.json.\n\n`;
for (const y of Object.keys(byYear).sort().reverse()) {
  const list = byYear[y];
  const k = list.reduce((m, r) => ((m[r.kind] = (m[r.kind] || 0) + 1), m), {});
  md += `## ${y} — ${list.length} posts (${Object.entries(k).map(([a, b]) => `${b} ${a}`).join(', ')})\n\n| code | date | kind | slides | likes | lang | guess | tags | caption |\n|---|---|---|---|---|---|---|---|---|\n`;
  for (const r of list) {
    md += `| [${r.code}](${r.url}) | ${r.date} | ${r.kind} | ${r.slides} | ${r.likes ?? ''} | ${r.lang} | ${r.guess.join(' ') || ''} | ${r.tags ? Object.values(r.tags).join(' ') : ''} | ${r.caption.slice(0, 90).replace(/\|/g, '/')} |\n`;
  }
  md += '\n';
}
writeFileSync(rel('sources', 'instagram', 'catalog.md'), md);
console.log(`catalog: ${rows.length} posts → sources/instagram/catalog.{json,md}`);

if (argv.includes('--sheets')) {
  const cols = Number(flag('--cols', 6)), tile = Number(flag('--tile', 220)), per = cols * 5;
  const dir = rel('creatives', '_work', 'sheets');
  mkdirSync(dir, {recursive: true});
  const withThumb = rows.filter((r) => r.thumb && existsSync(r.thumb));
  let n = 0;
  for (let i = 0; i < withThumb.length; i += per) {
    const chunk = withThumb.slice(i, i + per);
    const out = path.join(dir, `sheet-${String(++n).padStart(2, '0')}.jpg`);
    const args = ['montage', '-background', '#1a1a1a', '-fill', 'white', '-font', 'DejaVu-Sans', '-pointsize', '14', '-label', '%t', '-tile', `${cols}x`, '-geometry', `${tile}x${tile}+4+4`];
    for (const r of chunk) args.push('-label', `${r.code} ${r.date.slice(2)} ${r.kind[0]}${r.likes ? ' ♥' + r.likes : ''}`, r.thumb);
    args.push(out);
    const res = spawnSync('magick', args, {encoding: 'utf8'});
    if (res.status !== 0) console.error(res.stderr.slice(-300));
    console.log(`${path.relative(rel(), out)} — ${chunk[0].date} … ${chunk[chunk.length - 1].date} (${chunk.length})`);
  }
  console.log(`${withThumb.length} thumbnails on ${n} sheets; ${rows.length - withThumb.length} posts without a downloaded thumbnail`);
}
