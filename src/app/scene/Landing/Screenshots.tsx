export default function ScreenShots() {
  return (
    <div className="relative mx-[calc((100%-100vw)/2)] grid grid-flow-col gap-4 overflow-x-scroll px-[calc((100vw-100%)/2)] pb-12">
      <div className="grid gap-3">
        <div className="grid gap-1 px-2 text-xs text-zinc-400">
          <div className="font-bold">支払いを記録</div>
          <div>誰がいくら支払っているか、建て替えているか、が計算されます。</div>
        </div>
        <img
          src="/ss/1.webp"
          alt="支払いの記録が一覧できる画面"
          className="shadow-float w-[70vw] max-w-[320px] overflow-hidden rounded-xl object-cover object-[0_81%]"
        />
      </div>
      <div className="grid gap-3">
        <div className="grid gap-1 px-2 text-xs text-zinc-400">
          <div className="font-bold">イベントを追加</div>
          <div>誰が支払って、誰と割り勘したか、を記録できます。</div>
        </div>
        <img
          src="/ss/2.webp"
          alt="イベントを追加する画面"
          className="shadow-float w-[70vw] max-w-[320px] overflow-hidden rounded-xl object-cover object-[0_81%]"
        />
      </div>
      <div className="grid gap-3">
        <div className="grid gap-1 px-2 text-xs text-zinc-400">
          <div className="font-bold">URL共有</div>
          <div>複数人で共有して、みんなで記録することができます。</div>
        </div>
        <img
          src="/ss/3.webp"
          alt="メンバーを追加したり管理する画面"
          className="shadow-float w-[70vw] max-w-[320px] overflow-hidden rounded-xl object-cover object-[0_81%]"
        />
      </div>
      <div className="grid gap-3">
        <div className="grid gap-1 px-2 text-xs text-zinc-400">
          <div className="font-bold">最適な精算</div>
          <div>誰が誰にいくら返せばよいか、を一番早く済ませる方法を計算します。</div>
        </div>
        <img
          src="/ss/4.webp"
          alt="最適な生産方法を提示している画面"
          className="shadow-float w-[70vw] max-w-[320px] overflow-hidden rounded-xl object-cover object-[0_81%]"
        />
      </div>
      <div className="grid gap-3">
        <div className="grid gap-1 px-2 text-xs text-zinc-400">
          <div className="font-bold">記録の管理</div>
          <div>いままでの記録をストックしておくことができます。</div>
        </div>
        <img
          src="/ss/5.webp"
          alt="いままでの記録を参照する画面"
          className="shadow-float w-[70vw] max-w-[320px] overflow-hidden rounded-xl object-cover object-[0_81%]"
        />
      </div>
      <div className="grid gap-3">
        <div className="grid gap-1 px-2 text-xs text-zinc-400">
          <div className="font-bold">外国の通貨</div>
          <div>いろいろな通貨を使っていても換算して精算することができます。</div>
        </div>
        <img
          src="/ss/6.webp"
          alt="複数の通貨が混ざっている支払い記録の画面"
          className="shadow-float w-[70vw] max-w-[320px] overflow-hidden rounded-xl object-cover object-[0_81%]"
        />
      </div>
    </div>
  )
}
