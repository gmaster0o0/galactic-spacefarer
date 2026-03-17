import { defineConfig } from 'vitest/config';

const isCI = Boolean(process.env.CI || process.env.GITHUB_ACTIONS);

export default defineConfig({
  test: {
    reporters: isCI
      ? [
          'default',
          ['junit', { outputFile: 'test-results/junit.xml' }],
          ['json', { outputFile: 'test-results/vitest-results.json' }],
        ]
      : ['default'],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html', 'cobertura'],
      include: ['srv/**/*.ts'],
      exclude: ['node_modules', 'test', 'db/data', '**/*.csv'],
      reportsDirectory: 'test-results/coverage',
    },

    fileParallelism: isCI,

    projects: [
      {
        test: {
          globals: true,
          name: 'int',
          environment: 'node',
          include: ['**/*.int.spec.ts'],
          setupFiles: ['./test/tsx-setup.cjs'],
          pool: 'forks',
          maxWorkers: 1,
          isolate: false,
          ...(isCI ? { sequence: { groupOrder: 1 } } : {}),
        },
      },
      {
        test: {
          globals: true,
          name: 'unit',
          environment: 'node',
          include: ['**/*.unit.spec.ts'],
          ...(isCI ? { sequence: { groupOrder: 2 } } : {}),
        },
      },
    ],
  },
});
