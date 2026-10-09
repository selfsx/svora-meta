#!/usr/bin/env node
/**
 * @fileoverview Instagram ingest for @svora.nails (our own content).
 *
 *   node scripts/ig-fetch.mjs profile [--user svora.nails] [--max 400]
 *       Collects post shortcodes into sources/instagram/index.json.
 *       Anonymous: only the latest 12 (Instagram hides the rest behind login).
 *       With .secrets/ig-state.json (see ig-login.mjs): scrolls the grid and
 *       reads the timeline GraphQL responses until --max or the end.
 *
 *   node scripts/ig-fetch.mjs posts [<shortcode>…] [--pending] [--max 50] [--delay 3000]
 *       Opens each post page (works anonymously), reads the media JSON Instagram
 *       embeds, downloads full-resolution photos (up to 3024×4032) and the best
 *       MP4 into sources/instagram/raw/<shortcode>/, and records caption, date,
 *       counts, dimensions in index.json. --pending = every indexed post not yet fetched.
 *
 * Reads: .secrets/ig-state.json (optional). Writes: sources/instagram/index.json, sources/instagram/raw/**.
 * Be a polite client: 2–5 s between posts, ≤ ~150 posts per run.
 */

import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {rel} from './lib/env.mjs';

const argv = process.argv.slice(2);
const cmd = argv[0];
const flag = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const user = flag('--user', 'svora.nails');
const max = Number(flag('--max', cmd === 'profile' ? 400 : 50));
const delay = Number(flag('--delay', 3000));
const indexFile = rel('sources', 'instagram', 'index.json');
const rawDir = rel('sources', 'instagram', 'raw');
const stateFile = rel('.secrets', 'ig-state.json');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

mkdirSync(rawDir, {recursive: true});
const index = existsSync(indexFile) ? JSON.parse(readFileSync(indexFile, 'utf8')) : {user, posts: {}};
const saveIndex = () => writeFileSync(indexFile, JSON.stringify({...index, updated: new Date().toISOString()}, null, 2));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({headless: true});
const ctx = await browser.newContext({userAgent: UA, locale: 'en-US', viewport: {width: 1280, height: 900}, ...(existsSync(stateFile) ? {storageState: stateFile} : {})});
const loggedIn = existsSync(stateFile);

if (cmd === 'profile') await profile();
else if (cmd === 'posts') await posts();
else { console.log('usage: ig-fetch.mjs profile|posts …'); process.exit(2); }
await browser.close();

/* --------------------------------------------------------------------- */

