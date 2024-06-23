import type { SheetProps } from '@app/components/Sheet'
import Sheet from '@app/components/Sheet'
import useRoomCurrencyRate from '@app/hooks/useRoomCurrencyRate'
import useRoomMember from '@app/hooks/useRoomMember'
import isNonNullable from '@app/util/isNonNullable'
import { Fragment, useMemo } from 'react'
import * as Icon from 'lucide-react'
import CurrencyText from '@app/components/CurrencyText'
import Tips from '@app/components/Tips'

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

export default function Remburse({ roomId, balances, primaryCurrency, rateMissingCurrency, ...sheet }: Props) {
  const [, { getMemberName }] = useRoomMember(roomId)
  const [, { convertCurrencyValue, displayCurrency }] = useRoomCurrencyRate(roomId)

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
      const transactions: { from: string; to: string; amount: number; currency: string }[] = []

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
        transactions.push({ from: from.memberId, to: to.memberId, amount, currency: transactionCurrency })
      }

      return transactions
    })
  }, [balances, convertCurrencyValue, primaryCurrency, rateMissingCurrency, sheet.isPresent])

  return (
    <Sheet {...sheet}>
      <div className="grid gap-4">
        <div className="text-xs font-bold text-zinc-400">精算方法</div>
        <div className="grid grid-cols-[auto_auto_auto_1fr] items-center gap-x-[6px] gap-y-2">
          {transactions?.map((tx) => (
            <Fragment key={`${tx.from}_${tx.to}_${tx.amount}`}>
              <div className="text-sm font-bold">{getMemberName(tx.from)}</div>
              <Icon.ChevronsRight size={20} className="text-zinc-400"></Icon.ChevronsRight>
              <div className="text-sm font-bold">{getMemberName(tx.to)}</div>
              <CurrencyText {...displayCurrency({ currency: tx.currency, amount: tx.amount })}></CurrencyText>
            </Fragment>
          ))}
        </div>
        {rateMissingCurrency.length > 0 && (
          <Tips type={Icon.PiggyBank}>
            変換レートが設定されていない通貨 ({rateMissingCurrency.join(', ')}) は、各通貨での精算方法を表示しています。
          </Tips>
        )}
      </div>
    </Sheet>
  )
}
