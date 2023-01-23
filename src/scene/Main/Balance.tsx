import Button from '@/components/Button'
import Icon from '@/components/Icon'
import useEvents from '@/hooks/useEvents'
import useRoomCurrencyRate from '@/hooks/useRoomCurrencyRate'
import useRoomMember from '@/hooks/useRoomMember'
import React, { useState } from 'react'
import CurrencyRateSheet from './CurrencyRateSheet'
import usePresent from '@/hooks/usePresent'
import CurrencyText from '@/components/CurrencyText'

interface Props {
  roomId: string | null
}

export default function Balance({ roomId }: Props) {
  const [, { getMemberName }] = useRoomMember(roomId)
  const [events] = useEvents(roomId)
  const [, { displayCurrency, displayCurrencySum, availableCurrencyFor }] = useRoomCurrencyRate(roomId)

  const totalByCurrency = (events ?? []).reduce((acc, v) => {
    for (const payment of v.payments) {
      acc[payment.currency] ??= BigInt(0)
      acc[payment.currency] += BigInt(payment.amount)
    }
    return acc
  }, {} as { [code: string]: bigint })

  const primaryCurrency =
    (totalByCurrency['JPY'] === undefined || totalByCurrency['JPY'] === BigInt(0)
      ? Object.keys(totalByCurrency)[0]
      : null) ?? 'JPY'

  const totalCurrencyValue = Object.entries(totalByCurrency).map(([currency, amount]) => ({ currency, amount }))

  const availableCurrency = availableCurrencyFor(primaryCurrency)

  const rateMissingTotalCurrencyValue = totalCurrencyValue.filter(
    ({ currency }) => !availableCurrency.includes(currency),
  )

  const rateConvertibleTotalCurrencyValue = Object.entries(totalByCurrency)
    .map(([currency, amount]) => ({ currency, amount }))
    .filter(({ currency }) => availableCurrency.includes(currency))

  const balanceByMemberId = (events ?? []).reduce((acc, v) => {
    const sumByCurrency: { [code: string]: bigint } = {}
    for (const { paidByMemberId, currency, amount } of v.payments) {
      acc[paidByMemberId] ??= {}
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      acc[paidByMemberId]![currency] ??= { paid: BigInt(0), assets: BigInt(0) }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      acc[paidByMemberId]![currency]!.paid += BigInt(amount)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      acc[paidByMemberId]![currency]!.assets += BigInt(amount)

      sumByCurrency[currency] ??= BigInt(0)
      sumByCurrency[currency] += BigInt(amount)
    }

    for (const [code, sum] of Object.entries(sumByCurrency)) {
      const div = sum / BigInt(v.members.length)

      for (const { memberId } of v.members) {
        acc[memberId] ??= {}
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        acc[memberId]![code] ??= { paid: BigInt(0), assets: BigInt(0) }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        acc[memberId]![code]!.assets -= div
      }
    }

    return acc
  }, {} as { [memberId: string]: { [code: string]: { paid: bigint; assets: bigint } } })

  const balances = Object.entries(balanceByMemberId)

  const [currencyRateSheetProps, setCurrencyRateSheetProps] = useState<{
    currency: string
    toCurrency: string
  }>()
  const currencyRateSheet = usePresent()

  return (
    <div className="grid gap-4">
      <div>
        <CurrencyText
          className="text-3xl font-bold"
          {...displayCurrencySum(rateConvertibleTotalCurrencyValue, primaryCurrency)}
        ></CurrencyText>
        {rateMissingTotalCurrencyValue.length > 0 && <span className="ml-1 text-3xl font-bold">+?</span>}
        {rateMissingTotalCurrencyValue.map(({ currency, amount }) => (
          <CurrencyText key={currency} className="ml-2" {...displayCurrency({ amount, currency })}></CurrencyText>
        ))}
      </div>
      <div>
        {rateMissingTotalCurrencyValue.map(({ currency }) => (
          <div
            key={currency}
            className="grid grid-cols-[auto_1fr] gap-1 rounded-lg bg-secondary p-4 text-xs font-bold text-primary"
          >
            <Icon className="mt-[-3px]" name="error" />
            <div className="grid gap-2">
              <div>{`${currency} を ${primaryCurrency} に変換するレートが指定されていないため、通貨別に表記しています`}</div>
              <div className="grid grid-flow-col justify-end gap-2">
                {/* <Button mini variant="secondary">
                  今はしない
                </Button> */}
                <Button
                  mini
                  variant="primary"
                  onClick={() => {
                    setCurrencyRateSheetProps({ currency, toCurrency: primaryCurrency })
                    currencyRateSheet.open()
                  }}
                >
                  指定する
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {currencyRateSheetProps && (
        <CurrencyRateSheet roomId={roomId} {...currencyRateSheetProps} {...currencyRateSheet}></CurrencyRateSheet>
      )}
      {balances.length > 0 && (
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 gap-y-1">
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
                      {...displayCurrency({ amount: balance.paid, currency })}
                    ></CurrencyText>
                    <CurrencyText
                      color
                      className="text-xs opacity-70"
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
    </div>
  )
}