async function profile() {
  const page = await ctx.newPage();
  const found = new Map(); // code → {taken_at?, is_video?}
  page.on('response', async (r) => {
    if (!/graphql|\/api\/v1\//.test(r.url())) return;
    let text;
    try { text = await r.text(); } catch { return; }
    if (!text.includes('"edges"')) return;
    try {
      walk(JSON.parse(text), (node) => {
        if (node && typeof node === 'object' && typeof node.code === 'string' && /^[A-Za-z0-9_-]{8,12}$/.test(node.code) && (node.taken_at || node.media_type || node.__typename)) {
          if (node.product_type === 'carousel_item') return; // a slide, not a post
          const prev = found.get(node.code) || {};
          // Timeline nodes carry most of what a post page would: keep it so `posts` can download
          // straight from the URLs without visiting each page.
          const summary = summarise(node);
          if (!prev.taken_at || (summary.media && summary.media.length && !(prev.media && prev.media.length))) found.set(node.code, {...prev, ...summary});
        }
      });
    } catch { /* not JSON */ }
  });
  await page.goto(`https://www.instagram.com/${user}/`, {waitUntil: 'domcontentloaded', timeout: 60000});
  await page.waitForTimeout(3000);
  await dismissCookies(page);
  const fromHtml = async () => { for (const m of (await page.content()).matchAll(/\/(?:p|reel)\/([A-Za-z0-9_-]{8,12})\//g)) if (!found.has(m[1])) found.set(m[1], {}); };
  await fromHtml();
  if (loggedIn) {
    let stale = 0, last = 0;
    while (found.size < max && stale < 6) {
      await page.mouse.wheel(0, 3500);
      await page.waitForTimeout(1500 + Math.random() * 1500);
      await fromHtml();
      if (found.size === last) stale++; else stale = 0;
      last = found.size;
      process.stdout.write(`\r  collected ${found.size} posts`);
    }
    console.log();
  } else {
    console.log(`anonymous mode: Instagram shows only the latest ${found.size} posts without login. Run scripts/ig-login.mjs once to collect the full archive.`);
  }
  let added = 0;
  for (const [code, meta] of found) {
    if (!index.posts[code]) { index.posts[code] = {code, ...meta, fetched: false}; added++; } else {
      const cur = index.posts[code];
      for (const [k, v] of Object.entries(meta)) if (v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && !v.length)) cur[k] = v;
    }
  }
  saveIndex();
  console.log(`index: ${Object.keys(index.posts).length} posts (${added} new) → ${path.relative(rel(), indexFile)}`);
}

async function posts() {
  let codes = argv.slice(1).filter((a) => !a.startsWith('--') && /^[A-Za-z0-9_-]{8,12}$/.test(a));
  if (argv.includes('--pending')) codes = Object.values(index.posts).filter((p) => !p.fetched).map((p) => p.code);
  codes = codes.slice(0, max);
  if (!codes.length) { console.log('nothing to fetch (pass shortcodes or --pending after `profile`)'); return; }
  const visit = argv.includes('--visit');
  const cdn = codes.filter((c) => !visit && index.posts[c] && index.posts[c].media_urls && index.posts[c].media_urls.length);
  const pages = codes.filter((c) => !cdn.includes(c));
  const total = codes.length;
  let n = 0;
  const record = (code, info, err) => {
    n++;
    if (err) {
      index.posts[code] = {...(index.posts[code] || {}), code, fetched: false, error: err.message};
      console.log(`[${n}/${total}] ${code} FAILED: ${err.message}`);
    } else {
      index.posts[code] = {...(index.posts[code] || {}), ...info, fetched: true, fetched_at: new Date().toISOString()};
      console.log(`[${n}/${total}] ${code} ${info.is_video ? 'video' : 'photo'} ×${info.media.length} · ${info.taken_at ? new Date(info.taken_at * 1000).toISOString().slice(0, 10) : '?'} · ${(info.caption || '').slice(0, 60).replace(/\n/g, ' ')}`);
    }
    saveIndex();
  };
  // CDN downloads: no page visit, so a small worker pool is still a polite client.
  const concurrency = Number(flag('--concurrency', 6));
  let next = 0;
  await Promise.all(Array.from({length: Math.min(concurrency, cdn.length)}, async () => {
    while (next < cdn.length) {
      const code = cdn[next++];
      try { record(code, await fetchFromUrls(index.posts[code])); } catch (e) { record(code, null, e); }
      await sleep(200 + Math.random() * 400);
    }
  }));
  if (!pages.length) return;
  const page = await ctx.newPage();
  for (const code of pages) {
    try { record(code, await fetchPost(page, code)); } catch (e) { record(code, null, e); }
    await sleep(delay + Math.random() * 2000);
  }
}

/** Downloads straight from the CDN URLs the profile scrape stored — no page visit, far gentler. */
async function fetchFromUrls(known) {
  const code = known.code;
  const dir = path.join(rawDir, code);
  mkdirSync(dir, {recursive: true});
  const media = [];
  for (const m of known.media_urls) {
    const entry = {i: m.i, is_video: m.is_video};
    if (m.image_url) {
      const f = path.join(dir, `${code}_${String(m.i + 1).padStart(2, '0')}.jpg`);
      if (!existsSync(f)) await download(m.image_url, f);
      entry.image = path.relative(rel(), f); entry.width = m.width; entry.height = m.height;
    }
    if (m.video_url) {
      const f = path.join(dir, `${code}_${String(m.i + 1).padStart(2, '0')}.mp4`);
      if (!existsSync(f)) await download(m.video_url, f);
      entry.video = path.relative(rel(), f); entry.vwidth = m.vwidth; entry.vheight = m.vheight;
    }
    media.push(entry);
  }
  const info = {code, taken_at: known.taken_at, is_video: known.is_video, caption: known.caption || '', like_count: known.like_count, comment_count: known.comment_count,
    play_count: known.play_count, product_type: known.product_type, media, url: `https://www.instagram.com/p/${code}/`, via: 'cdn'};
  writeFileSync(path.join(dir, 'post.json'), JSON.stringify(info, null, 2));
  return info;
}

async function fetchPost(page, code) {
  let captured = null;
  const handler = async (r) => {
    if (!/graphql/.test(r.url())) return;
    try { const t = await r.text(); if (t.includes('shortcode__web_info') || t.includes('"carousel_media"') || t.includes('image_versions2')) captured = captured || JSON.parse(t); } catch {}
  };
  page.on('response', handler);
  await page.goto(`https://www.instagram.com/p/${code}/`, {waitUntil: 'domcontentloaded', timeout: 60000});
  await page.waitForTimeout(2500);
  await dismissCookies(page);
  page.off('response', handler);
  let item = captured && findItem(captured, code);
  if (!item) {
    const scripts = await page.$$eval('script[type="application/json"]', (els) => els.map((e) => e.textContent));
    for (const s of scripts) {
      if (!s.includes(code)) continue;
      try { item = findItem(JSON.parse(s), code); } catch {}
      if (item) break;
    }
  }
  if (!item) throw new Error('post JSON not found (login wall or layout change)');

  const dir = path.join(rawDir, code);
  mkdirSync(dir, {recursive: true});
  const slides = item.carousel_media && item.carousel_media.length ? item.carousel_media : [item];
  const media = [];
  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const img = s.image_versions2 && s.image_versions2.candidates && s.image_versions2.candidates[0];
    const vid = s.video_versions && s.video_versions[0];
    const entry = {i, is_video: !!vid};
    if (img) {
      const f = path.join(dir, `${code}_${String(i + 1).padStart(2, '0')}.jpg`);
      if (!existsSync(f)) await download(img.url, f);
      entry.image = path.relative(rel(), f); entry.width = img.width; entry.height = img.height;
    }
    if (vid) {
      const f = path.join(dir, `${code}_${String(i + 1).padStart(2, '0')}.mp4`);
      if (!existsSync(f)) await download(vid.url, f);
      entry.video = path.relative(rel(), f); entry.vwidth = vid.width; entry.vheight = vid.height;
    }
    media.push(entry);
  }
  const info = {
    code, taken_at: item.taken_at || null, is_video: !!(item.video_versions && item.video_versions.length),
    caption: item.caption && item.caption.text || '', like_count: item.like_count ?? null, comment_count: item.comment_count ?? null,
    play_count: item.play_count ?? item.ig_play_count ?? null, product_type: item.product_type || null, media,
    url: `https://www.instagram.com/p/${code}/`,
  };
  writeFileSync(path.join(dir, 'post.json'), JSON.stringify({...info, raw_keys: Object.keys(item)}, null, 2));
  return info;
}

/** Compact view of a media node (timeline or post page): meta + direct media URLs. */
function summarise(node) {
  const slides = node.carousel_media && node.carousel_media.length ? node.carousel_media : [node];
  const media = slides.map((s, i) => {
    const img = s.image_versions2 && s.image_versions2.candidates && s.image_versions2.candidates[0];
    const vid = s.video_versions && s.video_versions[0];
    return {i, is_video: !!vid, image_url: img ? img.url : null, width: img ? img.width : null, height: img ? img.height : null,
      video_url: vid ? vid.url : null, vwidth: vid ? vid.width : null, vheight: vid ? vid.height : null};
  }).filter((m) => m.image_url || m.video_url);
  return {
    code: node.code, taken_at: node.taken_at || null,
    is_video: node.media_type === 2 || !!(node.video_versions && node.video_versions.length),
    is_carousel: !!(node.carousel_media && node.carousel_media.length),
    caption: node.caption && node.caption.text || '', like_count: node.like_count ?? null, comment_count: node.comment_count ?? null,
    play_count: node.play_count ?? node.ig_play_count ?? null, product_type: node.product_type || null,
    owner: (node.user && node.user.username) || (node.owner && node.owner.username) || null, // tagged/collab posts show up in the grid feed too
    media_urls: media,
  };
}

function findItem(obj, code) {
  let hit = null;
  walk(obj, (node) => { if (!hit && node && typeof node === 'object' && node.code === code && (node.image_versions2 || node.carousel_media || node.video_versions)) hit = node; });
  return hit;
}

function walk(node, fn, depth = 0) {
  if (depth > 40 || node === null || typeof node !== 'object') return;
  fn(node);
  for (const v of Array.isArray(node) ? node : Object.values(node)) walk(v, fn, depth + 1);
}

async function download(url, file) {
  const res = await fetch(url, {headers: {'User-Agent': UA}});
  if (!res.ok) throw new Error(`download HTTP ${res.status}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

async function dismissCookies(page) {
  for (const t of ['Decline optional cookies', 'Odrzuć opcjonalne pliki cookie', 'Allow all cookies']) {
    const btn = page.getByText(t, {exact: true}).first();
    if (await btn.count().catch(() => 0)) { await btn.click().catch(() => {}); await page.waitForTimeout(800); return; }
  }
}
