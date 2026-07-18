import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { calculateTargetReverse } from '../../src/domain/slot-analysis-v2/target-reverse';

describe('slot analysis v2 privacy and purity boundary', () => {
  it('contains no DOM, network, storage, clock, or random dependency', () => {
    const directory = resolve('tools/slot-balance/src/domain/slot-analysis-v2');
    const files = [
      'benchmarks.ts',
      'cumulative-points.ts',
      'drawdown.ts',
      'index.ts',
      'segments.ts',
      'sensitivity.ts',
      'shared.ts',
      'target-reverse.ts',
      'types.ts',
      'version.ts',
    ];
    const source = files.map((file) => readFileSync(resolve(directory, file), 'utf8')).join('\n');
    expect(source).not.toMatch(
      /\b(?:document|window|console|fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB|WebSocket|EventSource|setTimeout|setInterval|Date\.now|Math\.random)\b|navigator\.sendBeacon|performance\.now|crypto\.getRandomValues/,
    );
  });

  it('is deterministic and does not write input values outside its return value', () => {
    const input = {
      currentGames: 4000,
      currentNetMedals: 500,
      targetTotalGames: 5000,
      targetPayoutRate: 100,
    } as const;
    const before = structuredClone(input);
    const first = calculateTargetReverse(input);
    const second = calculateTargetReverse(input);
    expect(input).toEqual(before);
    expect(second).toEqual(first);
    expect(globalThis).not.toHaveProperty('slotAnalysisInput');
  });
});
