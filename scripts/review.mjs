#!/usr/bin/env node
/**
 * @fileoverview The operator's review loop for creatives.
 *   node scripts/review.mjs build [--status draft] [--batch x]   → creatives/_work/review/index.html (local page:
 *        every creative playable, 👍 / 👎 + a note each, "Export" copies a JSON of verdicts)
 *   node scripts/review.mjs apply <verdicts.json>                 → status approved|rejected + notes in the manifests
 * Verdict JSON: {"reviewed": "2026-10-09", "verdicts": {"<name>": {"ok": true|false, "note": "…"}}}
 * The page is a plain file (file://) — videos play from the repo, nothing is uploaded anywhere.
 */

import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
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
  const dir = rel('creatives', '_work', 'review');
  mkdirSync(dir, {recursive: true});
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[ch]));
  const cards = rows.map((c) => {
    const url = pathToFileURL(c.path).href;
    const media = c.type === 'vd' ? `<video src="${url}#t=1.5" controls muted loop playsinline preload="metadata"></video>` : `<img src="${url}" loading="lazy">`;
    return `<div class="card" data-name="${esc(c.name)}">
  ${media}
  <div class="meta"><b>${esc(c.name)}</b><br>${esc(c.batch)} · ${esc(c.angle || '-')} · ${esc(c.concept)} / ${esc(c.hook)} · ${esc(c.format)} · ${esc(c.lang)}<br><i>${esc(c.hook_text || '')}</i></div>
  <div class="row"><button class="ok">👍 good</button><button class="bad">👎 bad</button><input placeholder="note (what to fix / why it works)"></div>
</div>`;
  }).join('\n');
  const html = `<!doctype html><meta charset="utf-8"><title>SVORA creative review</title>
<style>
body{font-family:system-ui,sans-serif;background:#1a1a1a;color:#f7f1eb;margin:0;padding:20px}
h1{font-size:20px;margin:0 0 12px}.bar{position:sticky;top:0;background:#1a1a1a;padding:10px 0;display:flex;gap:12px;align-items:center;z-index:2}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
.card{background:#262626;border-radius:12px;padding:10px;border:2px solid transparent}.card.ok{border-color:#59c26a}.card.bad{border-color:#e05252}
video,img{width:100%;aspect-ratio:9/16;object-fit:contain;background:#000;border-radius:8px}
.meta{font-size:12px;line-height:1.4;margin:8px 0;word-break:break-all}.row{display:flex;gap:6px}
button{cursor:pointer;border:0;border-radius:8px;padding:8px 10px;font-weight:700}.ok{background:#59c26a}.bad{background:#e05252}
input{flex:1;border-radius:8px;border:1px solid #444;background:#111;color:#f7f1eb;padding:6px}
#export{background:#ff8030;color:#1a1a1a}#out{width:100%;height:80px;background:#111;color:#ccc;border:1px solid #444;display:none}
</style>
<h1>SVORA creative review — ${rows.length} ${flag('--status', 'draft')} creatives</h1>
<div class="bar"><button id="export">Export verdicts (copies JSON)</button><span id="count"></span><label><input type="checkbox" id="unmute"> sound</label></div>
<textarea id="out"></textarea>
<div class="grid">${cards}</div>
<script>
const V = JSON.parse(localStorage.getItem('svora-review') || '{}');
const cards = [...document.querySelectorAll('.card')];
function paint(){ let n=0; for (const c of cards){ const v=V[c.dataset.name]; c.classList.toggle('ok', !!v && v.ok===true); c.classList.toggle('bad', !!v && v.ok===false); if(v){ n++; c.querySelector('input').value=v.note||''; } } document.getElementById('count').textContent = n + ' / ' + cards.length + ' marked'; }
for (const c of cards){ const name=c.dataset.name; c.querySelector('.ok').onclick=()=>{V[name]={...(V[name]||{}),ok:true}; save();}; c.querySelector('.bad').onclick=()=>{V[name]={...(V[name]||{}),ok:false}; save();}; c.querySelector('input').oninput=(e)=>{V[name]={...(V[name]||{}),note:e.target.value}; localStorage.setItem('svora-review', JSON.stringify(V));}; }
function save(){ localStorage.setItem('svora-review', JSON.stringify(V)); paint(); }
document.getElementById('export').onclick=async()=>{ const verdicts={}; for(const [k,v] of Object.entries(V)) if(v.ok!==undefined) verdicts[k]=v; const txt=JSON.stringify({reviewed:new Date().toISOString().slice(0,10), verdicts},null,1); const o=document.getElementById('out'); o.style.display='block'; o.value=txt; try{ await navigator.clipboard.writeText(txt); }catch(e){} o.select(); };
document.getElementById('unmute').onchange=(e)=>{ for(const v of document.querySelectorAll('video')) v.muted=!e.target.checked; };
paint();
</script>`;
  const out = path.join(dir, 'index.html');
  writeFileSync(out, html);
  console.log(`${rows.length} creatives → ${out}\nopen: ${pathToFileURL(out).href}`);
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
