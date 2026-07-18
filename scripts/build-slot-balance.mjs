import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { build } from 'esbuild';

export const SLOT_BALANCE_ENTRY = 'tools/slot-balance/src/ui-v2/app.ts';
export const SLOT_BALANCE_BUNDLE = 'tools/slot-balance/assets/slot-balance-app.js';

export async function createSlotBalanceBundle() {
  const result = await build({
    entryPoints: [SLOT_BALANCE_ENTRY],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2022'],
    sourcemap: false,
    legalComments: 'none',
    logLevel: 'silent',
    write: false,
  });

  const output = result.outputFiles.at(0);
  if (!output) {
    throw new Error('スロバランスのブラウザ用JavaScriptを生成できませんでした。');
  }

  return output.contents;
}

async function buildTrackedBundle() {
  const bundle = await createSlotBalanceBundle();
  await writeFile(resolve(SLOT_BALANCE_BUNDLE), bundle);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (invokedPath === import.meta.url) {
  await buildTrackedBundle();
}
