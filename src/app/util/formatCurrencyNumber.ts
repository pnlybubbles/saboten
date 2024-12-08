/**
 * 通貨表記をフォーマットする
 *
 * @param value 数値
 * @param currency ISO4217 通貨コード (https://ja.wikipedia.org/wiki/ISO_4217)
 * @returns
 */
export default function formatCurrencyNumber(value: number, currency: string, forceFraction: boolean = false) {
  const formatter = new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency,
    minimumFractionDigits: forceFraction ? precision(value) : undefined,
  })
  return formatter.format(value)
}

/**
 * 小数点以下の桁数を取得する
 */
function precision(n: number) {
  let e = 1
  let p = 0
  while (Math.round(n * e) / e !== n) {
    e *= 10
    p++
  }
  return p
}
