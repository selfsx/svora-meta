/**
 * @fileoverview The naming law in code — `.claude/rules/naming-conventions.md`
 * is the spec, this file implements it. Campaign, ad set, creative and ad
 * names are built here and nowhere else.
 */

/** Lowercase, keep [a-z0-9-], whitespace→'-', collapse, trim. */
export function slug(s) {
  return String(s ?? '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
}

export const VOCAB = {
  camptype: ['test', 'bau', 'retest', 'retarget'],
  budget: ['cbo', 'abo'],
  optgoal: ['purchase', 'ic', 'lpv', 'clicks', 'msgs', 'reach'],
  lang: ['pl', 'ua', 'ru', 'uaru', 'en', 'multi'],
  type: ['vd', 'st', 'cr'],
  format: ['9x16', '4x5', '1x1'],
};

const MAX = 200;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function check(field, value, allowed) {
  if (!allowed.includes(value)) throw new Error(`${field} "${value}" not in [${allowed.join(', ')}]`);
}

/**
 * {number}_{camptype}_{budget}_{optgoal}_{geo}_{lang}_{concept}_{date}[_{comment}]
 * @param {{number: (number|string), camptype: string, budget: string, optgoal: string, geo: string,
 *          lang: string, concept: string, date: string, comment: (string|undefined)}} c
 */
export function campaignName(c) {
  check('camptype', c.camptype, VOCAB.camptype);
  check('budget', c.budget, VOCAB.budget);
  check('optgoal', c.optgoal, VOCAB.optgoal);
  check('lang', c.lang, VOCAB.lang);
  if (!DATE.test(c.date)) throw new Error(`date "${c.date}" must be yyyy-mm-dd`);
  const number = String(c.number).padStart(3, '0');
  const parts = [number, c.camptype, c.budget, c.optgoal, slug(c.geo), c.lang, slug(c.concept), c.date];
  if (c.comment) parts.push(slug(c.comment));
  return fit(parts.join('_'), c.comment ? [slug(c.comment)] : []);
}

/**
 * {audience}_{geo}_{lang}_{concept}_{type}{count}_{date}[_{comment}]
 * @param {{audience: string, geo: string, lang: string, concept: string, type: string, count: number,
 *          date: string, comment: (string|undefined)}} a
 */
export function adsetName(a) {
  check('lang', a.lang, VOCAB.lang);
  check('type', a.type, VOCAB.type);
  if (!DATE.test(a.date)) throw new Error(`date "${a.date}" must be yyyy-mm-dd`);
  const parts = [slug(a.audience), slug(a.geo), a.lang, slug(a.concept), `${a.type}${Number(a.count) || 0}`, a.date];
  if (a.comment) parts.push(slug(a.comment));
  return fit(parts.join('_'), a.comment ? [slug(a.comment)] : []);
}

/**
 * {concept}_{hook}_{source}_{type}_n{nnn}_v{n}_{format}_{lang}
 * `source` is the Instagram shortcode or a legacy file stem; `n` is the per-batch counter.
 * @param {{concept: string, hook: string, source: string, type: string, n: number, v: number,
 *          format: string, lang: string}} c
 */
export function creativeName(c) {
  check('type', c.type, VOCAB.type);
  check('format', c.format, VOCAB.format);
  if (!['pl', 'ua', 'ru', 'en'].includes(c.lang)) throw new Error(`creative lang "${c.lang}" must be pl|ua|ru|en`);
  const source = String(c.source).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 24); // keep IG shortcode case
  return [slug(c.concept), slug(c.hook), source, c.type, `n${String(c.n).padStart(3, '0')}`, `v${c.v || 1}`, c.format, c.lang].join('_');
}

/** Parses a creative name back into its fields; null when it does not match. */
export function parseCreativeName(name) {
  const m = /^([a-z0-9-]+)_([a-z0-9-]+)_([A-Za-z0-9_-]+?)_(vd|st|cr)_n(\d{3})_v(\d+)_(9x16|4x5|1x1)_(pl|ua|ru|en)$/.exec(name);
  if (!m) return null;
  return {concept: m[1], hook: m[2], source: m[3], type: m[4], n: Number(m[5]), v: Number(m[6]), format: m[7], lang: m[8]};
}

/** The ad name IS the creative name. */
export const adName = (creative) => creative;

function fit(name, droppable) {
  let out = name;
  for (const d of droppable) {
    if (out.length <= MAX) break;
    out = out.replace(`_${d}`, '');
  }
  if (out.length > MAX) throw new Error(`name exceeds ${MAX} chars: ${out}`);
  return out;
}
