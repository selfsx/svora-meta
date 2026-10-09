#!/usr/bin/env node
/**
 * @fileoverview The operator's review loop for creatives.
 *   node scripts/review.mjs build [--status draft|all] [--batch x] [--pick names.txt] [--out first20.html]   → creatives/_work/review/index.html (local page:
 *        one card per MASTER with language/format switches, sound on, 👍 / 👎 + a note that covers all its
 *        localisations; filters by angle/type/batch; "Export" copies a JSON of verdicts expanded to every file)
 *   node scripts/review.mjs apply <verdicts.json>                 → status approved|rejected + notes in the manifests
 * Verdict JSON: {"reviewed": "2026-10-09", "verdicts": {"<name>": {"ok": true|false, "note": "…"}}}
 * The page is a plain file (file://) — videos play from the repo, nothing is uploaded anywhere.
 */

import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {rel} from './lib/env.mjs';
import {allCreatives} from './lib/config.mjs';

const argv = process.argv.slice(2);
const cmd = argv[0];
const flag = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

if (cmd === 'build') {
  let rows = allCreatives();
  if (flag('--status', 'draft') !== 'all') rows = rows.filter((c) => c.status === flag('--status', 'draft'));
  if (flag('--batch')) rows = rows.filter((c) => c.batch === flag('--batch'));
  // --pick <file>: one creative name per line (a campaign's ad list) → only those, in that order, one card each
  const pickList = flag('--pick') ? readFileSync(flag('--pick'), 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#')) : null;
  if (pickList) rows = pickList.map((n) => rows.find((c) => c.name === n)).filter(Boolean);
  const dir = rel('creatives', '_work', 'review');
  mkdirSync(dir, {recursive: true});
  // One card per master: all languages and formats of the same job (b03) or of the same source+angle+hook+type.
  const masterKey = (c) => pickList ? c.name : [c.source, c.angle || '-', c.concept, c.type].join('|');  // across batches: a ua hero in b01 and its pl/ru/en twins in b03 are one master
  const hasAudio = (c) => c.type !== 'vd' ? null : spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=codec_name', '-of', 'csv=p=0', c.path], {encoding: 'utf8'}).stdout.trim().length > 0;
  const groups = {};
  for (const c of rows) (groups[masterKey(c)] ||= []).push(c);
  const LANG_ORDER = ['ua', 'pl', 'ru', 'en'];
  const data = Object.entries(groups).map(([key, list]) => {
    list.sort((a, b) => LANG_ORDER.indexOf(a.lang) - LANG_ORDER.indexOf(b.lang) || a.format.localeCompare(b.format));
    const first = list[0];
    return {
      key, batch: [...new Set(list.map((c) => c.batch))].join(' + '), angle: first.angle || '-', concept: first.concept, hook: [...new Set(list.map((c) => c.hook))].join('/'), type: first.type, source: first.source,
      items: list.map((c) => ({name: c.name, lang: c.lang, format: c.format, url: pathToFileURL(c.path).href, hook_text: c.hook_text || '', audio: hasAudio(c)})),
    };
  });
  const html = `<!doctype html><meta charset="utf-8"><title>SVORA creative review</title>
<style>
body{font-family:system-ui,sans-serif;background:#1a1a1a;color:#f7f1eb;margin:0;padding:16px 20px}
h1{font-size:18px;margin:0 0 10px}
.bar{position:sticky;top:0;background:#1a1a1a;padding:10px 0;display:flex;gap:10px;align-items:center;flex-wrap:wrap;z-index:2;border-bottom:1px solid #333}
.bar select,.bar label{font-size:14px}.bar select{background:#111;color:#f7f1eb;border:1px solid #444;border-radius:6px;padding:4px 6px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:18px;margin-top:14px}
.card{background:#262626;border-radius:12px;padding:12px;border:2px solid transparent;display:flex;flex-direction:column;gap:8px}
.card.ok{border-color:#59c26a}.card.bad{border-color:#e05252}.card.hidden{display:none}
.media{position:relative}video,img{width:100%;aspect-ratio:9/16;object-fit:contain;background:#000;border-radius:8px;display:block}
.noaudio{position:absolute;right:8px;top:8px;background:rgba(0,0,0,.7);color:#ffbe98;font-size:12px;padding:3px 8px;border-radius:6px}
.sw{display:flex;gap:6px;flex-wrap:wrap}.sw button{background:#333;color:#ccc;border:0;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer}.sw button.on{background:#f7f1eb;color:#1a1a1a;font-weight:700}
.meta{font-size:12px;line-height:1.45;color:#bbb}.meta b{color:#f7f1eb;word-break:break-all}.meta .angle{display:inline-block;background:#ff8030;color:#1a1a1a;font-weight:800;padding:1px 8px;border-radius:999px;margin-right:6px}
.row{display:flex;gap:8px}.row button{flex:1;cursor:pointer;border:0;border-radius:8px;padding:10px;font-weight:700;font-size:14px}.ok-b{background:#59c26a}.bad-b{background:#e05252}
textarea{width:100%;box-sizing:border-box;min-height:64px;border-radius:8px;border:1px solid #444;background:#111;color:#f7f1eb;padding:8px;font:13px system-ui;resize:vertical}
#export{background:#ff8030;color:#1a1a1a;border:0;border-radius:8px;padding:8px 12px;font-weight:700;cursor:pointer}
#clear{background:#444;color:#f7f1eb;border:0;border-radius:8px;padding:8px 12px;cursor:pointer}
#out{width:100%;height:90px;background:#111;color:#ccc;border:1px solid #444;display:none;margin-top:8px}
</style>
<h1>SVORA creative review — ${pickList ? `${rows.length} ads for ${path.basename(flag('--pick'))}` : `${data.length} masters · ${rows.length} files (${flag('--status', 'draft')})`}</h1>
<div class="bar">
  <button id="export">Export verdicts (copies JSON)</button><button id="clear" title="forget every mark and note on this page">Clear all</button><span id="count"></span>
  <label>angle <select id="f-angle"><option value="">all</option>${[...new Set(data.map((d) => d.angle))].sort().map((a) => `<option>${a}</option>`).join('')}</select></label>
  <label>type <select id="f-type"><option value="">all</option><option value="vd">video</option><option value="st">static</option></select></label>
  <label>batch <select id="f-batch"><option value="">all</option>${[...new Set(data.map((d) => d.batch))].sort().map((a) => `<option>${a}</option>`).join('')}</select></label>
  <label><input type="checkbox" id="f-unmarked"> only unmarked</label>
</div>
<textarea id="out"></textarea>
<div class="grid" id="grid"></div>
<script>
const DATA = ${JSON.stringify(data)};
const KEY = 'svora-review-' + ${JSON.stringify(new Date().toISOString().slice(0, 16))};  // marks live per build, so a remade set starts clean
let V = JSON.parse(localStorage.getItem(KEY) || '{}');
const save = () => localStorage.setItem(KEY, JSON.stringify(V));
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[ch]));
const grid = document.getElementById('grid');
for (const g of DATA) {
  const card = document.createElement('div'); card.className = 'card'; card.dataset.key = g.key;
  const langs = [...new Set(g.items.map((i) => i.lang))], formats = [...new Set(g.items.map((i) => i.format))];
  let lang = langs[0], format = formats[0];
  const pick = () => g.items.find((i) => i.lang === lang && i.format === format) || g.items.find((i) => i.lang === lang) || g.items[0];
  card.innerHTML = \`<div class="media"></div>
    <div class="sw sw-lang">\${langs.map((l) => \`<button data-l="\${l}">\${l}</button>\`).join('')} <span style="width:10px"></span> \${formats.map((f) => \`<button data-f="\${f}">\${f}</button>\`).join('')}</div>
    <div class="meta"><span class="angle">\${esc(g.angle)}</span>\${esc(g.concept)} / \${esc(g.hook)} · \${g.type === 'vd' ? 'video' : 'static'} · \${g.items.length} file\${g.items.length > 1 ? 's' : ''} · \${esc(g.batch)}<br><b class="name"></b><br><i class="ht"></i></div>
    <div class="row"><button class="ok-b">👍 good</button><button class="bad-b">👎 bad</button></div>
    <textarea placeholder="note — what to fix, or why it works (applies to all \${g.items.length} localisations)"></textarea>\`;
  const render = () => {
    const it = pick();
    card.querySelector('.media').innerHTML = (g.type === 'vd' ? \`<video src="\${it.url}#t=0.5" controls loop playsinline preload="metadata"></video>\` : \`<img src="\${it.url}" loading="lazy">\`) + (it.audio === false ? '<span class="noaudio">no audio yet (music bed pending)</span>' : '');
    card.querySelector('.name').textContent = it.name; card.querySelector('.ht').textContent = it.hook_text;
    for (const b of card.querySelectorAll('[data-l]')) b.classList.toggle('on', b.dataset.l === it.lang);
    for (const b of card.querySelectorAll('[data-f]')) b.classList.toggle('on', b.dataset.f === it.format);
  };
  for (const b of card.querySelectorAll('[data-l]')) b.onclick = () => { lang = b.dataset.l; render(); };
  for (const b of card.querySelectorAll('[data-f]')) b.onclick = () => { format = b.dataset.f; render(); };
  card.querySelector('.ok-b').onclick = () => { V[g.key] = {...(V[g.key] || {}), ok: true}; save(); paint(); };
  card.querySelector('.bad-b').onclick = () => { V[g.key] = {...(V[g.key] || {}), ok: false}; save(); paint(); };
  const ta = card.querySelector('textarea'); ta.value = (V[g.key] || {}).note || '';
  ta.oninput = () => { V[g.key] = {...(V[g.key] || {}), note: ta.value}; save(); };
  render(); grid.appendChild(card); g.el = card;
}
function paint() {
  let n = 0; const fa = document.getElementById('f-angle').value, ft = document.getElementById('f-type').value, fb = document.getElementById('f-batch').value, fu = document.getElementById('f-unmarked').checked;
  for (const g of DATA) {
    const v = V[g.key]; const marked = v && v.ok !== undefined; if (marked) n++;
    g.el.classList.toggle('ok', !!v && v.ok === true); g.el.classList.toggle('bad', !!v && v.ok === false);
    g.el.classList.toggle('hidden', (fa && g.angle !== fa) || (ft && g.type !== ft) || (fb && g.batch !== fb) || (fu && marked));
  }
  document.getElementById('count').textContent = n + ' / ' + DATA.length + ' masters marked';
}
for (const id of ['f-angle', 'f-type', 'f-batch', 'f-unmarked']) document.getElementById(id).onchange = paint;
document.getElementById('export').onclick = async () => {
  const verdicts = {};
  for (const g of DATA) { const v = V[g.key]; if (!v || v.ok === undefined) continue; for (const it of g.items) verdicts[it.name] = {ok: v.ok, note: v.note || ''}; }
  const txt = JSON.stringify({reviewed: new Date().toISOString().slice(0, 10), masters: Object.values(V).filter((v) => v.ok !== undefined).length, verdicts}, null, 1);
  const o = document.getElementById('out'); o.style.display = 'block'; o.value = txt; try { await navigator.clipboard.writeText(txt); } catch (e) {} o.select();
};
document.getElementById('clear').onclick = () => { if (!confirm('Clear every mark and note on this page?')) return; V = {}; save(); for (const g of DATA) g.el.querySelector('textarea').value = ''; paint(); };
paint();
</script>`;
  const out = path.join(dir, flag('--out', 'index.html'));
  writeFileSync(out, html);
  console.log(`${data.length} masters / ${rows.length} files → ${out}\nopen: ${pathToFileURL(out).href}`);
} else if (cmd === 'apply') {
  const file = argv[1];
  if (!file || !existsSync(file)) { console.log('usage: review.mjs apply verdicts.json'); process.exit(2); }
  const {verdicts, reviewed} = JSON.parse(readFileSync(file, 'utf8'));
  const all = allCreatives();
  const byBatch = {};
  let ok = 0, bad = 0, miss = 0;
  for (const [name, v] of Object.entries(verdicts)) {
    const c = all.find((x) => x.name === name);
    if (!c) { miss++; console.log(`  ? not found: ${name}`); continue; }
    const mp = rel('creatives', c.batch, 'manifest.json');
    byBatch[c.batch] ||= JSON.parse(readFileSync(mp, 'utf8'));
    const e = byBatch[c.batch].creatives.find((x) => x.name === name);
    e.status = v.ok ? 'approved' : 'rejected';
    e.review = {date: reviewed || new Date().toISOString().slice(0, 10), ok: !!v.ok, note: v.note || ''};
    if (v.note) e.notes = `${e.notes ? e.notes + ' ' : ''}[review ${e.review.date}] ${v.note}`;
    v.ok ? ok++ : bad++;
  }
  for (const [b, m] of Object.entries(byBatch)) writeFileSync(rel('creatives', b, 'manifest.json'), JSON.stringify({...m, updated: new Date().toISOString()}, null, 2));
  console.log(`applied: ${ok} approved · ${bad} rejected · ${miss} unknown`);
} else {
  console.log('usage: review.mjs build [--status draft|all] [--batch x] | apply verdicts.json');
}
