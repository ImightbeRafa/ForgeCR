import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { build } from 'vite';

import {
  FALLBACK_WHATSAPP_NUMBER,
  WHATSAPP_NUMBER_PLACEHOLDER,
  applyWhatsappNumber,
  normalizeWhatsappNumber,
  resolveWhatsappNumber,
  whatsappHref
} from '../shared/whatsapp.js';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

test('resolveWhatsappNumber strips formatting and falls back when unset', () => {
  assert.equal(resolveWhatsappNumber(undefined), FALLBACK_WHATSAPP_NUMBER);
  assert.equal(resolveWhatsappNumber(''), FALLBACK_WHATSAPP_NUMBER);
  assert.equal(resolveWhatsappNumber('+506 8888-7777'), '50688887777');
  assert.equal(normalizeWhatsappNumber('+506 8888-7777'), '50688887777');
  assert.equal(whatsappHref('50688887777'), 'https://wa.me/50688887777');
  assert.equal(
    applyWhatsappNumber(`https://wa.me/${WHATSAPP_NUMBER_PLACEHOLDER}`, '50611112222'),
    'https://wa.me/50611112222'
  );
});

test('resolveWhatsappNumber rejects an explicit value with no digits', () => {
  assert.throws(() => resolveWhatsappNumber('whatsapp'), /must contain digits/);
});

test('homepage and error page source use the WhatsApp placeholder, not a hardcoded number', async () => {
  const indexHtml = await readFile(join(repoRoot, 'index.html'), 'utf8');
  const errorHtml = await readFile(join(repoRoot, 'error.html'), 'utf8');

  assert.match(indexHtml, new RegExp(`https://wa\\.me/${WHATSAPP_NUMBER_PLACEHOLDER}`));
  assert.match(errorHtml, new RegExp(`https://wa\\.me/${WHATSAPP_NUMBER_PLACEHOLDER}`));
  assert.doesNotMatch(indexHtml, /wa\.me\/\d+/);
  assert.doesNotMatch(errorHtml, /wa\.me\/\d+/);
});

test('vite build injects WHATSAPP_NUMBER into homepage and error page', async () => {
  const previous = process.env.WHATSAPP_NUMBER;
  const outDir = await mkdtemp(join(tmpdir(), 'forge-whatsapp-'));
  process.env.WHATSAPP_NUMBER = '+506 1111-2222';

  try {
    await build({
      configFile: join(repoRoot, 'vite.config.js'),
      root: repoRoot,
      mode: 'production',
      logLevel: 'error',
      build: {
        outDir,
        emptyOutDir: true,
        minify: false
      }
    });

    const indexHtml = await readFile(join(outDir, 'index.html'), 'utf8');
    const errorHtml = await readFile(join(outDir, 'error.html'), 'utf8');

    assert.match(indexHtml, /https:\/\/wa\.me\/50611112222/);
    assert.match(errorHtml, /https:\/\/wa\.me\/50611112222/);
    assert.equal([...indexHtml.matchAll(/https:\/\/wa\.me\/50611112222/g)].length, 2);
    assert.doesNotMatch(indexHtml, /50671618029/);
    assert.doesNotMatch(errorHtml, /50671618029/);
    assert.doesNotMatch(indexHtml, /%WHATSAPP_NUMBER%/);
    assert.doesNotMatch(errorHtml, /%WHATSAPP_NUMBER%/);
  } finally {
    if (previous === undefined) {
      delete process.env.WHATSAPP_NUMBER;
    } else {
      process.env.WHATSAPP_NUMBER = previous;
    }
    await rm(outDir, { recursive: true, force: true });
  }
});
