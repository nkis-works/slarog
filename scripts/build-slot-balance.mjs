import { build } from 'esbuild';

await build({
  entryPoints: ['tools/slot-balance/src/ui/app.ts'],
  outfile: 'tools/slot-balance/assets/slot-balance-app.js',
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2022'],
  sourcemap: false,
  legalComments: 'none',
  logLevel: 'info',
});
