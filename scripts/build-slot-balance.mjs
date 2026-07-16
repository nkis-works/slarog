import { build } from 'esbuild';

await build({
  entryPoints: ['tools/slot-balance/src/index.ts'],
  outfile: 'build/slot-balance/slot-balance-domain.js',
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2022'],
  sourcemap: true,
  logLevel: 'info',
});
