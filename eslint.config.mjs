import { fileURLToPath } from 'url';
import path from 'path';

import cds from '@sap/cds/eslint.config.mjs';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import jestPlugin from 'eslint-plugin-jest';

// compute absolute repo root (works cross-platform)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  // 1) Ignore non-source files (replace previous .eslintignore)
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'data/**',
      '*.db',
      '.git/**',
      '.vscode/**',
      '.idea/**',
      // config files that should not be parsed by TS parser
      '.prettierrc.*',
      '.eslintrc.*',
      'package-lock.json',
      'yarn.lock',
    ],
  },

  // 2) Start with SAP CDS' recommended flat config
  ...cds.recommended,

  // 3) TypeScript-specific config (type-aware) - only for TS files
  {
    files: ['**/*.ts', '**/*.cts', '**/*.mts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tsPlugin,
      jest: jestPlugin,
    },
    languageOptions: {
      // parser must be the actual parser module object
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json'],
        // tsconfigRootDir must be an absolute path
        tsconfigRootDir: __dirname,
      },
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      // TypeScript rules (customize as needed)
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // 4) JavaScript / config files - do not use TS parser
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      // JS-specific overrides
    },
  },
];
