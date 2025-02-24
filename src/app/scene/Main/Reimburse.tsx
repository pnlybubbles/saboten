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
import type { Event } from '@app/hooks/useEvents'
import useEvents, { filterEventsForAggregation, semanticEventPayload } from '@app/hooks/useEvents'
import { v4 as uuid } from 'uuid'
import Button from '@app/components/Button'
import useRoomArchived from '@app/hooks/useRoomArchive'
import Tab from '@app/components/Tab'
import unreachable from '@app/util/unreachable'
import { conbination2 } from '@app/util/conbination'
import Avatar from '@app/components/Avatar'
import { DEFAULT_PRIMARY_CURRENCY } from './CurrencySettingSheet'

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
type TransactionDetail = { event: Event; amount: number; currency: string }
type TransactionWithDetails = Transaction & { details: TransactionDetail[] }

export default function Remburse({ roomId, balances, primaryCurrency, rateMissingCurrency, ...sheet }: Props) {
  const [members, { getMemberName, isMe }] = useRoomMember(roomId)
  const [, { convertCurrencyValue, displayCurrency }] = useRoomCurrencyRate(roomId)
  const [rawEvents, { addEvent }] = useEvents(roomId)

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

  const events = useMemo(() => filterEventsForAggregation(rawEvents), [rawEvents])

  // 当事者間での取引で精算する
  const transactionsByEvent = useMemo(() => {
    if (!sheet.isPresent || !events) return null

    const transactions: {
      [toMemberId: string]: { [fromMemberId: string]: { amount: number; currency: string; event: Event }[] }
    } = {}

    for (const event of events) {
      for (const payment of event.payments) {
        transactions[payment.paidByMemberId] ??= {}
        const tx = { amount: payment.amount / event.members.length, currency: payment.currency, event }

        for (const member of event.members) {
          // 自分自身には支払いがないのでスキップ
          if (member.memberId === payment.paidByMemberId) continue

          transactions[payment.paidByMemberId]![member.memberId] ??= []
          transactions[payment.paidByMemberId]![member.memberId]!.push(tx)
        }
      }
    }

    return transactions
  }, [events, sheet.isPresent])

  const transactionsByParty = useMemo(() => {
    if (!sheet.isPresent || !members || !transactionsByEvent) return null

    const transactions: TransactionWithDetails[] = []

    for (const [to, from] of conbination2(members.map((v) => v.id).filter(isNonNullable))) {
      if (to === from) continue

      const detailsByCurrency: { [code: string]: { amount: number; currency: string; event: Event }[] } = {}

      for (const { currency, amount, event } of transactionsByEvent[to]?.[from] ?? []) {
        detailsByCurrency[currency] ??= []
        detailsByCurrency[currency]!.push({ event, amount, currency })
      }

      for (const { currency, amount, event } of transactionsByEvent[from]?.[to] ?? []) {
        detailsByCurrency[currency] ??= []
        detailsByCurrency[currency]!.push({ event, amount: -amount, currency })
      }

      for (const [currency, details] of Object.entries(detailsByCurrency)) {
        const sum = Math.round(details.reduce((acc, { amount }) => acc + amount, 0))
        if (sum > 0) {
          transactions.push({ from, to, amount: sum, currency, id: uuid(), details })
        } else {
          transactions.push({
            from: to,
            to: from,
            amount: -sum,
            currency,
            id: uuid(),
            details: details.map((v) => ({ ...v, amount: -v.amount, currency })),
          })
        }
      }
    }

    // 取引を集計して、それぞれのメンバーが 受け取るお金 (プラスのasset) or 渡すお金 (マイナスのasset) を合算する
    // すべてのassetを合計すると打ち消し合って必ず0になる
    const assetsAggregatedByTransactions = transactions.reduce(
      (acc, tx) => {
        acc[tx.to] ??= {}
        acc[tx.to]![tx.currency] ??= 0
        acc[tx.to]![tx.currency] += tx.amount
        acc[tx.from] ??= {}
        acc[tx.from]![tx.currency] ??= 0
        acc[tx.from]![tx.currency] -= tx.amount
        return acc
      },
      {} as { [memberId: string]: { [currency: string]: number } },
    )

    // 取引由来のasset と バランスシートのasset の差分を計算して端数のズレを算出する
    const assetsFractionsInTransactions: {
      [currency: string]: { memberId: string; fraction: number }[]
    } = {}
    for (const [memberId, balanceByCurrency] of balances) {
      for (const [currency, { assets }] of Object.entries(balanceByCurrency)) {
        const fraction = (assetsAggregatedByTransactions[memberId]?.[currency] ?? 0) - assets
        if (fraction != 0) {
          assetsFractionsInTransactions[currency] ??= []
          assetsFractionsInTransactions[currency]!.push({ memberId, fraction })
        }
      }
    }

    for (const [currency, fractions] of Object.entries(assetsFractionsInTransactions)) {
      while (fractions.length > 0) {
        // ズレが+で大きい方からソート
        fractions.sort((a, b) => b.fraction - a.fraction)
        // 必ず-と+が対になっているはずなので、2以上の要素がある
        const from = fractions.shift()!
        const to = fractions.pop()!

        // どちらか差分が小さい方で相殺する
        const fraction = Math.min(from.fraction, -to.fraction)
        from.fraction -= fraction
        to.fraction += fraction

        // 相殺する端数の対象となる既存の取引を見つける
        const tx =
          transactions.find((v) => v.from === from.memberId && v.to === to.memberId && v.currency === currency) ??
          transactions.find((v) => v.from === to.memberId && v.to === from.memberId && v.currency === currency)
        if (tx && tx.from === from.memberId) {
          tx.amount += fraction
        } else if (tx && tx.from === to.memberId) {
          tx.amount -= fraction
        } else {
          // 対象の取引が見つからない場合は作成する
          // TODO: 本来は取引がある相手経由で端数をホップさせていくのが理想だが
          // 経路を特定するのが難しいためいったん直接的な取引を作成してしまうことにする
          // (そもそもこの分岐に入ることは理論上存在しない?)
          transactions.push({
            from: from.memberId,
            to: to.memberId,
            amount: fraction,
            currency,
            id: uuid(),
            details: [],
          })
        }

        if (from.fraction !== 0) fractions.unshift(from)
        if (to.fraction !== 0) fractions.push(to)
      }
    }

    transactions.sort((a, b) => {
      const ordering = a.to.localeCompare(b.to)
      if (ordering !== 0) return ordering
      return a.from.localeCompare(b.from)
    })

    const convertedTransactions: TransactionWithDetails[] = []

    for (const tx of transactions) {
      const convertedTx = convertCurrencyValue(tx, primaryCurrency) ?? tx
      const exist = convertedTransactions.find(
        (v) => v.from === convertedTx.from && v.to === convertedTx.to && v.currency === convertedTx.currency,
      )
      if (exist) {
        exist.amount += convertedTx.amount
        exist.details.push(...convertedTx.details)
      } else {
        convertedTransactions.push(convertedTx)
      }
    }

    return convertedTransactions
  }, [balances, convertCurrencyValue, members, primaryCurrency, sheet.isPresent, transactionsByEvent])

  const present = usePresent()
  const [tx, setTx] = useState<Transaction>()

  const [copied, setCopied] = useState<null | NodeJS.Timeout>(null)

  const [archived] = useRoomArchived(roomId)

  const [tab, setTab] = useState<'minimum' | 'party'>('minimum')

  const txDetailPresent = usePresent()
  const [txDetail, setTxDetail] = useState<TransactionWithDetails>()

  return (
    <Sheet {...sheet}>
      <div className="grid gap-4">
        <Tab
          options={[
            { label: '最小回数で精算', value: 'minimum' },
            { label: 'わかりやすい精算', value: 'party' },
          ]}
          value={tab}
          onChange={setTab}
          disabled={archived}
        ></Tab>
        {tab === 'party' && <Tips>建て替えてもらった相手との間で精算を行います。</Tips>}
        {transactions && transactionsByParty && transactions.length > 0 ? (
          <>
            {tab === 'minimum' ? (
              <div className="grid grid-cols-[auto_auto_auto_1fr] items-center gap-x-[6px] gap-y-2">
                {transactions.map((tx) => (
                  <Fragment key={tx.id}>
                    <div className="grid grid-flow-col items-center justify-start gap-2 pl-1">
                      <span className="text-sm font-bold">{getMemberName(tx.from)}</span>
                      {isMe(tx.from) && <span className="text-xs text-zinc-400">自分</span>}
                    </div>
                    <Icon.ArrowBigRight size={20} className="text-zinc-400"></Icon.ArrowBigRight>
                    <div className="grid grid-flow-col items-center justify-start gap-2">
                      <span className="text-sm font-bold">{getMemberName(tx.to)}</span>
                      {isMe(tx.to) && <span className="text-xs text-zinc-400">自分</span>}
                    </div>
                    <div className="grid justify-end">
                      <Clickable
                        className="grid grid-flow-col items-center gap-1 transition active:scale-90 disabled:active:scale-100"
                        onClick={() => (setTx(tx), present.open())}
                        disabled={archived}
                      >
                        <CurrencyText {...displayCurrency(tx)}></CurrencyText>
                        {!archived && <Icon.ChevronRight size={16} className="text-zinc-300"></Icon.ChevronRight>}
                      </Clickable>
                    </div>
                  </Fragment>
                ))}
              </div>
            ) : tab === 'party' ? (
              <div className="grid grid-cols-[auto_auto_auto_1fr] items-center gap-x-[6px] gap-y-2">
                {transactionsByParty.map((tx) => (
                  <Fragment key={tx.id}>
                    <div className="grid grid-flow-col items-center justify-start gap-2 pl-1">
                      <span className="text-sm font-bold">{getMemberName(tx.from)}</span>
                      {isMe(tx.from) && <span className="text-xs text-zinc-400">自分</span>}
                    </div>
                    <Icon.ArrowBigRight size={20} className="text-zinc-400"></Icon.ArrowBigRight>
                    <div className="grid grid-flow-col items-center justify-start gap-2">
                      <span className="text-sm font-bold">{getMemberName(tx.to)}</span>
                      {isMe(tx.to) && <span className="text-xs text-zinc-400">自分</span>}
                    </div>
                    <div className="grid justify-end">
                      <Clickable
                        className="grid grid-flow-col items-center gap-1 transition active:scale-90 disabled:active:scale-100"
                        onClick={() => (setTx(tx), present.open())}
                        disabled={archived}
                      >
                        <CurrencyText {...displayCurrency(tx)}></CurrencyText>
                        {!archived && <Icon.ChevronRight size={16} className="text-zinc-300"></Icon.ChevronRight>}
                      </Clickable>
                    </div>
                    <Clickable
                      className="col-span-full -mx-1 flex flex-wrap gap-1 overflow-hidden pb-1 pl-1 text-xs text-zinc-400"
                      onClick={() => (setTxDetail(tx), txDetailPresent.open())}
                    >
                      {tx.details.slice(0, 10).map(({ event }) => (
                        <div key={event.id} className="max-w-24 truncate rounded-full bg-surface px-3 py-1">
                          {event.label}
                        </div>
                      ))}
                      {tx.details.length > 10 && (
                        <div className="rounded-full bg-surface px-3 py-1">他{tx.details.length - 10}</div>
                      )}
                    </Clickable>
                  </Fragment>
                ))}
              </div>
            ) : (
              unreachable(tab)
            )}
            {transactionIncludesRateMissingCurrency && (
              <Tips type="default">
                変換レートが設定されていない通貨 ({rateMissingCurrency.join(', ')})
                は、各通貨での精算方法を表示しています。
              </Tips>
            )}
            <div className="grid justify-end">
              <Button
                mini
                variant="secondary"
                icon={copied ? <Icon.Check size={16} /> : <Icon.Copy size={14} className="mx-px" />}
                onClick={() => {
                  const reimburseText = (
                    tab === 'minimum' ? transactions : tab === 'party' ? transactionsByParty : unreachable(tab)
                  )
                    .map((tx) => `${getMemberName(tx.from)} → ${getMemberName(tx.to)} ${displayCurrency(tx).value}`)
                    .join('\n')
                  void navigator.clipboard.writeText(reimburseText).then(() => {
                    if (copied) clearTimeout(copied)
                    setCopied(setTimeout(() => setCopied(null), 3000))
                  })
                }}
              >
                精算方法をコピー
              </Button>
            </div>
          </>
        ) : (
          <div className="ml-[4px] grid h-12 grid-flow-col items-center justify-start gap-1 rounded-xl border-2 border-dotted border-zinc-400 px-4 text-xs text-zinc-400">
            <Icon.Beer size={16}></Icon.Beer>
            全員の精算が完了しました！
          </div>
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
      {txDetail && (
        <Sheet {...txDetailPresent}>
          <div className="grid gap-4">
            <div className="text-xs font-bold text-zinc-400">精算の内訳</div>
            <div className="grid grid-cols-[auto_auto_auto_1fr] items-center gap-x-[6px] gap-y-2">
              <div className="grid grid-flow-col items-center justify-start gap-2">
                <span className="text-sm font-bold">{getMemberName(txDetail.from)}</span>
                {isMe(txDetail.from) && <span className="text-xs text-zinc-400">自分</span>}
              </div>
              <Icon.ArrowBigRight size={20} className="text-zinc-400"></Icon.ArrowBigRight>
              <div className="grid grid-flow-col items-center justify-start gap-2">
                <span className="text-sm font-bold">{getMemberName(txDetail.to)}</span>
                {isMe(txDetail.to) && <span className="text-xs text-zinc-400">自分</span>}
              </div>
              <div className="grid justify-end">
                <div className="grid grid-flow-col items-center gap-1 transition active:scale-90 disabled:active:scale-100">
                  <CurrencyText {...displayCurrency(txDetail)}></CurrencyText>
                </div>
              </div>
            </div>
            <div className="grid grid-flow-row grid-cols-[auto_1fr_auto_auto] items-center gap-x-3 gap-y-2">
              {txDetail.details.map((event) => (
                <TxDetailItem key={event.event.id} detail={event} roomId={roomId}></TxDetailItem>
              ))}
            </div>
          </div>
        </Sheet>
      )}
    </Sheet>
  )
}

function TxDetailItem({ detail, roomId }: { detail: TransactionDetail; roomId: string | null }) {
  const [, { getMemberName }] = useRoomMember(roomId)
  const [, { displayCurrency }] = useRoomCurrencyRate(roomId)
  const payload = useMemo(() => semanticEventPayload(detail.event), [detail.event])

  return (
    <>
      <Avatar mini="xs" name={payload?.paidByMemberId ? getMemberName(payload.paidByMemberId) ?? null : null}></Avatar>
      <div className="text-xs font-bold">{detail.event.label}</div>
      <div className="justify-self-end text-xs text-zinc-400">
        <CurrencyText
          {...(payload ? displayCurrency(payload) : displayCurrency({ currency: DEFAULT_PRIMARY_CURRENCY, amount: 0 }))}
        ></CurrencyText>
        {payload?.type !== 'transfer' && (
          <>
            <span className="text-zinc-400"> / </span>
            {detail.event.members[0] ? (
              <span className="inline-flex max-w-10">
                <div className="truncate">
                  {detail.event.members.length > 1
                    ? `${detail.event.members.length}人`
                    : getMemberName(detail.event.members[0].memberId)}
                </div>
              </span>
            ) : (
              <span className="text-error">0人</span>
            )}
          </>
        )}
      </div>
      <CurrencyText color {...displayCurrency(detail, undefined, 1)}></CurrencyText>
    </>
  )
}
