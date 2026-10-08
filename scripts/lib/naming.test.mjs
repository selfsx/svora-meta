import {test} from 'node:test';
import assert from 'node:assert/strict';
import {slug, campaignName, adsetName, creativeName, parseCreativeName} from './naming.mjs';

test('slug drops symbols and collapses', () => {
  assert.equal(slug('  Wola 10km!! '), 'wola-10km');
  assert.equal(slug('crazy_3d'), 'crazy3d');
});

test('campaign name assembles in order and lowercases', () => {
  const n = campaignName({number: 1, camptype: 'test', budget: 'cbo', optgoal: 'purchase', geo: 'wola10km', lang: 'ua', concept: 'crazy', date: '2026-10-15'});
  assert.equal(n, '001_test_cbo_purchase_wola10km_ua_crazy_2026-10-15');
});

test('campaign name refuses bad vocab and dates', () => {
  assert.throws(() => campaignName({number: 1, camptype: 'nope', budget: 'cbo', optgoal: 'purchase', geo: 'g', lang: 'ua', concept: 'c', date: '2026-10-15'}));
  assert.throws(() => campaignName({number: 1, camptype: 'test', budget: 'cbo', optgoal: 'purchase', geo: 'g', lang: 'ua', concept: 'c', date: '2026_10_15'}));
});

test('adset name', () => {
  assert.equal(adsetName({audience: 'broad', geo: 'wola10km', lang: 'ua', concept: 'crazy', type: 'vd', count: 5, date: '2026-10-15'}),
      'broad_wola10km_ua_crazy_vd5_2026-10-15');
});

test('creative name round-trips', () => {
  const name = creativeName({concept: 'crazy', hook: 'reveal', source: 'DaxwkGBtqcU', type: 'vd', n: 12, v: 1, format: '9x16', lang: 'ua'});
  assert.equal(name, 'crazy_reveal_DaxwkGBtqcU_vd_n012_v1_9x16_ua');
  assert.deepEqual(parseCreativeName(name), {concept: 'crazy', hook: 'reveal', source: 'DaxwkGBtqcU', type: 'vd', n: 12, v: 1, format: '9x16', lang: 'ua'});
  assert.equal(parseCreativeName('garbage'), null);
});
