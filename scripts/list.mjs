#!/usr/bin/env node
/**
 * @fileoverview Performance listing on a pinned attribution basis (7-day click
 * by default, from settings/funnels.yaml). One Graph insights call per level.
 * Read-only. The `meta` CLI's `insights get` cannot do per-entity rows, so
 * this uses the API directly.
 *
 *   node scripts/list.mjs [campaigns|adsets|ads|tree] [-d last7|last14|last30|yesterday|today|yyyy-mm-dd:yyyy-mm-dd]
 *                         [-f active|paused|all] [-s <name substring>] [-o spend|cpa|ic|purch] [-l 30] [-m 0] [--json]
 *
 * Columns: name · spend · impr · reach · freq · ctr% · cpc · cpm · lpv · ic · purch · cp-ic · cp-purch
 *   ic = InitiateCheckout, purch = Purchase (pixel standard events). cp-* are blended costs.
 */

import {need} from './lib/env.mjs';
import {graphGetAll, fmtError} from './lib/graph.mjs';
import {funnels} from './lib/config.mjs';
import {table} from './lib/table.mjs';

const argv = process.argv.slice(2);
const flag = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const level = ['campaigns', 'adsets', 'ads', 'tree'].includes(argv[0]) ? argv[0] : 'campaigns';
const dates = flag('-d', 'last7');
const filter = flag('-f', 'active');
const search = flag('-s', null);
const order = flag('-o', 'spend');
const limit = Number(flag('-l', 30));
const minSpend = Number(flag('-m', 0));
const asJson = argv.includes('--json');
const attr = (funnels().attribution && funnels().attribution.reporting) || '7d_click';

const account = need('AD_ACCOUNT_ID');
const presets = {today: 'today', yesterday: 'yesterday', last7: 'last_7d', last14: 'last_14d', last30: 'last_30d', last90: 'last_90d', lifetime: 'maximum'};
const timeParams = presets[dates] ? {date_preset: presets[dates]} : {time_range: {since: dates.split(':')[0], until: dates.split(':')[1] || dates.split(':')[0]}};

const FIELDS = 'campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,spend,impressions,reach,frequency,inline_link_clicks,inline_link_click_ctr,cpc,cpm,actions,cost_per_action_type';

async function fetchLevel(lvl) {
  const filtering = [];
  if (filter === 'active') filtering.push({field: `${lvl}.effective_status`, operator: 'IN', value: ['ACTIVE']});
  if (filter === 'paused') filtering.push({field: `${lvl}.effective_status`, operator: 'IN', value: ['PAUSED', 'CAMPAIGN_PAUSED', 'ADSET_PAUSED']});
  const {rows, error} = await graphGetAll(`${account}/insights`, {
    level: lvl, fields: FIELDS, ...timeParams, action_attribution_windows: [attr],
    filtering: filtering.length ? filtering : undefined, limit: 500,
  });
  if (error) { console.error(`insights ${lvl}: ${fmtError(error)}`); process.exit(1); }
  return rows.map((r) => shape(r, lvl));
}

function act(row, types) {
  const list = row.actions || [];
  for (const t of types) {
    const hit = list.find((a) => a.action_type === t);
    if (hit) return Number(hit[attr] ?? hit.value) || 0;
  }
  return 0;
}

function shape(r, lvl) {
  const name = lvl === 'campaign' ? r.campaign_name : lvl === 'adset' ? r.adset_name : r.ad_name;
  const id = lvl === 'campaign' ? r.campaign_id : lvl === 'adset' ? r.adset_id : r.ad_id;
  const spend = Number(r.spend) || 0;
  const purch = act(r, ['purchase', 'offsite_conversion.fb_pixel_purchase', 'omni_purchase']);
  const ic = act(r, ['initiate_checkout', 'offsite_conversion.fb_pixel_initiate_checkout', 'omni_initiated_checkout']);
  const lpv = act(r, ['landing_page_view']);
  return {
    id, name, spend, impr: Number(r.impressions) || 0, reach: Number(r.reach) || 0, freq: Number(r.frequency) || 0,
    ctr: Number(r.inline_link_click_ctr) || 0, cpc: Number(r.cpc) || 0, cpm: Number(r.cpm) || 0,
    lpv, ic, purch, cpIc: ic ? spend / ic : null, cpPurch: purch ? spend / purch : null,
  };
}

function render(title, rows) {
  let list = rows.filter((r) => r.spend >= minSpend && (!search || r.name.toLowerCase().includes(search.toLowerCase())));
  const key = {spend: (r) => -r.spend, cpa: (r) => r.cpPurch ?? Infinity, purch: (r) => -r.purch, ic: (r) => -r.ic}[order] || ((r) => -r.spend);
  list.sort((a, b) => key(a) - key(b));
  list = list.slice(0, limit);
  const tot = list.reduce((t, r) => ({spend: t.spend + r.spend, impr: t.impr + r.impr, lpv: t.lpv + r.lpv, ic: t.ic + r.ic, purch: t.purch + r.purch, clicks: t.clicks + r.spend / (r.cpc || Infinity)}), {spend: 0, impr: 0, lpv: 0, ic: 0, purch: 0, clicks: 0});
  console.log(`\n${title} — ${list.length} rows · dates ${dates} · filter ${filter} · attribution ${attr}`);
  const cols = ['name', 'spend', 'impr', 'reach', 'freq', 'ctr%', 'cpc', 'cpm', 'lpv', 'ic', 'purch', 'cp-ic', 'cp-purch'];
  const body = list.map((r) => [r.name, r.spend, r.impr, r.reach, r.freq, r.ctr, r.cpc, r.cpm, r.lpv, r.ic, r.purch, r.cpIc, r.cpPurch]);
  body.push(['TOTAL (blended)', tot.spend, tot.impr, null, null, null, null, null, tot.lpv, tot.ic, tot.purch, tot.ic ? tot.spend / tot.ic : null, tot.purch ? tot.spend / tot.purch : null]);
  console.log(table(cols, body));
  return list;
}

const want = level === 'tree' ? ['campaign', 'adset', 'ad'] : [{campaigns: 'campaign', adsets: 'adset', ads: 'ad'}[level]];
const result = {};
for (const lvl of want) result[lvl] = await fetchLevel(lvl);
if (asJson) { console.log(JSON.stringify({basis: {dates, filter, attribution: attr, account}, ...result}, null, 2)); process.exit(0); }
console.log(`account ${account} · currency per account settings · numbers from Graph insights (${attr})`);
for (const lvl of want) render(lvl, result[lvl]);
console.log('\nLow volume warning: fewer than ~10 events on a row means its cost-per numbers are noise, not a verdict.');
