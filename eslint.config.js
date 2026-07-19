import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'assets/**',
      'artifacts/**',
      'build/**',
      'coverage/**',
      'dist/**',
      'node_modules/**',
      'tools/slot-analysis/assets/slot-analysis-app.js',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['tools/slot-analysis/src/**/*.ts', 'tools/slot-analysis/tests/**/*.ts'],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: [
      'playwright.config.ts',
      'playwright.dist.config.ts',
      'tools/slot-analysis/e2e/**/*.ts',
      'tools/slot-analysis/e2e-dist/**/*.ts',
    ],
    languageOptions: {
      globals: globals.node,
    },
  },
);
