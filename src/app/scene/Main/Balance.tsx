import Button from '@app/components/Button'
import useEvents, { filterEventsForAggregation } from '@app/hooks/useEvents'
import useRoomCurrencyRate from '@app/hooks/useRoomCurrencyRate'
import useRoomMember from '@app/hooks/useRoomMember'
import React, { useMemo, useReducer, useRef, useState } from 'react'
import usePresent from '@app/hooks/usePresent'
import CurrencyText from '@app/components/CurrencyText'
import clsx from 'clsx'
import Clickable from '@app/components/Clickable'
import isNonNullable from '@app/util/isNonNullable'
import useResizeObserver from '@app/hooks/useResizeObserver'
import * as Icon from 'lucide-react'
import Tips from '@app/components/Tips'
import Reimburse from './Reimburse'
import useRoomCurrency from '@app/hooks/useRoomCurrency'
import { DEFAULT_PRIMARY_CURRENCY } from './CurrencySettingSheet'

interface Props {
  roomId: string | null
}

export default function Balance({ roomId }: Props) {
  const [members, { getMemberName }] = useRoomMember(roomId)
  const [rawEvents] = useEvents(roomId)
  const [, { displayCurrency, displayCurrencySum, availableCurrencyFor }] = useRoomCurrencyRate(roomId)

  const events = useMemo(() => filterEventsForAggregation(rawEvents), [rawEvents])

  const totalByCurrency = useMemo(
    () =>
      events.reduce(
        (acc, v) => {
          for (const payment of v.payments) {
            acc[payment.currency] ??= 0
            acc[payment.currency] += payment.amount
          }
          return acc
        },
        {} as { [code: string]: number },
      ),
    [events],
  )

  const [roomCurrency] = useRoomCurrency(roomId)

  const primaryCurrency =
    roomCurrency ??
    (totalByCurrency[DEFAULT_PRIMARY_CURRENCY] === undefined || totalByCurrency[DEFAULT_PRIMARY_CURRENCY] === 0
      ? Object.keys(totalByCurrency)[0]
      : null) ??
    DEFAULT_PRIMARY_CURRENCY

  const totalCurrencyValue = useMemo(
    () => Object.entries(totalByCurrency).map(([currency, amount]) => ({ currency, amount })),
    [totalByCurrency],
  )

  const availableCurrency = useMemo(
    () => availableCurrencyFor(primaryCurrency),
    [availableCurrencyFor, primaryCurrency],
  )

  const rateMissingTotalCurrencyValue = useMemo(
    () => totalCurrencyValue.filter(({ currency }) => !availableCurrency.includes(currency)),
    [availableCurrency, totalCurrencyValue],
  )

  const rateMissingCurrency = useMemo(
    () => rateMissingTotalCurrencyValue.map(({ currency }) => currency),
    [rateMissingTotalCurrencyValue],
  )

  const rateConvertibleTotalCurrencyValue = useMemo(
    () =>
      Object.entries(totalByCurrency)
        .map(([currency, amount]) => ({ currency, amount }))
        .filter(({ currency }) => availableCurrency.includes(currency)),
    [availableCurrency, totalByCurrency],
  )

  const balanceByMemberId = useMemo(
    () =>
      (events ?? []).reduce(
        (acc, v) => {
          const sumByCurrency: { [code: string]: number } = {}
          for (const { paidByMemberId, currency, amount } of v.payments) {
            acc[paidByMemberId] ??= {}
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            acc[paidByMemberId]![currency] ??= { paid: 0, assets: 0 }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            acc[paidByMemberId]![currency]!.paid += amount
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            acc[paidByMemberId]![currency]!.assets += amount

            sumByCurrency[currency] ??= 0
            sumByCurrency[currency] += amount
          }

          for (const [code, sum] of Object.entries(sumByCurrency)) {
            const div = sum / v.members.length

            for (const { memberId } of v.members) {
              acc[memberId] ??= {}
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              acc[memberId]![code] ??= { paid: 0, assets: 0 }
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              acc[memberId]![code]!.assets -= div
            }
          }

          return acc
        },
        {} as { [memberId: string]: { [code: string]: { paid: number; assets: number } } },
      ),
    [events],
  )

  const assetsAggregatedByCalculatedBalance = useMemo(
    () =>
      Object.entries(balanceByMemberId).reduce(
        (acc, [memberId, v]) => {
          for (const [code, { assets }] of Object.entries(v)) {
            acc[code] ??= { fraction: 0, max: assets, maxMemberId: memberId }
            // 各+-の値が表示される金額と一致するように四捨五入して、累計値を出すことで端数を計算する
            acc[code]!.fraction += Math.round(assets)
            // 最大の支払金額を持っているユーザーをチェックする
            // 仕様として、端数は最大の支払金額を持っているユーザーにまとめることで
            // 割り勘している各ユーザーごとの支払金額をできるだけ均等に保つことができてシンプルになるケースが多い
            // ただし、最大の支払いをしている人は端数だけ損してしまうが、シンプルさを優先する
            if (acc[code]!.max < assets) {
              acc[code]!.max = assets
              acc[code]!.maxMemberId = memberId
            }
          }
          return acc
        },
        {} as { [code: string]: { fraction: number; max: number; maxMemberId: string } },
      ),
    [balanceByMemberId],
  )

  const memberIds = useMemo(() => members?.map((v) => v.id).filter(isNonNullable) ?? [], [members])
  const balances = useMemo(
    () =>
      Object.entries(balanceByMemberId)
        .map(([memberId, balanceByCurrency]) => {
          const fractionConsideredBalanceByCurrency = Object.fromEntries(
            Object.entries(balanceByCurrency).map(([code, { paid, assets }]) => {
              // 最大の支払額を持っているユーザーで端数の調整
              // 例: 1000円 を 3人 で割り勘しているケースでは、
              // 支払っている人が 334円 の端数込みが自分の消費、
              // それ以外の2人が 333円 を建て替えてもらっている状態になる
              const aggregated = assetsAggregatedByCalculatedBalance[code]
              if (aggregated?.maxMemberId !== memberId) {
                return [code, { paid, assets: Math.round(assets) }] as const
              }
              return [code, { paid, assets: Math.round(assets) - aggregated.fraction }] as const
            }),
          )
          return [memberId, fractionConsideredBalanceByCurrency] as const
        })
        .sort(([a], [b]) => memberIds.indexOf(a) - memberIds.indexOf(b)),
    [assetsAggregatedByCalculatedBalance, balanceByMemberId, memberIds],
  )

  const [showDetail_, setShowDetail] = useState(false)
  const showDetail = showDetail_ && totalCurrencyValue.length > 0

  const ref = useRef<HTMLDivElement>(null)
  const { height } = useResizeObserver(ref)

  const [isPresentTip, toggleTip] = useReducer((v) => !v, false)

  const reimburseSheet = usePresent()

  return (
    <div className="relative z-0">
      <div className="-mx-1 -mb-6 grid overflow-hidden px-1 after:block after:h-6 after:overflow-hidden after:rounded-b-xl after:bg-gradient-to-b after:from-transparent after:to-white">
        <Clickable
          onClick={() => totalCurrencyValue.length > 0 && setShowDetail((v) => !v)}
          className="group z-[1] grid grid-flow-col items-center justify-between bg-gradient-to-t from-transparent to-white"
        >
          <div className="text-left transition group-active:scale-95">
            <CurrencyText
              className="text-3xl font-bold"
              {...displayCurrencySum(rateConvertibleTotalCurrencyValue, primaryCurrency)}
            ></CurrencyText>
            {rateMissingTotalCurrencyValue.length > 0 && <span className="ml-1 mr-2 text-3xl font-bold">+</span>}
            <span className="mt-1 inline-block">
              {rateMissingTotalCurrencyValue.map(({ currency, amount }) => (
                <CurrencyText
                  key={currency}
                  className="[&:not(:last-child)]:mr-2"
                  {...displayCurrency({ amount, currency })}
                ></CurrencyText>
              ))}
            </span>
          </div>
          {totalCurrencyValue.length > 0 && (
            <div className="grid grid-flow-col items-center gap-2 text-zinc-400">
              {/* <div className="text-xs">{showDetail ? '閉じる' : '詳細'}</div> */}
              <Icon.ChevronDown
                size={20}
                className={clsx('transition', showDetail ? 'rotate-180' : '')}
              ></Icon.ChevronDown>
            </div>
          )}
        </Clickable>
        <div
          className={clsx(
            'relative transition-[height,opacity] duration-300',
            !showDetail && 'pointer-events-none !h-0 opacity-0',
          )}
          style={height ? { height } : {}}
        >
          <div ref={ref} className="grid gap-4 before:block">
            {balances.length > 0 && (
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-2 gap-y-1">
                {balances.map(([memberId, balanceByCurrency]) => [
                  <React.Fragment key={memberId}>
                    <div className="text-sm font-bold">{getMemberName(memberId)}</div>
                    <CurrencyText
                      className="text-right"
                      {...displayCurrencySum(
                        Object.entries(balanceByCurrency)
                          .map(([currency, balance]) => ({ amount: balance.paid, currency }))
                          .filter((v) => availableCurrency.includes(v.currency)),
                        primaryCurrency,
                      )}
                    ></CurrencyText>
                    <CurrencyText
                      color
                      className="font-bold"
                      {...displayCurrencySum(
                        Object.entries(balanceByCurrency)
                          .map(([currency, balance]) => ({ amount: balance.assets, currency }))
                          .filter((v) => availableCurrency.includes(v.currency)),
                        primaryCurrency,
                      )}
                    ></CurrencyText>
                  </React.Fragment>,
                  // 通貨ごとの内訳 (表示用通貨に変換可能なもの)
                  ...Object.entries(balanceByCurrency)
                    .filter(([currency]) => availableCurrency.includes(currency))
                    .sort(([a], [b]) => (a === primaryCurrency ? -1 : b === primaryCurrency ? 1 : 0))
                    .map(([currency, balance], _, array) =>
                      // 唯一使われている通貨が表示用通貨の場合は表示しない
                      array.length <= 1 && currency === primaryCurrency ? null : (
                        <React.Fragment key={`${memberId}_${currency}`}>
                          <div className="text-xs opacity-0">{getMemberName(memberId)}</div>
                          <CurrencyText
                            className="text-xs opacity-70"
                            signSize={12}
                            {...displayCurrency({ amount: balance.paid, currency })}
                          ></CurrencyText>
                          <CurrencyText
                            color
                            className="text-xs opacity-70"
                            signSize={12}
                            {...displayCurrency({ amount: balance.assets, currency })}
                          ></CurrencyText>
                        </React.Fragment>
                      ),
                    ),
                  // 通貨ごとの内訳 (変換不可能なもの)
                  ...Object.entries(balanceByCurrency)
                    .filter(([currency]) => !availableCurrency.includes(currency))
                    .sort(([a], [b]) => (a === primaryCurrency ? -1 : b === primaryCurrency ? 1 : 0))
                    .map(([currency, balance]) => (
                      <React.Fragment key={`${memberId}_${currency}`}>
                        <div className="text-sm font-bold opacity-0">{getMemberName(memberId)}</div>
                        <CurrencyText
                          className="text-right"
                          {...displayCurrency({ amount: balance.paid, currency })}
                        ></CurrencyText>
                        <CurrencyText
                          color
                          className="font-bold"
                          {...displayCurrency({ amount: balance.assets, currency })}
                        ></CurrencyText>
                      </React.Fragment>
                    )),
                ])}
              </div>
            )}
            {isPresentTip && (
              <Tips onClick={toggleTip} type={Icon.PiggyBank}>
                <span className="font-bold">黒文字</span>は支払った合計金額、
                <span className="font-bold text-lime-600">緑文字</span>
                は多く支払いすぎている金額、<span className="font-bold text-rose-500">赤文字</span>
                は誰かに建て替えてもらっている金額になります。
              </Tips>
            )}
          </div>
        </div>
      </div>
      <div
        className={clsx(
          'absolute -bottom-6 right-2 grid translate-y-1/2 grid-flow-col gap-3 transition',
          showDetail ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <Button
          mini
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation()
            toggleTip()
          }}
          icon={<Icon.HelpCircle size={16} />}
        ></Button>
        {members && members.length > 1 && (
          <Button
            mini
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation()
              reimburseSheet.open()
            }}
            icon={
              primaryCurrency === 'JPY' ? (
                <Icon.ReceiptJapaneseYen size={16} />
              ) : primaryCurrency === 'USD' ? (
                <Icon.Receipt size={16} />
              ) : primaryCurrency === 'EUR' ? (
                <Icon.ReceiptEuro size={16} />
              ) : primaryCurrency === 'GBP' ? (
                <Icon.ReceiptPoundSterling size={16} />
              ) : primaryCurrency === 'INR' ? (
                <Icon.ReceiptIndianRupee size={16} />
              ) : primaryCurrency === 'RUB' ? (
                <Icon.ReceiptRussianRuble size={16} />
              ) : primaryCurrency === 'CHF' ? (
                <Icon.ReceiptSwissFranc size={16} />
              ) : (
                <Icon.Receipt size={16} />
              )
            }
          >
            精算
          </Button>
        )}
        {roomId && (
          <Reimburse
            {...reimburseSheet}
            roomId={roomId}
            balances={balances}
            primaryCurrency={primaryCurrency}
            rateMissingCurrency={rateMissingCurrency}
          ></Reimburse>
        )}
      </div>
    </div>
  )
}
