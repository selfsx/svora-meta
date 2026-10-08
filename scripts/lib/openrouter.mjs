/**
 * @fileoverview OpenRouter client for the creative pipeline:
 *   - images: POST /api/v1/images (generation + reference-image editing)
 *   - video:  POST /api/v1/videos → poll GET /api/v1/videos/{id} → download content
 *   - chat:   POST /api/v1/chat/completions (small text jobs, e.g. translation QA)
 * Reads OPENROUTER_API_KEY. Writes files only where the caller asks.
 * Every result carries `cost` (USD) from `usage.cost` so manifests can record spend.
 */

import {readFileSync, writeFileSync} from 'node:fs';
import {need} from './env.mjs';

const API = 'https://openrouter.ai/api/v1';
const headers = () => ({
  'Authorization': `Bearer ${need('OPENROUTER_API_KEY')}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': 'https://svora.place',
  'X-Title': 'svora-meta',
});

export const MODELS = {
  // google/gemini-2.5-flash-image (the original "Nano Banana") was retired by Google on 2026-10-02.
  image_fast: 'google/gemini-3.1-flash-image',   // Nano Banana 2 — edits, background, re-light, extend canvas (~$0.07/image)
  image_pro: 'google/gemini-3-pro-image',        // Nano Banana Pro — layouts, composites, most legible text (~$0.13/image)
  image_21: 'google/gemini-nano-banana-2.1',     // Google's current default; same API shape
  video: 'bytedance/seedance-2.5',               // image-to-video, 4–30 s, 480p/720p (no 1080p, no 4:5), audio
  video_mini: 'bytedance/seedance-2.0-mini',     // cheaper drafts
  text: 'anthropic/claude-sonnet-4.5',
};

/** Reads a local image into a data URL. */
export function dataUrl(file) {
  const buf = readFileSync(file);
  const ext = file.toLowerCase().split('.').pop();
  const mime = {png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp'}[ext] || 'application/octet-stream';
  return `data:${mime};base64,${buf.toString('base64')}`;
}

/**
 * @param {{model: string, prompt: string, refs: (Array<string>|undefined), aspect: (string|undefined),
 *          resolution: (string|undefined), size: (string|undefined), n: (number|undefined)}} o
 * @return {!Promise<{images: !Array<{buffer: !Buffer, mediaType: string}>, cost: number, raw: !Object}>}
 */
export async function generateImage(o) {
  const body = {model: o.model || MODELS.image_fast, prompt: o.prompt};
  if (o.aspect) body.aspect_ratio = o.aspect;
  if (o.resolution) body.resolution = o.resolution;
  if (o.size) body.size = o.size;
  if (o.n) body.n = o.n;
  if (o.refs && o.refs.length) {
    body.input_references = o.refs.map((r) => ({type: 'image_url', image_url: {url: r.startsWith('http') || r.startsWith('data:') ? r : dataUrl(r)}}));
  }
  const res = await fetch(`${API}/images`, {method: 'POST', headers: headers(), body: JSON.stringify(body)});
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(`openrouter images: ${JSON.stringify(json.error || json)}`);
  const images = (json.data || []).map((d) => ({buffer: Buffer.from(d.b64_json, 'base64'), mediaType: d.media_type || 'image/png'}));
  return {images, cost: Number(json.usage && json.usage.cost) || 0, raw: json};
}

/** GET /api/v1/videos/models — supported durations, sizes, pricing per model. */
export async function listVideoModels() {
  const res = await fetch(`${API}/videos/models`, {headers: headers()});
  return res.json();
}

/**
 * Submit → poll → download. Resolves with the MP4 buffer.
 * @param {{model: string, prompt: string, firstFrame: (string|undefined), lastFrame: (string|undefined),
 *          refs: (Array<string>|undefined), duration: (number|undefined), size: (string|undefined),
 *          aspect: (string|undefined), resolution: (string|undefined), audio: (boolean|undefined),
 *          seed: (number|undefined), onStatus: (function(string)|undefined)}} o
 * @return {!Promise<{buffer: !Buffer, cost: number, jobId: string, raw: !Object}>}
 */
export async function generateVideo(o) {
  const body = {model: o.model || MODELS.video, prompt: o.prompt};
  if (o.duration) body.duration = o.duration;
  if (o.size) body.size = o.size;
  if (o.aspect) body.aspect_ratio = o.aspect;
  if (o.resolution) body.resolution = o.resolution;
  if (o.audio !== undefined) body.generate_audio = !!o.audio;
  if (o.seed !== undefined) body.seed = o.seed;
  const frames = [];
  if (o.firstFrame) frames.push({type: 'image_url', image_url: {url: toUrl(o.firstFrame)}, frame_type: 'first_frame'});
  if (o.lastFrame) frames.push({type: 'image_url', image_url: {url: toUrl(o.lastFrame)}, frame_type: 'last_frame'});
  if (frames.length) body.frame_images = frames;
  if (o.refs && o.refs.length) body.input_references = o.refs.map((r) => ({type: 'image_url', image_url: {url: toUrl(r)}}));

  const sub = await fetch(`${API}/videos`, {method: 'POST', headers: headers(), body: JSON.stringify(body)});
  const job = await sub.json();
  if (!sub.ok || job.error) throw new Error(`openrouter videos submit: ${JSON.stringify(job.error || job)}`);
  const jobId = job.id;
  const pollUrl = job.polling_url || `${API}/videos/${jobId}`;
  let status = job.status;
  let last = job;
  const started = Date.now();
  while (status !== 'completed') {
    if (status === 'failed' || status === 'cancelled' || status === 'expired') {
      throw new Error(`openrouter video job ${jobId} ${status}: ${JSON.stringify(last.error || last)}`);
    }
    if (Date.now() - started > 30 * 60_000) throw new Error(`openrouter video job ${jobId} timed out after 30 min`);
    await new Promise((r) => setTimeout(r, 15_000));
    const res = await fetch(pollUrl, {headers: headers()});
    last = await res.json();
    status = last.status;
    if (o.onStatus) o.onStatus(`${jobId} ${status}`);
  }
  const contentUrl = (last.unsigned_urls && last.unsigned_urls[0]) || `${API}/videos/${jobId}/content?index=0`;
  const dl = await fetch(contentUrl, {headers: headers()});
  if (!dl.ok) throw new Error(`openrouter video download HTTP ${dl.status}`);
  const buffer = Buffer.from(await dl.arrayBuffer());
  return {buffer, cost: Number(last.usage && last.usage.cost) || 0, jobId, raw: last};
}

/** Small text job. Returns the assistant text and cost. */
export async function chat(messages, o = {}) {
  const body = {model: o.model || MODELS.text, messages, temperature: o.temperature ?? 0.3, usage: {include: true}};
  const res = await fetch(`${API}/chat/completions`, {method: 'POST', headers: headers(), body: JSON.stringify(body)});
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(`openrouter chat: ${JSON.stringify(json.error || json)}`);
  return {text: json.choices[0].message.content, cost: Number(json.usage && json.usage.cost) || 0, raw: json};
}

/** GET /api/v1/auth/key — validates the key and shows limits without spending. */
export async function keyInfo() {
  const res = await fetch(`${API}/auth/key`, {headers: headers()});
  return {ok: res.ok, body: await res.json()};
}

function toUrl(x) {
  return x.startsWith('http') || x.startsWith('data:') ? x : dataUrl(x);
}

/** Writes a sidecar JSON next to a generated file: prompt, model, cost, inputs. */
export function writeSidecar(file, meta) {
  writeFileSync(`${file}.json`, JSON.stringify({...meta, created: new Date().toISOString()}, null, 2));
}
