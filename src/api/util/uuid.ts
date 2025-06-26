export default function uuid() {
  return crypto.randomUUID()
}

export function uuidToCompressedPrintableString(uuid: string) {
  // uuid のフォーマット: f92b7add-8d49-4b8e-aa7d-8690e6956b62
  // '-'のデリミタを取り除く : f92b7add8d494b8eaa7d8690e6956b62
  const hexString = uuid.replaceAll('-', '')
  // js の String は utf-16 で表現されているので String.length は 16bit ごとに分割したときの長さになる
  // 今回 1 CodeUnit の 16bit のうち 4bit しか使っていない。8bit ごとに分けたいので 2 CodePoint まとめて圧縮する
  const stride = 2
  // uuid は 128bit あるので、16byte の TypedArray を確保
  const binary = new Uint8Array(16)
  for (let i = 0; i < binary.length; i++) {
    const len2HexString = hexString.slice(i * stride, (i + 1) * stride)
    // 2 CodeUnit分 を 16 を基数にしてint化
    binary[i] = Number.parseInt(len2HexString, 16)
  }
  // バイナリ文字列にする必要性があるので、文字列型に変換
  const binaryString = String.fromCharCode(...Array.from(binary))
  // base64化
  // 6bit ごとに圧縮されるので21.4文字分の情報量に圧縮できる
  // base64 の企画として4文字づつの変換になるので、生成されるのは24文字
  const base64String = btoa(binaryString)
  // 情報は22文字文字で足りてるので余った後ろ2文字は確定で'='が入るため、取り除く
  const trimmedBase64String = base64String.slice(0, 22)
  // 似ている文字は認識の妨げになるのでbase64外の記号に置き換える
  const result = [...trimmedBase64String].map((v) => IGNORED_SIMILER_CHARACTOR_MAPPING[v] ?? v).join('')
  return result
}

export function compressedPrintableStringToUuid(value: string) {
  const trimmedBase64String = [...value].map((v) => IGNORED_SIMILER_CHARACTOR_MAPPING_REVERSE[v] ?? v).join('')
  const base64String = trimmedBase64String + '=='
  const binaryString = atob(base64String)
  let hexString = ''
  // 1文字8bit分まで使ってる文字列
  // 128bit分あるので、8bitづつ取り出して16回
  for (let i = 0; i < binaryString.length; i++) {
    // 8bit分を取り出して、16進数(4bit) x 2文字 に変換
    hexString += binaryString.charCodeAt(i).toString(16).padStart(2, '0')
  }
  // uuidのフォーマットに合わせる
  const uuid = `${hexString.slice(0, 8)}-${hexString.slice(8, 12)}-${hexString.slice(12, 16)}-${hexString.slice(
    16,
    20,
  )}-${hexString.slice(20)}`
  return uuid
}

const IGNORED_SIMILER_CHARACTOR_MAPPING: Record<string, string> = {
  o: '@',
  O: '%',
  '0': '&',
  I: '$',
  l: '#',
}

const IGNORED_SIMILER_CHARACTOR_MAPPING_REVERSE = Object.fromEntries(
  Object.entries(IGNORED_SIMILER_CHARACTOR_MAPPING).map(([k, v]) => [v, k]),
)
