import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    rules: {
      'arrow-body-style': ['error', 'as-needed'],
      'arrow-parens': 'error',
      'arrow-spacing': 'error',
      curly: 'error',
      'default-case': 'error',
      'dot-location': ['error', 'property'],
      'dot-notation': 'error',
      'eol-last': ['error'],
      eqeqeq: 'error',
      'no-alert': 'error',
      'no-caller': 'error',
      'no-console': 'error',
      'no-div-regex': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-eval': 'error',
      'no-extra-label': 'error',
      'no-implicit-coercion': 'error',
      'no-inline-comments': 'error',
      'no-lone-blocks': 'error',
      'no-lonely-if': 'error',
      'no-loop-func': 'error',
      'no-magic-numbers': [
        'error',
        {
          ignore: [-1, 0, 1, 100, 60, 24, 365],
          ignoreArrayIndexes: true,
        },
      ],
      'no-multi-assign': 'error',
      'no-multi-spaces': 'error',
      'no-multiple-empty-lines': 'error',
      'no-useless-call': 'error',
      'no-useless-computed-key': 'error',
      'no-useless-concat': 'error',
      'no-useless-constructor': 'error',
      'no-useless-rename': 'error',
      'no-useless-return': 'error',
      'no-var': 'error',
      'no-whitespace-before-property': 'error',
      'object-curly-spacing': ['error', 'always'],
      'one-var': ['error', 'never'],
      'one-var-declaration-per-line': 'error',
      'padded-blocks': ['error', 'never'],
      'padding-line-between-statements': 'error',
      'prefer-const': 'error',
      'prefer-spread': 'error',
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'space-in-parens': ['error', 'never'],
      'space-infix-ops': 'error',
      'space-unary-ops': 'error',
      'spaced-comment': ['error', 'always'],
      'wrap-iife': 'error',
      yoda: 'error',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // excluded in Next.js apps...
      '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'none', argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
]);

export default eslintConfig;
