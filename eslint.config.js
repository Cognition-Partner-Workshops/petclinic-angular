// @ts-check
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const stylistic = require('@stylistic/eslint-plugin');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      angular.configs.tsRecommended,
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['tsconfig.json'],
      },
    },
    plugins: {
      '@stylistic': stylistic,
    },
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        {
          prefix: 'app',
          style: 'kebab-case',
          type: 'element',
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          prefix: 'app',
          style: 'camelCase',
          type: 'attribute',
        },
      ],
      '@stylistic/quotes': ['error', 'single', { allowTemplateLiterals: 'always' }],
      '@angular-eslint/no-empty-lifecycle-method': 'off',
      '@angular-eslint/prefer-standalone': 'off',
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      angular.configs.templateRecommended,
    ],
    rules: {},
  },
]);
