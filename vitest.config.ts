import { defineConfig } from 'vitest/config';

const isCI = !!process.env.CI;

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
      provider: 'istanbul',
      reporter: ['text', 'lcov', 'html', 'cobertura'],
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
          pool: 'forks',
          maxWorkers: 1,
          isolate: false,
        },
      },
      {
        test: {
          globals: true,
          name: 'unit',
          environment: 'node',
          include: ['**/*.unit.spec.ts'],
        },
      },
    ],
  },
});
