#!/usr/bin/env node
/**
 * @fileoverview The one write path to Meta. Turns a campaign spec
 * (campaigns/specs/<name>.yaml) into a campaign → ad sets → creatives → ads,
 * all PAUSED, through the official Meta Ads CLI (`meta ads …`), with media
 * uploaded via the Graph API first (the CLI's shortcut flags cannot combine a
 * file upload with a raw object_story_spec, and BOOK_NOW is only reachable
 * through object_story_spec).
 *
 *   node scripts/launch.mjs spec     <spec.yaml>            resolve + print the GO table, write scratch/<name>.build.json
 *   node scripts/launch.mjs build    <spec.yaml> [--dry-run] create everything PAUSED (needs GO #1); ids → build.json + campaigns/ledger.yaml
 *   node scripts/launch.mjs verify   <spec.yaml>            read back every created object and compare with the spec
 *   node scripts/launch.mjs activate <spec.yaml>            ads → ad sets → campaign ACTIVE (needs GO #2)
 *   node scripts/launch.mjs pause    <spec.yaml>            campaign PAUSED
 *
 * Reads: settings/*.yaml, creatives/*\/manifest.json, copy/<concept>/<lang>.yaml, .env.
 * Writes: scratch/<name>.build.json, campaigns/ledger.yaml, and Meta (build/activate/pause only).
 *
 * Spec shape (campaigns/specs/README.md has the full reference):
 *   number: 1            camptype: test      budget: {type: cbo, daily_pln: 150}
 *   optgoal: ic          geo: wola10km       lang: ua        concept: crazy      date: 2026-10-15
 *   destination: site-ua (optional; default_by_lang)        placements: advantage|ig-only|ig-reels-stories
 *   adsets:
 *     - audience: broad
 *       creatives: [crazy_reveal_DaxwkGBtqcU_vd_n012_v1_9x16_ua, …]   # names from manifests, or a glob "crazy_*_ua"
 *       copy: {headline: h01, primary: p03, description: d01}          # ids from copy/<concept>/<lang>.yaml
 *       cta: BOOK_NOW (optional)   daily_pln: 75 (abo only)   placements: (optional override)
 */

import {existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync} from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import {rel, need, opt, bareAccountId} from './lib/env.mjs';
import {audiences, funnels, defaults, concepts, allCreatives, copyFor} from './lib/config.mjs';
import {campaignName, adsetName, parseCreativeName} from './lib/naming.mjs';
import {graphGet, graphPost, graphUpload, fmtError} from './lib/graph.mjs';
import {meta, createdId} from './lib/meta-cli.mjs';
import {table} from './lib/table.mjs';

const [cmd, specFile, ...rest] = process.argv.slice(2);
const dryRun = rest.includes('--dry-run');
if (!cmd || !specFile) usage();
const spec = YAML.parse(readFileSync(specFile, 'utf8'));
const specName = path.basename(specFile).replace(/\.ya?ml$/, '');
const buildFile = rel('scratch', `${specName}.build.json`);
mkdirSync(rel('scratch'), {recursive: true});

const A = audiences(), F = funnels(), D = defaults(), C = concepts();

({spec: doSpec, build: doBuild, verify: doVerify, activate: doActivate, pause: doPause}[cmd] || usage)();

/* ----------------------------------------------------------------------- */

