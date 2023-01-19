/* eslint-env node */

/** @type { import('prettier').Config } */
module.exports = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  plugins: [require('prettier-plugin-tailwindcss')],
  singleQuote: true,
  semi: false,
  printWidth: 120,
  trailingComma: 'all',
}
