/**
 * @fileoverview Environment and paths. Reads `.env` (never prints a value),
 * resolves repo-relative paths, and exposes `need()` for required secrets.
 * Reads: .env. Writes: nothing.
 */

import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** @param {...string} parts */
export const rel = (...parts) => path.join(ROOT, ...parts);

const envFile = rel('.env');
if (existsSync(envFile)) {
  try {
    process.loadEnvFile(envFile); // does not override variables already set by mise/shell
  } catch (e) {
    console.error(`warning: could not parse .env: ${e.message}`);
  }
}

/**
 * @param {string} name
 * @return {string}
 */
export function need(name) {
  const v = process.env[name];
  if (!v || v.trim() === '' || v === 'act_') {
    throw new Error(`missing ${name} — set it in .env (see .env.example)`);
  }
  return v.trim();
}

/** @param {string} name @return {?string} */
export const opt = (name) => (process.env[name] && process.env[name].trim()) || null;

/** Masks a secret for display: first 4 + last 4 characters. */
export const mask = (s) => (s && s.length > 10 ? `${s.slice(0, 4)}…${s.slice(-4)}` : '••••');

/** `act_123` → `123`; `123` → `123`. */
export const bareAccountId = (id) => String(id).replace(/^act_/, '');

/** Path to the Meta Ads CLI: the project venv first, then PATH. */
export function metaBin() {
  const venv = rel('.venv', 'bin', 'meta');
  return existsSync(venv) ? venv : 'meta';
}