function resolve() {
  const errors = [];
  const fail = (m) => errors.push(m);
  const date = spec.date || new Date().toISOString().slice(0, 10);
  const budgetType = spec.budget && spec.budget.type;
  if (!['cbo', 'abo'].includes(budgetType)) fail('budget.type must be cbo or abo');
  const og = F.optgoals[spec.optgoal];
  if (!og) fail(`optgoal "${spec.optgoal}" not in settings/funnels.yaml → optgoals`);
  const geo = A.geo[spec.geo];
  if (!geo) fail(`geo "${spec.geo}" not in settings/audiences.yaml → geo`);
  const lang = A.languages[spec.lang];
  if (!lang) fail(`lang "${spec.lang}" not in settings/audiences.yaml → languages`);
  if (!C.concepts[spec.concept]) fail(`concept "${spec.concept}" not in settings/concepts.yaml`);
  const destKey = spec.destination || F.default_by_lang[spec.lang];
  const dest = F.destinations[destKey];
  if (!dest) fail(`destination "${destKey}" not in settings/funnels.yaml`);
  const pixel = opt('META_PIXEL_ID');
  if (og && og.event && !pixel) fail('META_PIXEL_ID missing in .env but optgoal needs a pixel event');
  const pageId = opt('META_PAGE_ID');
  if (!pageId) fail('META_PAGE_ID missing in .env — run: mise run verify');
  const igId = opt('META_INSTAGRAM_ACTOR_ID');

  const limits = D.daily_budget_pln;
  const campaignDaily = budgetType === 'cbo' ? Number(spec.budget.daily_pln) : null;
  if (budgetType === 'cbo' && !(campaignDaily >= limits.min && campaignDaily <= limits.max)) fail(`campaign daily_pln ${campaignDaily} outside ${limits.min}–${limits.max}`);

  let name = null;
  try {
    name = campaignName({number: spec.number, camptype: spec.camptype, budget: budgetType, optgoal: spec.optgoal, geo: spec.geo, lang: spec.lang, concept: spec.concept, date, comment: spec.comment});
  } catch (e) { fail(e.message); }

  const pool = allCreatives();
  const adsets = (spec.adsets || []).map((as, i) => {
    const aud = A.audiences[as.audience];
    if (!aud) fail(`adset ${i + 1}: audience "${as.audience}" not in settings/audiences.yaml`);
    const creatives = pickCreatives(pool, as.creatives, fail, i + 1);
    for (const c of creatives) {
      const parsed = parseCreativeName(c.name);
      if (!parsed) fail(`adset ${i + 1}: creative "${c.name}" does not follow the naming law`);
      else if (!langMatches(parsed.lang, spec.lang)) fail(`adset ${i + 1}: creative ${c.name} is ${parsed.lang} but the campaign lang is ${spec.lang}`);
      if (c.status && !['approved', 'live'].includes(c.status)) fail(`adset ${i + 1}: creative ${c.name} has status "${c.status}" (needs approved)`);
      if (!existsSync(c.path)) fail(`adset ${i + 1}: file missing ${c.path}`);
    }
    const copy = resolveCopy(spec.concept, spec.lang, as.copy, fail, i + 1);
    const type = creatives.every((c) => c.type === 'vd') ? 'vd' : creatives.every((c) => c.type === 'st') ? 'st' : 'cr';
    let asName = null;
    try {
      asName = adsetName({audience: as.audience, geo: spec.geo, lang: spec.lang, concept: spec.concept, type, count: creatives.length, date, comment: as.comment});
    } catch (e) { fail(e.message); }
    const daily = budgetType === 'abo' ? Number(as.daily_pln) : null;
    if (budgetType === 'abo' && !(daily >= limits.min / 2 && daily <= limits.max)) fail(`adset ${i + 1}: daily_pln ${daily} outside ${limits.min / 2}–${limits.max}`);
    const placements = D.placement_presets[as.placements || spec.placements || D.placements];
    if ((as.placements || spec.placements) && placements === undefined) fail(`placements "${as.placements || spec.placements}" unknown`);
    const targeting = aud ? buildTargeting(geo, lang, aud, placements, as) : null;
    if (aud && aud.custom_audiences && !(as.custom_audience_ids && as.custom_audience_ids.length)) fail(`adset ${i + 1}: audience "${as.audience}" needs custom_audience_ids in the spec (create the audiences in Ads Manager first)`);
    return {name: asName, audience: as.audience, daily_pln: daily, creatives, copy, cta: as.cta || D.cta_by_optgoal[spec.optgoal] || D.cta_default, targeting, placements: as.placements || spec.placements || D.placements};
  });
  if (!adsets.length) fail('spec has no adsets');

  return {
    errors, name, date, budgetType, campaignDaily, og, geo, lang, dest, destKey, pixel, pageId, igId, adsets,
    objective: og && og.objective, account: need('AD_ACCOUNT_ID'), utm: F.utm, dsa: F.dsa,
    bid: spec.bid_strategy || D.bid_strategy, status: D.status,
  };
}

