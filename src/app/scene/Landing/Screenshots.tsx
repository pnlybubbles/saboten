export default function ScreenShots() {
  return (
    <div className="-mx-8 -my-12 grid grid-flow-col gap-4 overflow-x-scroll px-8 py-12">
      <div className="grid gap-3">
        <div className="px-2 text-xs text-zinc-400">
          <span className="font-bold">支払いを記録</span>
          <br />
          <span>誰がいくら支払っているか、建て替えているか、が計算されます。</span>
        </div>
        <img
          src="/ss/1.webp"
          alt="支払いの記録が一覧できる画面"
          className="shadow-float-high h-[137vw] w-[70vw] max-w-none overflow-hidden rounded-xl object-cover [object-position:0_81%]"
        />
      </div>
      <div className="grid gap-3">
        <div className="px-2 text-xs text-zinc-400">
          <span className="font-bold">イベントを追加</span>
          <br />
          <span>誰が支払って、誰と割り勘したか、を記録できます。</span>
        </div>
        <img
          src="/ss/2.webp"
          alt="イベントを追加する画面"
          className="shadow-float-high h-[137vw] w-[70vw] max-w-none overflow-hidden rounded-xl object-cover [object-position:0_81%]"
        />
      </div>
      <div className="grid gap-3">
        <div className="px-2 text-xs text-zinc-400">
          <span className="font-bold">URL共有</span>
          <br />
          <span>複数人で共有して、みんなで記録することができます。</span>
        </div>
        <img
          src="/ss/3.webp"
          alt="メンバーを追加したり管理する画面"
          className="shadow-float-high h-[137vw] w-[70vw] max-w-none overflow-hidden rounded-xl object-cover [object-position:0_81%]"
        />
      </div>
      <div className="grid gap-3">
        <div className="px-2 text-xs text-zinc-400">
          <span className="font-bold">最適な精算</span>
          <br />
          <span>誰が誰にいくら返せばよいか、を一番早く済ませる方法を計算します。</span>
        </div>
        <img
          src="/ss/4.webp"
          alt="最適な生産方法を提示している画面"
          className="shadow-float-high h-[137vw] w-[70vw] max-w-none overflow-hidden rounded-xl object-cover [object-position:0_81%]"
        />
      </div>
      <div className="grid gap-3">
        <div className="px-2 text-xs text-zinc-400">
          <span className="font-bold">記録の管理</span>
          <br />
          <span>いままでの記録をストックしておくことができます。</span>
        </div>
        <img
          src="/ss/5.webp"
          alt="いままでの記録を参照する画面"
          className="shadow-float-high h-[137vw] w-[70vw] max-w-none overflow-hidden rounded-xl object-cover [object-position:0_81%]"
        />
      </div>
      <div className="grid gap-3">
        <div className="px-2 text-xs text-zinc-400">
          <span className="font-bold">外国の通貨</span>
          <br />
          <span>いろいろな通貨を使っていても換算して精算することができます。</span>
        </div>
        <img
          src="/ss/6.webp"
          alt="複数の通貨が混ざっている支払い記録の画面"
          className="shadow-float-high h-[137vw] w-[70vw] max-w-none overflow-hidden rounded-xl object-cover [object-position:0_81%]"
        />
      </div>
    </div>
  )
}
