/**
 * @fileoverview Runs the official Meta Ads CLI (`meta`) with JSON output and
 * no prompts. The only place the CLI is invoked from scripts. Prints every
 * command it runs (tokens never appear on the command line — the CLI reads
 * ACCESS_TOKEN / AD_ACCOUNT_ID from the environment).
 */

import {spawnSync} from 'node:child_process';
import {metaBin} from './env.mjs';

/**
 * @param {!Array<string>} args after `meta -o json --no-input ads`
 * @param {{dryRun: (boolean|undefined), quiet: (boolean|undefined)}=} o
 * @return {{ok: boolean, json: *, stdout: string, stderr: string, cmd: string}}
 */
export function meta(args, o = {}) {
  const bin = metaBin();
  const full = ['-o', 'json', '--no-input', 'ads', ...args];
  const cmd = `${bin} ${full.map(q).join(' ')}`;
  if (!o.quiet) console.error(`$ ${cmd}`);
  if (o.dryRun) return {ok: true, json: null, stdout: '', stderr: '', cmd};
  const res = spawnSync(bin, full, {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
  const stdout = res.stdout || '';
  const stderr = res.stderr || '';
  let json = null;
  try {
    json = JSON.parse(stdout);
  } catch {
    // table/plain or an error message; leave json null
  }
  return {ok: res.status === 0, json, stdout, stderr, cmd};
}

/** The new object's id from a create result, whatever shape the CLI printed. */
export function createdId(r) {
  if (r.json && typeof r.json === 'object') {
    if (r.json.id) return String(r.json.id);
    if (r.json.data && r.json.data.id) return String(r.json.data.id);
    if (Array.isArray(r.json) && r.json[0] && r.json[0].id) return String(r.json[0].id);
  }
  const m = /\b(\d{10,20})\b/.exec(r.stdout);
  return m ? m[1] : null;
}

function q(s) {
  return /^[A-Za-z0-9_@./:=,-]+$/.test(s) ? s : `'${String(s).replace(/'/g, `'\\''`)}'`;
}
