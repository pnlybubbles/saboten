/**
 * 半角空白を含む。改行,タブなど制御文字を含まない
 */
export const PRINTABLE_ASCII_REGEXP = /^[\x20-\x7E]*$/

/**
 * 浮動小数点
 */
export const FLOAT_NUMBER_REGEXP = /^\d*(\.\d*)?$/

/**
 * 数値のみ
 */
export const DIGIT_NUMBER_REGEXP = /^\d*$/