function langMatches(creativeLang, campaignLang) {
  if (campaignLang === 'multi') return true;
  if (campaignLang === 'uaru') return creativeLang === 'ua' || creativeLang === 'ru';
  return creativeLang === campaignLang;
}

function pickCreatives(pool, wanted, fail, n) {
  if (!wanted || !wanted.length) { fail(`adset ${n}: no creatives listed`); return []; }
  const out = [];
  for (const w of wanted) {
    if (w.includes('*')) {
      const re = new RegExp('^' + w.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
      const hits = pool.filter((c) => re.test(c.name));
      if (!hits.length) fail(`adset ${n}: pattern "${w}" matched no creative in creatives/*/manifest.json`);
      out.push(...hits);
    } else {
      const hit = pool.find((c) => c.name === w);
      if (!hit) fail(`adset ${n}: creative "${w}" not found in any creatives/*/manifest.json`);
      else out.push(hit);
    }
  }
  const seen = new Set();
  return out.filter((c) => (seen.has(c.name) ? false : (seen.add(c.name), true)));
}

function resolveCopy(concept, lang, ref, fail, n) {
  const copyLang = lang === 'uaru' || lang === 'multi' ? 'ua' : lang;
  const book = copyFor(concept, copyLang);
  if (!book) { fail(`adset ${n}: no copy file copy/${concept}/${copyLang}.yaml`); return null; }
  if (!ref) { fail(`adset ${n}: copy ids missing (headline/primary/description)`); return null; }
  const get = (section, id) => {
    const v = book[section] && book[section][id];
    if (!v) fail(`adset ${n}: copy/${concept}/${copyLang}.yaml has no ${section}.${id}`);
    return v;
  };
  return {headline: get('headlines', ref.headline), primary: get('primaries', ref.primary), description: ref.description ? get('descriptions', ref.description) : '', ids: ref, file: `copy/${concept}/${copyLang}.yaml`};
}

function buildTargeting(geo, lang, aud, placements, as) {
  const t = {age_min: aud.age[0], age_max: aud.age[1]};
  if (aud.genders && aud.genders.length) t.genders = aud.genders;
  if (geo.type === 'radius') {
    t.geo_locations = {custom_locations: [{latitude: geo.lat, longitude: geo.lng, radius: geo.km, distance_unit: 'kilometer'}], location_types: A.location_types};
  } else {
    t.geo_locations = {cities: [{key: String(geo.key), radius: 0, distance_unit: 'kilometer'}], location_types: A.location_types};
  }
  if (lang.locales && lang.locales.length) t.locales = lang.locales;
  if (aud.interests && aud.interests.length) t.flexible_spec = [{interests: aud.interests.map((id) => ({id: String(id)}))}];
  if (as.custom_audience_ids && as.custom_audience_ids.length) t.custom_audiences = as.custom_audience_ids.map((id) => ({id: String(id)}));
  t.targeting_automation = {advantage_audience: aud.advantage ? 1 : 0};
  if (placements) Object.assign(t, placements);
  return t;
}

/* ----------------------------------------------------------------------- */

function doSpec() {
  const r = resolve();
  printSpec(r);
  if (r.errors.length) {
    console.log('\nREFUSED — fix the spec:');
    for (const e of r.errors) console.log(`  - ${e}`);
    process.exit(2);
  }
  writeFileSync(buildFile, JSON.stringify({spec: specName, resolved: r, created: {}, stage: 'spec', at: new Date().toISOString()}, null, 2));
  console.log(`\nspec ok → ${path.relative(rel(), buildFile)}\nNext: present this table, get an explicit GO, then: node scripts/launch.mjs build ${specFile}`);
}

function printSpec(r) {
  console.log(`campaign   ${r.name || '(invalid)'}`);
  console.log(`account    ${r.account} · page ${r.pageId || '?'} · ig ${r.igId || '-'} · pixel ${r.pixel || '-'}`);
  console.log(`objective  ${r.objective} · ${r.og ? r.og.optimization_goal : '?'}${r.og && r.og.event ? ` on ${r.og.event}` : ''} · bid ${r.bid} · budget ${r.budgetType}${r.campaignDaily ? ` ${r.campaignDaily} PLN/day` : ''}`);
  console.log(`destination ${r.destKey} → ${r.dest ? r.dest.url : '?'}\nurl_tags   ${r.utm}\ndsa        ${r.dsa.beneficiary} / ${r.dsa.payor} · status ${r.status}`);
  for (const as of r.adsets) {
    console.log(`\nad set     ${as.name || '(invalid)'}${as.daily_pln ? ` · ${as.daily_pln} PLN/day` : ''} · cta ${as.cta} · placements ${as.placements}`);
    console.log(`targeting  ${JSON.stringify(as.targeting)}`);
    if (as.copy) console.log(`copy       ${as.copy.file} → h:${as.copy.ids.headline} p:${as.copy.ids.primary} d:${as.copy.ids.description || '-'}\n  headline   ${as.copy.headline}\n  primary    ${as.copy.primary.replace(/\n/g, ' / ')}\n  descr      ${as.copy.description || '-'}`);
    console.log(table(['ad (creative name)', 'type', 'format', 'batch', 'file'], as.creatives.map((c) => [c.name, c.type, c.format, c.batch, c.file])));
  }
}

async function doBuild() {
  const r = resolve();
  if (r.errors.length) { printSpec(r); console.log('\nREFUSED'); r.errors.forEach((e) => console.log(`  - ${e}`)); process.exit(2); }
  const state = existsSync(buildFile) ? JSON.parse(readFileSync(buildFile, 'utf8')) : {spec: specName, created: {}};
  state.resolved = r;
  state.created = state.created || {};
  const cents = (pln) => String(Math.round(pln * D.budget_cents_per_pln));
  const save = () => writeFileSync(buildFile, JSON.stringify({...state, at: new Date().toISOString()}, null, 2));
  const die = (m) => { save(); console.error(`\nSTOPPED: ${m}\nState is in ${path.relative(rel(), buildFile)} — re-run build to resume the missing pieces.`); process.exit(1); };

  // campaign
  if (!state.created.campaign) {
    const args = ['campaign', 'create', '--name', r.name, '--objective', r.objective, '--status', 'PAUSED'];
    if (r.budgetType === 'cbo') args.push('--daily-budget', cents(r.campaignDaily), '--bid-strategy', r.bid);
    const res = meta(args, {dryRun});
    if (!dryRun) {
      const id = res.ok && createdId(res);
      if (!id) die(`campaign create failed: ${res.stderr || res.stdout}`);
      state.created.campaign = {id, name: r.name};
      save();
    }
  }
  const campaignId = dryRun ? 'CAMPAIGN_ID' : state.created.campaign.id;
  state.created.adsets = state.created.adsets || {};

  for (const as of r.adsets) {
    const entry = state.created.adsets[as.name] || (state.created.adsets[as.name] = {ads: {}, creatives: {}});
    // ad set
    if (!entry.id) {
      const tFile = rel('scratch', `${specName}.${as.name}.targeting.json`);
      writeFileSync(tFile, JSON.stringify(as.targeting));
      const args = ['adset', 'create', '--campaign-id', campaignId, '--name', as.name, '--optimization-goal', r.og.optimization_goal, '--billing-event', r.og.billing,
        '--targeting', `@${tFile}`, '--status', 'PAUSED', '--dsa-beneficiary', r.dsa.beneficiary, '--dsa-payor', r.dsa.payor];
      if (as.targeting.targeting_automation.advantage_audience) args.push('--advantage-audience'); else args.push('--no-advantage-audience');
      if (r.og.event) args.push('--pixel-id', r.pixel, '--custom-event-type', r.og.event);
      if (r.og.destination_type) args.push('--destination-type', r.og.destination_type);
      if (r.budgetType === 'abo') args.push('--daily-budget', cents(as.daily_pln), '--bid-strategy', r.bid);
      const res = meta(args, {dryRun});
      if (!dryRun) {
        const id = res.ok && createdId(res);
        if (!id) die(`adset create failed for ${as.name}: ${res.stderr || res.stdout}`);
        entry.id = id;
        save();
      }
    }
    const adsetId = dryRun ? 'ADSET_ID' : entry.id;

    for (const c of as.creatives) {
      // media upload (Graph)
      if (!entry.creatives[c.name]) entry.creatives[c.name] = {};
      const cr = entry.creatives[c.name];
      if (!cr.media) {
        if (dryRun) {
          console.error(`# upload ${c.type === 'vd' ? 'advideos' : 'adimages'} ← ${path.relative(rel(), c.path)}`);
        } else {
          cr.media = await uploadMedia(c, r.account).catch((e) => die(`upload failed for ${c.name}: ${e.message}`));
          save();
        }
      }
      // creative (CLI, raw object_story_spec)
      if (!cr.creativeId) {
        const oss = objectStorySpec(r, as, c, cr.media || {});
        const ossFile = rel('scratch', `${specName}.${c.name}.oss.json`);
        writeFileSync(ossFile, JSON.stringify(oss));
        const res = meta(['creative', 'create', '--name', c.name, '--object-story-spec', `@${ossFile}`, '--url-tags', r.utm], {dryRun});
        if (!dryRun) {
          const id = res.ok && createdId(res);
          if (!id) die(`creative create failed for ${c.name}: ${res.stderr || res.stdout}`);
          cr.creativeId = id;
          save();
        }
      }
      // ad (CLI)
      if (!entry.ads[c.name]) {
        const args = ['ad', 'create', '--adset-id', adsetId, '--name', c.name, '--creative-id', dryRun ? 'CREATIVE_ID' : cr.creativeId, '--status', 'PAUSED'];
        if (r.og.conversion_domain) args.push('--conversion-domain', r.og.conversion_domain);
        if (r.pixel) args.push('--pixel-id', r.pixel);
        const res = meta(args, {dryRun});
        if (!dryRun) {
          const id = res.ok && createdId(res);
          if (!id) die(`ad create failed for ${c.name}: ${res.stderr || res.stdout}`);
          entry.ads[c.name] = {id};
          save();
        }
      }
    }
  }
  if (dryRun) { console.log('\ndry run — nothing was created'); return; }
  state.stage = 'built';
  save();
  ledger(`built`, r, state);
  console.log(`\nbuilt PAUSED: campaign ${state.created.campaign.id} · ${Object.keys(state.created.adsets).length} ad sets · ${Object.values(state.created.adsets).reduce((n, a) => n + Object.keys(a.ads).length, 0)} ads`);
  console.log(`Next: node scripts/launch.mjs verify ${specFile}; then present and get a second GO before activate.`);
}

async function uploadMedia(c, account) {
  const buf = readFileSync(c.path);
  const ext = path.extname(c.path).slice(1).toLowerCase();
  if (c.type === 'vd') {
    const up = await graphUpload(`${account}/advideos`, buf, `${c.name}.${ext || 'mp4'}`, 'video/mp4');
    if (up.error) throw new Error(fmtError(up.error));
    const videoId = up.data.id;
    for (let i = 0; i < 60; i++) {
      const st = await graphGet(videoId, {fields: 'status'});
      const s = st.data && st.data.status && st.data.status.video_status;
      if (s === 'ready') break;
      if (s === 'error') throw new Error(`video ${videoId} failed processing`);
      await new Promise((res) => setTimeout(res, 6000));
    }
    const th = await graphGet(`${videoId}/thumbnails`, {});
    const thumbs = (th.data && th.data.data) || [];
    const pick = thumbs.find((t) => t.is_preferred) || thumbs[0];
    return {videoId, thumbnailUrl: pick ? pick.uri : null};
  }
  const mime = {png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp'}[ext] || 'image/jpeg';
  const up = await graphUpload(`${account}/adimages`, buf, `${c.name}.${ext || 'jpg'}`, mime);
  if (up.error) throw new Error(fmtError(up.error));
  const key = Object.keys(up.data.images)[0];
  return {imageHash: up.data.images[key].hash};
}

function objectStorySpec(r, as, c, media) {
  const link = r.dest.url;
  const cta = {type: as.cta, value: {link}};
  const oss = {page_id: r.pageId};
  if (r.igId) oss.instagram_user_id = r.igId;
  if (c.type === 'vd') {
    oss.video_data = {video_id: media.videoId || 'VIDEO_ID', title: as.copy.headline, message: as.copy.primary, link_description: as.copy.description || undefined, call_to_action: cta};
    if (media.thumbnailUrl) oss.video_data.image_url = media.thumbnailUrl;
  } else {
    oss.link_data = {image_hash: media.imageHash || 'IMAGE_HASH', link, name: as.copy.headline, message: as.copy.primary, description: as.copy.description || undefined, call_to_action: cta};
  }
  return oss;
}

async function doVerify() {
  const state = JSON.parse(readFileSync(buildFile, 'utf8'));
  const r = state.resolved;
  let bad = 0;
  const camp = await graphGet(state.created.campaign.id, {fields: 'name,status,effective_status,objective,daily_budget,bid_strategy'});
  if (camp.error) { console.log(`campaign: ${fmtError(camp.error)}`); bad++; } else {
    console.log(`campaign ${camp.data.id} ${camp.data.name} · ${camp.data.status}/${camp.data.effective_status} · ${camp.data.objective} · daily ${camp.data.daily_budget || '-'} · ${camp.data.bid_strategy || '-'}`);
    if (camp.data.name !== r.name) { console.log(`  name mismatch: expected ${r.name}`); bad++; }
  }
  for (const [name, as] of Object.entries(state.created.adsets)) {
    const d = await graphGet(as.id, {fields: 'name,status,effective_status,optimization_goal,billing_event,daily_budget,promoted_object,targeting,dsa_beneficiary,dsa_payor'});
    if (d.error) { console.log(`adset ${name}: ${fmtError(d.error)}`); bad++; continue; }
    const t = d.data.targeting || {};
    console.log(`\nad set ${as.id} ${d.data.name} · ${d.data.status} · ${d.data.optimization_goal} · promoted ${JSON.stringify(d.data.promoted_object || {})}`);
    console.log(`  geo ${JSON.stringify(t.geo_locations)} · locales ${JSON.stringify(t.locales || [])} · age ${t.age_min}-${t.age_max} · genders ${JSON.stringify(t.genders || [])} · adv+ ${t.targeting_automation ? t.targeting_automation.advantage_audience : '?'} · dsa ${d.data.dsa_beneficiary}/${d.data.dsa_payor}`);
    const ads = await graphGet(`${as.id}/ads`, {fields: 'id,name,status,effective_status,creative{id,name,object_story_spec,url_tags}', limit: 100});
    for (const ad of (ads.data && ads.data.data) || []) {
      const oss = ad.creative && ad.creative.object_story_spec || {};
      const cta = (oss.video_data || oss.link_data || {}).call_to_action;
      console.log(`  ad ${ad.id} ${ad.name} · ${ad.status} · cta ${cta ? cta.type : '?'} → ${cta && cta.value ? cta.value.link : '?'} · url_tags ${ad.creative.url_tags ? 'set' : 'MISSING'}`);
      if (!ad.creative.url_tags) bad++;
      if (!as.ads[ad.name]) { console.log(`    not in build.json — created by someone else?`); bad++; }
    }
    const expected = Object.keys(as.ads).length;
    const got = ((ads.data && ads.data.data) || []).length;
    if (expected !== got) { console.log(`  expected ${expected} ads, found ${got}`); bad++; }
  }
  console.log(bad ? `\n${bad} problem(s) — do not activate` : '\nverified — matches the spec; a second GO is needed to activate');
  process.exit(bad ? 1 : 0);
}

async function doActivate() {
  const state = JSON.parse(readFileSync(buildFile, 'utf8'));
  for (const [name, as] of Object.entries(state.created.adsets)) {
    for (const [adName, ad] of Object.entries(as.ads)) {
      const res = meta(['ad', 'update', ad.id, '--status', 'ACTIVE'], {dryRun});
      if (!dryRun && !res.ok) { console.error(`ad ${adName} activate failed: ${res.stderr || res.stdout}`); process.exit(1); }
    }
    const res = meta(['adset', 'update', as.id, '--status', 'ACTIVE'], {dryRun});
    if (!dryRun && !res.ok) { console.error(`adset ${name} activate failed: ${res.stderr || res.stdout}`); process.exit(1); }
  }
  const res = meta(['campaign', 'update', state.created.campaign.id, '--status', 'ACTIVE'], {dryRun});
  if (!dryRun && !res.ok) { console.error(`campaign activate failed: ${res.stderr || res.stdout}`); process.exit(1); }
  if (dryRun) return;
  state.stage = 'active';
  writeFileSync(buildFile, JSON.stringify({...state, at: new Date().toISOString()}, null, 2));
  ledger('activated', state.resolved, state);
  console.log(`ACTIVE: campaign ${state.created.campaign.id} ${state.resolved.name}`);
}

async function doPause() {
  const state = JSON.parse(readFileSync(buildFile, 'utf8'));
  const res = meta(['campaign', 'update', state.created.campaign.id, '--status', 'PAUSED'], {dryRun});
  if (!dryRun && !res.ok) { console.error(`pause failed: ${res.stderr || res.stdout}`); process.exit(1); }
  if (dryRun) return;
  state.stage = 'paused';
  writeFileSync(buildFile, JSON.stringify({...state, at: new Date().toISOString()}, null, 2));
  ledger('paused', state.resolved, state);
  console.log(`PAUSED: campaign ${state.created.campaign.id}`);
}

function ledger(event, r, state) {
  const file = rel('campaigns', 'ledger.yaml');
  const entry = {
    at: new Date().toISOString(), event, spec: specName, campaign: {id: state.created.campaign.id, name: r.name},
    adsets: Object.fromEntries(Object.entries(state.created.adsets).map(([n, a]) => [n, {id: a.id, ads: Object.fromEntries(Object.entries(a.ads).map(([an, ad]) => [an, ad.id]))}])),
    budget: r.budgetType === 'cbo' ? `${r.campaignDaily} PLN/day cbo` : `abo: ${r.adsets.map((a) => `${a.name} ${a.daily_pln}`).join(', ')}`,
    optgoal: `${r.og.optimization_goal}${r.og.event ? ' ' + r.og.event : ''}`, destination: r.destKey,
  };
  appendFileSync(file, `\n- ${YAML.stringify(entry).trim().replace(/\n/g, '\n  ')}\n`);
}

function usage() {
  console.log('usage: node scripts/launch.mjs <spec|build|verify|activate|pause> campaigns/specs/<name>.yaml [--dry-run]');
  process.exit(2);
}
