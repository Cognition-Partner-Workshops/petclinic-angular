const angular = require('angular-eslint');
const stylistic = require('@stylistic/eslint-plugin');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [...angular.configs.tsRecommended],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    processor: angular.processInlineTemplates,
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      '@stylistic': stylistic,
    },
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
      // The application intentionally retains its NgModule architecture.
      '@angular-eslint/prefer-standalone': 'off',
      // Keep the existing constructor-injection style instead of rewriting unrelated services.
      '@angular-eslint/prefer-inject': 'off',
      // Keep eager zone-based change detection instead of changing app behavior to OnPush.
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
      '@angular-eslint/no-empty-lifecycle-method': 'off',
      '@typescript-eslint/no-deprecated': 'error',
      '@stylistic/quotes': [
        'error',
        'single',
        {
          allowTemplateLiterals: 'always',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended],
  },
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },
);
