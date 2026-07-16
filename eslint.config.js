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
      'tools/slot-balance/assets/slot-balance-app.js',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['tools/slot-balance/src/**/*.ts', 'tools/slot-balance/tests/**/*.ts'],
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
    files: ['playwright.config.ts', 'tools/slot-balance/e2e/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
);
