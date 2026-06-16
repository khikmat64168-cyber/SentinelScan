'use strict';

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    // Auto-detects the nearest tsconfig.json per linted file — required by
    // type-aware rules like no-floating-promises across the monorepo's
    // multiple workspace tsconfigs.
    project: true,
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'security'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:security/recommended-legacy',
  ],
  rules: {
    // TypeScript
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/no-import-type-side-effects': 'error',

    // General
    'no-console': 'warn',
    'prefer-const': 'error',
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
  },
  overrides: [
    {
      // Relax type-aware rules in test files (no tsconfig needed)
      files: ['**/*.test.ts', '**/*.spec.ts', '**/tests/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
      },
    },
    {
      // Config files are CommonJS — allow require()
      files: ['*.cjs', '*.config.js', '*.config.cjs'],
      env: { node: true },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
  ],
  ignorePatterns: ['dist/', 'node_modules/', 'coverage/', '*.js'],
};
