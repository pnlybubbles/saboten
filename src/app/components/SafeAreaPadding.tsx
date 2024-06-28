/**
 * シートの最後の要素が文字などの余白を持たない要素の場合にはsafe-areaとオーバーラップしたときに窮屈に感じるため、余分な余白を設ける
 */
export default function SafeAreaPadding() {
  return <div className="pb-[calc(env(safe-area-inset-bottom,0px)/2)]"></div>
}
