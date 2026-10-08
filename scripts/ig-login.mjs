#!/usr/bin/env node
/**
 * @fileoverview One-time Instagram login for the ingest script. Opens a real
 * (headed) Chromium, lets the operator log in by hand (password, 2FA — never
 * typed by an agent, never stored here), then saves the browser storage
 * state to .secrets/ig-state.json (gitignored). ig-fetch.mjs reuses it.
 *
 *   node scripts/ig-login.mjs
 */

import {mkdirSync} from 'node:fs';
import {chromium} from 'playwright';
import {rel} from './lib/env.mjs';

const stateFile = rel('.secrets', 'ig-state.json');
mkdirSync(rel('.secrets'), {recursive: true});

const browser = await chromium.launch({headless: false});
const ctx = await browser.newContext({viewport: {width: 1200, height: 900}, locale: 'en-US'});
const page = await ctx.newPage();
await page.goto('https://www.instagram.com/accounts/login/', {waitUntil: 'domcontentloaded'});
console.log('Log in to Instagram in the browser window (use the SVORA account or any account that follows @svora.nails).');
console.log('Waiting for the session cookie…');
for (let i = 0; i < 600; i++) {
  const cookies = await ctx.cookies('https://www.instagram.com');
  if (cookies.some((c) => c.name === 'sessionid' && c.value)) break;
  await page.waitForTimeout(1000);
}
const cookies = await ctx.cookies('https://www.instagram.com');
if (!cookies.some((c) => c.name === 'sessionid')) {
  console.error('no session after 10 minutes — nothing saved');
  await browser.close();
  process.exit(1);
}
await ctx.storageState({path: stateFile});
console.log(`saved ${stateFile} (chmod 600 it). Never commit this file.`);
await browser.close();
