/**
 * @fileoverview Loads the YAML in settings/ and the creative manifests.
 * Reads: settings/*.yaml, creatives/*\/manifest.json, copy/**\/*.yaml. Writes: nothing.
 *
 * Config contract (change a shape here AND in the file in the same commit):
 *   settings/brand.yaml     business, services[], colors, fonts, logos
 *   settings/audiences.yaml geo{}, languages{}, audiences{}, location_types[], vocab{}
 *   settings/funnels.yaml   destinations{}, default_by_lang{}, optgoals{}, utm, dsa, attribution
 *   settings/concepts.yaml  concepts{}, hooks{}, formats{}, types{}, langs[]
 *   settings/defaults.yaml  currency, budget_cents_per_pln, daily_budget_pln{}, bid_strategy,
 *                           placements, placement_presets{}, status, cta_default, cta_by_optgoal{}
 */

import {readFileSync, readdirSync, existsSync} from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import {rel} from './env.mjs';

/** @param {string} name settings file without extension */
export function settings(name) {
  const file = rel('settings', `${name}.yaml`);
  return YAML.parse(readFileSync(file, 'utf8'));
}

export const brand = () => settings('brand');
export const audiences = () => settings('audiences');
export const funnels = () => settings('funnels');
export const concepts = () => settings('concepts');
export const defaults = () => settings('defaults');

/**
 * Every creative across every batch manifest, with `batch` and absolute `path` added.
 * @return {!Array<!Object>}
 */
export function allCreatives() {
  const dir = rel('creatives');
  if (!existsSync(dir)) return [];
  const out = [];
  for (const batch of readdirSync(dir, {withFileTypes: true})) {
    if (!batch.isDirectory() || batch.name.startsWith('_') || batch.name === 'templates') continue;
    const mf = path.join(dir, batch.name, 'manifest.json');
    if (!existsSync(mf)) continue;
    const parsed = JSON.parse(readFileSync(mf, 'utf8'));
    for (const c of parsed.creatives || []) {
      out.push({...c, batch: batch.name, path: path.join(dir, batch.name, c.file)});
    }
  }
  return out;
}

/**
 * Copy variants for a concept and language: `copy/<concept>/<lang>.yaml`.
 * Shape: { headlines: {id: text}, primaries: {id: text}, descriptions: {id: text} }
 * @param {string} concept
 * @param {string} lang
 */
export function copyFor(concept, lang) {
  const file = rel('copy', concept, `${lang}.yaml`);
  if (!existsSync(file)) return null;
  return YAML.parse(readFileSync(file, 'utf8'));
}
