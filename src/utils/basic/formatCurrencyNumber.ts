/**
 * 通貨表記をフォーマットする
 *
 * @param value 数値
 * @param currency ISO4217 通貨コード (https://ja.wikipedia.org/wiki/ISO_4217)
 * @returns
 */
export default function formatCurrencyNumber(value: bigint, currency: 'JPY' | 'USD' | 'EUR') {
  const formatter = new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency,
  })
  return formatter.format(value)
}
