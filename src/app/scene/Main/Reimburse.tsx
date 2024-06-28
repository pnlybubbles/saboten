import type { SheetProps } from '@app/components/Sheet'
import Sheet from '@app/components/Sheet'
import useRoomCurrencyRate from '@app/hooks/useRoomCurrencyRate'
import useRoomMember from '@app/hooks/useRoomMember'
import isNonNullable from '@app/util/isNonNullable'
import { Fragment, useMemo, useState } from 'react'
import * as Icon from 'lucide-react'
import CurrencyText from '@app/components/CurrencyText'
import Tips from '@app/components/Tips'
import Clickable from '@app/components/Clickable'
import EventSheet from './EventSheet'
import usePresent from '@app/hooks/usePresent'
import useEvents from '@app/hooks/useEvents'
import { v4 as uuid } from 'uuid'

type Props = SheetProps & {
  roomId: string
  balances: Balances
  primaryCurrency: string
  rateMissingCurrency: string[]
}

type Balances = (readonly [
  memberId: string,
  balanceByCurrency: {
    [code: string]: {
      readonly paid: number
      readonly assets: number
    }
  },
])[]

type Transaction = { from: string; to: string; amount: number; currency: string; id: string }

export default function Remburse({ roomId, balances, primaryCurrency, rateMissingCurrency, ...sheet }: Props) {
  const [, { getMemberName, isMe }] = useRoomMember(roomId)
  const [, { convertCurrencyValue, displayCurrency }] = useRoomCurrencyRate(roomId)
  const [, { addEvent }] = useEvents(roomId)

  const transactions = useMemo(() => {
    if (!sheet.isPresent) return null

    return [primaryCurrency, ...rateMissingCurrency].flatMap((transactionCurrency) => {
      // 負債が大きい順にDESC
      const initialAssets = balances.map(([memberId, balanceByCurrency]) => {
        const assets = Object.entries(balanceByCurrency)
          .map(([code, { assets }]) => convertCurrencyValue({ amount: assets, currency: code }, transactionCurrency))
          // transactionCurrency に変換できない通貨は無視 (rateMissingCurrencyの方でそれぞれ拾う)
          .filter(isNonNullable)
          .reduce((acc, v) => acc + v.amount, 0)
        return { memberId, assets }
      })

      let notBalanced = initialAssets
      const transactions: Transaction[] = []

      // eslint-disable-next-line no-constant-condition
      while (true) {
        // バランス済みの人を除外
        notBalanced = notBalanced.filter(({ assets }) => Math.abs(assets) > 1e-5).sort((a, b) => a.assets - b.assets)
        // 負債が一番大きい人
        const from = notBalanced[0]
        // 資産が一番大きい人
        const to = notBalanced[notBalanced.length - 1]
        // すべてバランスしていたら終了
        if (from === undefined || to === undefined) break
        // 最大の負債を持っている人が、最大の資産を持っている人に資産が一番大きい人に対して、可能な限りバランスするような取引をする
        const amount = Math.min(-from.assets, to.assets)
        from.assets += amount
        to.assets -= amount
        transactions.push({ from: from.memberId, to: to.memberId, amount, currency: transactionCurrency, id: uuid() })
      }

      return transactions
    })
  }, [balances, convertCurrencyValue, primaryCurrency, rateMissingCurrency, sheet.isPresent])

  const transactionIncludesRateMissingCurrency =
    transactions?.find((v) => rateMissingCurrency.includes(v.currency)) != null

  const present = usePresent()
  const [tx, setTx] = useState<Transaction>()

  return (
    <Sheet {...sheet}>
      <div className="grid gap-4">
        <div className="text-xs font-bold text-zinc-400">精算方法</div>
        {transactions && transactions.length > 0 ? (
          <div className="grid grid-cols-[auto_auto_auto_1fr] items-center gap-x-[6px] gap-y-2">
            {transactions.map((tx) => (
              <Fragment key={tx.id}>
                <div className="grid grid-flow-col items-center justify-start gap-2">
                  <span className="text-sm font-bold">{getMemberName(tx.from)}</span>
                  {isMe(tx.from) && <span className="text-xs text-zinc-400">自分</span>}
                </div>
                <Icon.ChevronsRight size={20} className="text-zinc-400"></Icon.ChevronsRight>
                <div className="grid grid-flow-col items-center justify-start gap-2">
                  <span className="text-sm font-bold">{getMemberName(tx.to)}</span>
                  {isMe(tx.to) && <span className="text-xs text-zinc-400">自分</span>}
                </div>
                <div className="grid justify-end">
                  <Clickable
                    className="grid grid-flow-col items-center gap-2 transition active:scale-90"
                    onClick={() => (setTx(tx), present.open())}
                  >
                    <CurrencyText {...displayCurrency({ currency: tx.currency, amount: tx.amount })}></CurrencyText>
                    {/* <Icon.CheckCircle2 size={16} className="text-zinc-400"></Icon.CheckCircle2> */}
                  </Clickable>
                </div>
              </Fragment>
            ))}
          </div>
        ) : (
          <div className="ml-[4px] grid h-12 grid-flow-col items-center justify-start gap-1 rounded-xl border-2 border-dotted border-zinc-400 px-4 text-xs text-zinc-400">
            <Icon.Beer size={16}></Icon.Beer>
            全員の精算が完了しました！
          </div>
        )}
        {transactionIncludesRateMissingCurrency && (
          <Tips type="default">
            変換レートが設定されていない通貨 ({rateMissingCurrency.join(', ')}) は、各通貨での精算方法を表示しています。
          </Tips>
        )}
      </div>
      {tx && (
        <EventSheet
          {...present}
          roomId={roomId}
          id={tx.id}
          defaultValue={{
            type: 'transfer',
            amount: tx.amount,
            currency: tx.currency,
            label: '精算',
            paidByMemberId: tx.from,
            transferToMemberId: tx.to,
          }}
          onSubmit={addEvent}
          submitLabel="精算を記録"
          hideTypeTab
        />
      )}
    </Sheet>
  )
}
