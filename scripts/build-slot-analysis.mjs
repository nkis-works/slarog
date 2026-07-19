import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { build } from 'esbuild';

export const SLOT_ANALYSIS_ENTRY = 'tools/slot-analysis/src/ui-v2/app.ts';
export const SLOT_ANALYSIS_BUNDLE = 'tools/slot-analysis/assets/slot-analysis-app.js';

export async function createSlotAnalysisBundle() {
  const result = await build({
    entryPoints: [SLOT_ANALYSIS_ENTRY],
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
    throw new Error('スロット出玉分析のブラウザ用JavaScriptを生成できませんでした。');
  }

  return output.contents;
}

async function buildTrackedBundle() {
  const bundle = await createSlotAnalysisBundle();
  await writeFile(resolve(SLOT_ANALYSIS_BUNDLE), bundle);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (invokedPath === import.meta.url) {
  await buildTrackedBundle();
}
