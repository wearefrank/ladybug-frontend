import typescriptParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import angularPlugin from '@angular-eslint/eslint-plugin';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import { fixupPluginRules } from '@eslint/compat';
import sonarjs from 'eslint-plugin-sonarjs';

export default [
  {
    ignores: ['projects/**/*', 'dist/**/*', 'target/**/*', 'node_modules/**/*', 'cypress/**/*'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.app.json', './tsconfig.spec.json'],
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      '@angular-eslint': angularPlugin,
      sonarjs: fixupPluginRules(sonarjs),
      prettier: prettierPlugin,
    },
    rules: {
      // TypeScript
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs.stylistic.rules,
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/triple-slash-reference': 'warn',
      '@typescript-eslint/member-ordering': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-inferrable-types': 'warn',

      // Angular
      ...angularPlugin.configs.recommended.rules,
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],

      // EcmaScript
      ...js.configs.recommended.rules,
      'prefer-template': 'error',
      'no-undef': 'off',

      // Prettier
      ...eslintConfigPrettier.rules,
      'prettier/prettier': 'warn',
    },
  },
  // Unicorn
  eslintPluginUnicorn.configs['flat/recommended'],
  {
    rules: {
      'unicorn/prevent-abbreviations': 'warn',
      'unicorn/no-array-reduce': 'off',
      'unicorn/prefer-ternary': 'warn',
      'unicorn/no-null': 'off',
      'unicorn/prefer-dom-node-text-content': 'warn',
    },
  },
  eslintPluginPrettierRecommended,
];
