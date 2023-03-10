/* eslint-env node */

/** @type { import('eslint').Linter.Config } */
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:tailwindcss/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', ignoreRestSiblings: true }],
    // Rule conflict with prettier-plugin-tailwindcss
    'tailwindcss/classnames-order': 'off',
    // Auto-fix rule for 'importsNotUsedAsValues'
    '@typescript-eslint/consistent-type-imports': 'error',
    // Disable checking function passed to JSX attributes
    // Usability for the return value of react-hook-form `handleSubmit()`
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: { attributes: false },
      },
    ],
  },
}
