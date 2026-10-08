#!/usr/bin/env node
/**
 * @fileoverview Checks every tool and credential the agents need, one line
 * each. Reads .env (names only; values are never printed). Makes two
 * read-only network calls: OpenRouter key info and Graph `/me`.
 */

import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {rel, opt, metaBin, mask} from './lib/env.mjs';
import {graphGet, fmtError, GRAPH_VERSION} from './lib/graph.mjs';
import {keyInfo} from './lib/openrouter.mjs';

let bad = 0;
const ok = (name, detail) => console.log(`  ok       ${name.padEnd(14)} ${detail || ''}`);
const miss = (name, fix) => { bad++; console.log(`  MISSING  ${name.padEnd(14)} ${fix}`); };
const ver = (cmd, args) => {
  const r = spawnSync(cmd, args, {encoding: 'utf8'});
  return r.status === 0 ? (r.stdout || r.stderr).split('\n')[0].trim() : null;
};

console.log('toolchain');
const node = ver('node', ['--version']);
node ? ok('node', node) : miss('node', 'mise install');
const ffmpeg = ver('ffmpeg', ['-version']);
ffmpeg ? ok('ffmpeg', ffmpeg.split(' ').slice(0, 3).join(' ')) : miss('ffmpeg', 'dnf/apt/brew install ffmpeg');
const magick = ver('magick', ['-version']);
magick ? ok('magick', magick.split(' ').slice(0, 3).join(' ')) : miss('magick', 'install ImageMagick 7');
const lfs = ver('git', ['lfs', 'version']);
lfs ? ok('git-lfs', lfs) : miss('git-lfs', 'install git-lfs, then: git lfs install --local');
const metaV = ver(metaBin(), ['--version']);
metaV ? ok('meta', `${metaV} (${metaBin()})`) : miss('meta', 'mise run setup  (installs meta-ads into .venv)');
existsSync(rel('node_modules', 'playwright')) ? ok('playwright', 'node_modules present') : miss('playwright', 'npm install');
const pw = spawnSync('node', ['-e', "console.log(require('playwright').chromium.executablePath())"], {encoding: 'utf8', cwd: rel()});
pw.status === 0 && existsSync(pw.stdout.trim() || '/nonexistent') ? ok('chromium', 'playwright build present') : miss('chromium', 'npx playwright install chromium');

console.log('credentials (.env)');
for (const k of ['OPENROUTER_API_KEY', 'ACCESS_TOKEN', 'AD_ACCOUNT_ID', 'META_PAGE_ID', 'META_PIXEL_ID']) {
  const v = opt(k);
  v && v !== 'act_' ? ok(k, k === 'AD_ACCOUNT_ID' || k.endsWith('_ID') ? v : mask(v)) : miss(k, 'set in .env');
}
existsSync(rel('.secrets', 'ig-state.json')) ? ok('instagram', '.secrets/ig-state.json (logged-in session for ig-fetch)') : console.log('  -        instagram      no session (ig-fetch runs anonymous: latest 12 posts only; run scripts/ig-login.mjs for the full archive)');

console.log('live checks');
if (opt('OPENROUTER_API_KEY')) {
  try {
    const {ok: good, body} = await keyInfo();
    const d = body && body.data;
    good ? ok('openrouter', `key ok${d && d.limit_remaining != null ? `, remaining $${d.limit_remaining}` : ''}${d && d.usage != null ? `, used $${Number(d.usage).toFixed(2)}` : ''}`) : miss('openrouter', JSON.stringify(body).slice(0, 120));
  } catch (e) {
    miss('openrouter', e.message);
  }
}
if (opt('ACCESS_TOKEN')) {
  const {data, error} = await graphGet('me', {fields: 'id,name'});
  error ? miss('meta token', fmtError(error)) : ok('meta token', `${GRAPH_VERSION} as ${data.name || 'system user'} (${data.id})`);
  if (opt('AD_ACCOUNT_ID') && opt('AD_ACCOUNT_ID') !== 'act_') {
    const a = await graphGet(opt('AD_ACCOUNT_ID'), {fields: 'name,account_status,currency,timezone_name'});
    a.error ? miss('ad account', fmtError(a.error)) : ok('ad account', `${a.data.name} · status ${a.data.account_status} · ${a.data.currency} · ${a.data.timezone_name}`);
  }
}

console.log(bad ? `\nincomplete — fix the MISSING lines above` : `\nready — run: mise run verify`);
process.exit(bad ? 1 : 0);
