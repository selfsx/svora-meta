#!/usr/bin/env node
/**
 * @fileoverview Account readiness, read-only: token identity, ad account
 * state, pages + Instagram identity, pixels and their last fire, and the
 * targeting keys the settings rely on (locales, Warsaw city key, interests).
 * Prints what to pin in .env. Never writes to Meta.
 *
 *   node scripts/verify.mjs [--json]
 */

import {opt, need} from './lib/env.mjs';
import {graphGet, graphGetAll, fmtError} from './lib/graph.mjs';
import {audiences} from './lib/config.mjs';
import {table} from './lib/table.mjs';

const asJson = process.argv.includes('--json');
const out = {ok: true, problems: [], pin: {}};
const problem = (s) => { out.ok = false; out.problems.push(s); };

need('ACCESS_TOKEN');
const account = need('AD_ACCOUNT_ID');

// 1. token
const me = await graphGet('me', {fields: 'id,name'});
if (me.error) { problem(`token: ${fmtError(me.error)}`); finish(); }
out.me = me.data;

// 2. account
const acc = await graphGet(account, {fields: 'id,name,account_status,disable_reason,currency,timezone_name,amount_spent,spend_cap,business,funding_source_details,min_daily_budget'});
if (acc.error) { problem(`account ${account}: ${fmtError(acc.error)}`); finish(); }
out.account = acc.data;
const STATUS = {1: 'ACTIVE', 2: 'DISABLED', 3: 'UNSETTLED', 7: 'PENDING_RISK_REVIEW', 8: 'PENDING_SETTLEMENT', 9: 'IN_GRACE_PERIOD', 100: 'PENDING_CLOSURE', 101: 'CLOSED', 201: 'ANY_ACTIVE', 202: 'ANY_CLOSED'};
if (acc.data.account_status !== 1) problem(`account status ${STATUS[acc.data.account_status] || acc.data.account_status} (disable_reason ${acc.data.disable_reason})`);
if (acc.data.currency !== 'PLN') out.problems.push(`note: account currency is ${acc.data.currency}, budgets in settings are PLN`);

// 3. pages reachable by this token + instagram identity
const pages = await graphGetAll('me/accounts', {fields: 'id,name,instagram_business_account{id,username},is_published'});
out.pages = pages.rows;
if (pages.error) problem(`pages: ${fmtError(pages.error)}`);
if (!pages.rows.length) problem('no Page reachable by this token — add the Page to the system user in Business Settings');
const promote = await graphGetAll(`${account}/promote_pages`, {fields: 'id,name'});
out.promote_pages = promote.rows;

// 4. pixels
const pixels = await graphGetAll(`${account}/adspixels`, {fields: 'id,name,last_fired_time,is_unavailable'});
out.pixels = pixels.rows;
if (pixels.error) problem(`pixels: ${fmtError(pixels.error)}`);
const wanted = opt('META_PIXEL_ID');
if (wanted && !pixels.rows.some((p) => p.id === wanted)) problem(`pixel ${wanted} is not connected to ${account} (connect it in Events Manager > Settings, or Business Settings > Data sources)`);

// 5. targeting keys the settings assume
const a = audiences();
const localeChecks = [['Ukrainian', 52], ['Russian', 17], ['Polish', 15], ['English (UK)', 24], ['English (US)', 6]];
out.locales = [];
for (const [name, expect] of localeChecks) {
  const r = await graphGet('search', {type: 'adlocale', q: name.split(' ')[0], limit: 10});
  const hit = r.data && r.data.data.find((x) => x.name.toLowerCase().startsWith(name.toLowerCase()));
  out.locales.push({name, expected: expect, actual: hit ? hit.key : null});
  if (hit && Number(hit.key) !== expect) problem(`locale ${name}: Meta key ${hit.key} ≠ settings/audiences.yaml ${expect}`);
}
const city = await graphGet('search', {type: 'adgeolocation', q: 'Warsaw', location_types: ['city'], limit: 5});
const warsaw = city.data && city.data.data.find((x) => x.country_code === 'PL');
out.warsaw = warsaw || null;
if (warsaw && a.geo.warsaw && String(warsaw.key) !== String(a.geo.warsaw.key)) problem(`Warsaw city key ${warsaw.key} ≠ settings ${a.geo.warsaw.key}`);
out.interests = [];
for (const q of ['Nail art', 'Manicure']) {
  const r = await graphGet('search', {type: 'adinterest', q, limit: 3});
  out.interests.push(...((r.data && r.data.data) || []).slice(0, 2).map((x) => ({q, id: x.id, name: x.name, audience: x.audience_size_upper_bound})));
}

// what to pin
const page = pages.rows[0];
if (page) {
  out.pin.META_PAGE_ID = page.id;
  if (page.instagram_business_account) out.pin.META_INSTAGRAM_ACTOR_ID = page.instagram_business_account.id;
}
if (!wanted && pixels.rows[0]) out.pin.META_PIXEL_ID = pixels.rows[0].id;
if (opt('META_PAGE_ID') && !pages.rows.some((p) => p.id === opt('META_PAGE_ID'))) problem(`META_PAGE_ID ${opt('META_PAGE_ID')} is not among the pages this token reaches`);

finish();

function finish() {
  if (asJson) { console.log(JSON.stringify(out, null, 2)); process.exit(out.ok ? 0 : 1); }
  if (out.me) console.log(`token       ${out.me.name || 'system user'} (${out.me.id})`);
  if (out.account) {
    const d = out.account;
    console.log(`account     ${d.name} ${d.id} · ${STATUS[d.account_status] || d.account_status} · ${d.currency} · ${d.timezone_name} · spent ${d.amount_spent}`);
  }
  if (out.pages) {
    console.log('\npages');
    console.log(table(['id', 'name', 'instagram', 'published'], out.pages.map((p) => [p.id, p.name, p.instagram_business_account ? `@${p.instagram_business_account.username} (${p.instagram_business_account.id})` : '-', String(p.is_published)])));
  }
  if (out.pixels) {
    console.log('\npixels');
    console.log(table(['id', 'name', 'last fired', 'unavailable'], out.pixels.map((p) => [p.id, p.name, p.last_fired_time || 'never', String(!!p.is_unavailable)])));
  }
  if (out.locales) {
    console.log('\ntargeting keys');
    console.log(table(['locale', 'settings', 'meta'], out.locales.map((l) => [l.name, l.expected, l.actual ?? '?'])));
    if (out.warsaw) console.log(`Warsaw city key: ${out.warsaw.key} (${out.warsaw.name}, ${out.warsaw.region})`);
    if (out.interests.length) console.log(table(['interest query', 'id', 'name', 'audience ≤'], out.interests.map((i) => [i.q, i.id, i.name, i.audience])));
  }
  if (Object.keys(out.pin).length) {
    console.log('\npin in .env:');
    for (const [k, v] of Object.entries(out.pin)) console.log(`  ${k}=${v}`);
  }
  if (out.problems.length) {
    console.log('\nproblems');
    for (const p of out.problems) console.log(`  - ${p}`);
  }
  console.log(out.ok ? '\nlaunchable — nothing blocks a build' : '\nNOT launchable until the problems above are fixed');
  process.exit(out.ok ? 0 : 1);
}
