import Button from '@app/components/Button'
import useEvents from '@app/hooks/useEvents'
import useRoomCurrencyRate from '@app/hooks/useRoomCurrencyRate'
import useRoomMember from '@app/hooks/useRoomMember'
import React, { useReducer, useRef, useState } from 'react'
import CurrencyRateSheet from './CurrencyRateSheet'
import usePresent from '@app/hooks/usePresent'
import CurrencyText from '@app/components/CurrencyText'
import clsx from 'clsx'
import Clickable from '@app/components/Clickable'
import isNonNullable from '@app/util/isNonNullable'
import useResizeObserver from '@app/hooks/useResizeObserver'
import * as Icon from 'lucide-react'
import Tips from '@app/components/Tips'

interface Props {
  roomId: string | null
}

export default function Balance({ roomId }: Props) {
  const [, { getMemberName }] = useRoomMember(roomId)
  const [rawEvents] = useEvents(roomId)
  const [, { displayCurrency, displayCurrencySum, availableCurrencyFor }] = useRoomCurrencyRate(roomId)

  // 支払い者が離脱している場合は累計の計算から除外する
  const events =
    rawEvents?.map((v) => ({
      ...v,
      payments: v.payments
        .map((payment) =>
          payment.paidByMemberId !== null ? { ...payment, paidByMemberId: payment.paidByMemberId } : null,
        )
        .filter(isNonNullable),
    })) ?? []

  const totalByCurrency = events.reduce(
    (acc, v) => {
      for (const payment of v.payments) {
        acc[payment.currency] ??= 0
        acc[payment.currency] += payment.amount
      }
      return acc
    },
    {} as { [code: string]: number },
  )

  const primaryCurrency =
    (totalByCurrency['JPY'] === undefined || totalByCurrency['JPY'] === 0 ? Object.keys(totalByCurrency)[0] : null) ??
    'JPY'

  const totalCurrencyValue = Object.entries(totalByCurrency).map(([currency, amount]) => ({ currency, amount }))

  const availableCurrency = availableCurrencyFor(primaryCurrency)

  const rateMissingTotalCurrencyValue = totalCurrencyValue.filter(
    ({ currency }) => !availableCurrency.includes(currency),
  )

  const rateConvertibleTotalCurrencyValue = Object.entries(totalByCurrency)
    .map(([currency, amount]) => ({ currency, amount }))
    .filter(({ currency }) => availableCurrency.includes(currency))

  const balanceByMemberId = (events ?? []).reduce(
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
  )

  const balances = Object.entries(balanceByMemberId)

  const [currencyRateSheetProps, setCurrencyRateSheetProps] = useState<{
    currency: string
    toCurrency: string
  }>()
  const currencyRateSheet = usePresent()

  const [showDetail, setShowDetail] = useState(false)

  const ref = useRef<HTMLDivElement>(null)
  const { height } = useResizeObserver(ref)

  const [isPresentTip, toggleTip] = useReducer((v) => !v, true)

  return (
    <div className="-mx-1 -mb-6 grid overflow-hidden px-1 after:block after:h-6 after:bg-gradient-to-b after:from-transparent after:to-white">
      <Clickable
        onClick={() => totalCurrencyValue.length > 0 && setShowDetail((v) => !v)}
        className="group z-[1] grid grid-flow-col items-center justify-between bg-gradient-to-t from-transparent to-white"
      >
        <div className="text-left transition group-active:scale-95">
          <CurrencyText
            className="text-3xl font-bold"
            {...displayCurrencySum(rateConvertibleTotalCurrencyValue, primaryCurrency)}
          ></CurrencyText>
          {rateMissingTotalCurrencyValue.length > 0 && <span className="ml-1 mr-2 text-3xl font-bold">+?</span>}
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
          <div className="grid grid-flow-col items-center text-zinc-400">
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
          'transition-[height,opacity] duration-300',
          !showDetail && 'pointer-events-none !h-0 opacity-0',
        )}
        style={height ? { height } : {}}
      >
        <div ref={ref} className="grid gap-4 before:block">
          {rateMissingTotalCurrencyValue.map(({ currency }) => (
            <div
              key={currency}
              className="grid grid-cols-[auto_1fr] gap-1 rounded-lg p-4 text-xs text-error shadow-emboss"
            >
              <Icon.AlertCircle size={20} className="mt-[-3px]" />
              <div className="grid gap-2">
                <div>{`${currency} を ${primaryCurrency} に変換するレートが設定されていないため、通貨別に表記しています`}</div>
                <div className="grid grid-flow-col justify-end gap-2">
                  {/* <Button mini variant="secondary">
                  今はしない
                </Button> */}
                  <Button
                    mini
                    onClick={() => {
                      setCurrencyRateSheetProps({ currency, toCurrency: primaryCurrency })
                      currencyRateSheet.open()
                    }}
                    variant="secondary"
                  >
                    設定
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {currencyRateSheetProps && (
            <CurrencyRateSheet roomId={roomId} {...currencyRateSheetProps} {...currencyRateSheet}></CurrencyRateSheet>
          )}
          {balances.length > 0 && (
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 gap-y-1" onClick={toggleTip}>
              {balances.map(([memberId, balanceByCurrency]) => [
                <React.Fragment key={memberId}>
                  <div className="font-bold">{getMemberName(memberId)}</div>
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
                ...Object.entries(balanceByCurrency)
                  .filter(([currency]) => availableCurrency.includes(currency))
                  .sort(([a], [b]) => (a === primaryCurrency ? -1 : b === primaryCurrency ? 1 : 0))
                  .map(([currency, balance], _, array) =>
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
                ...Object.entries(balanceByCurrency)
                  .filter(([currency]) => !availableCurrency.includes(currency))
                  .sort(([a], [b]) => (a === primaryCurrency ? -1 : b === primaryCurrency ? 1 : 0))
                  .map(([currency, balance]) => (
                    <React.Fragment key={`${memberId}_${currency}`}>
                      <div className="font-bold">{getMemberName(memberId)}</div>
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
              <span className="font-bold">黒文字</span>は使った合計金額、
              <span className="font-bold text-lime-600">緑文字</span>
              は多く支払いすぎている金額、<span className="font-bold text-rose-500">赤文字</span>
              は誰かに建て替えてもらっている金額になります。
            </Tips>
          )}
        </div>
      </div>
    </div>
  )
}
