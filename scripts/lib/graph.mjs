/**
 * @fileoverview Marketing API (Graph) client: reads, paged reads, multipart
 * uploads and plain POSTs. Every write in this repo that is not a `meta` CLI
 * call goes through `graphPost`/`graphUpload` — nowhere else.
 *
 * Errors are returned, not thrown, so callers can quote Meta's message verbatim.
 * Throttles (codes 4, 17, 32, 613, 80004) are retried once after a backoff.
 */

import {need} from './env.mjs';

export const GRAPH_VERSION = 'v24.0';
export const BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;
const THROTTLE = new Set([4, 17, 32, 613, 80004]);
const BACKOFF_MS = 60_000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * @param {string} edge e.g. `act_123/campaigns` or `123456`
 * @param {!Object<string, *>} params query params; objects/arrays are JSON-encoded
 * @param {{token: (string|undefined)}=} opts
 * @return {!Promise<{data: ?Object, error: ?Object}>}
 */
export async function graphGet(edge, params = {}, opts = {}) {
  const token = opts.token || need('ACCESS_TOKEN');
  const url = new URL(`${BASE}/${edge}`);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    url.searchParams.set(k, typeof v === 'string' ? v : JSON.stringify(v));
  }
  url.searchParams.set('access_token', token);
  return withRetry(async () => {
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json.error) return {data: null, error: json.error};
      return {data: json, error: null};
    } catch (e) {
      return {data: null, error: {message: e.message}};
    }
  });
}

/**
 * Follows `paging.next` until exhausted or `max` rows.
 * @return {!Promise<{rows: !Array, error: ?Object}>}
 */
export async function graphGetAll(edge, params = {}, max = 2000) {
  const rows = [];
  let {data, error} = await graphGet(edge, {limit: 200, ...params});
  while (!error && data) {
    rows.push(...(data.data || []));
    const next = data.paging && data.paging.next;
    if (!next || rows.length >= max) break;
    try {
      const res = await fetch(next);
      data = await res.json();
      if (data.error) error = data.error;
    } catch (e) {
      error = {message: e.message};
    }
  }
  return {rows, error};
}

/**
 * Form-encoded POST (create/update). Objects are JSON-encoded.
 * @return {!Promise<{data: ?Object, error: ?Object}>}
 */
export async function graphPost(edge, params = {}) {
  const token = need('ACCESS_TOKEN');
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    body.set(k, typeof v === 'string' ? v : JSON.stringify(v));
  }
  body.set('access_token', token);
  return withRetry(async () => {
    try {
      const res = await fetch(`${BASE}/${edge}`, {method: 'POST', body});
      const json = await res.json();
      if (json.error) return {data: null, error: json.error};
      return {data: json, error: null};
    } catch (e) {
      return {data: null, error: {message: e.message}};
    }
  });
}

/**
 * Multipart upload (`adimages`, `advideos`). `file` is a Buffer; `filename`
 * must carry the real extension — Meta infers the type from it.
 */
export async function graphUpload(edge, file, filename, mime, extra = {}) {
  const token = need('ACCESS_TOKEN');
  const form = new FormData();
  form.append('source', new Blob([file], {type: mime}), filename);
  for (const [k, v] of Object.entries(extra)) form.append(k, String(v));
  form.append('access_token', token);
  return withRetry(async () => {
    try {
      const res = await fetch(`${BASE}/${edge}`, {method: 'POST', body: form, signal: AbortSignal.timeout(15 * 60_000)});
      const json = await res.json();
      if (json.error) return {data: null, error: json.error};
      return {data: json, error: null};
    } catch (e) {
      return {data: null, error: {message: e.message}};
    }
  });
}

async function withRetry(fn) {
  const first = await fn();
  if (!first.error || !THROTTLE.has(Number(first.error.code))) return first;
  console.error(`throttled (code ${first.error.code}) — waiting ${BACKOFF_MS / 1000}s and retrying once`);
  await sleep(BACKOFF_MS);
  return fn();
}

/** Formats a Graph error for the operator: code, subcode, message, user title/msg. */
export function fmtError(err) {
  if (!err) return '';
  const parts = [];
  if (err.code !== undefined) parts.push(`code ${err.code}${err.error_subcode ? `/${err.error_subcode}` : ''}`);
  if (err.message) parts.push(err.message);
  if (err.error_user_title) parts.push(`— ${err.error_user_title}: ${err.error_user_msg || ''}`);
  return parts.join(' ');
}
