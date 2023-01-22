import Icon from '@/components/Icon'
import useEvents from '@/hooks/useEvents'
import useRoomCurrencyRate from '@/hooks/useRoomCurrencyRate'
import useRoomMember from '@/hooks/useRoomMember'
import clsx from 'clsx'
import React from 'react'

interface Props {
  roomId: string | null
}

export default function Balance({ roomId }: Props) {
  const [, { getMemberName }] = useRoomMember(roomId)
  const [events] = useEvents(roomId)
  const [, { displayCurrency }] = useRoomCurrencyRate(roomId)

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

  return (
    <div className="grid gap-2">
      <div>
        <span className="text-3xl font-bold tabular-nums">
          {displayCurrency({
            amount: totalByCurrency[primaryCurrency] ?? BigInt(0),
            currency: primaryCurrency,
          })}
        </span>
        {Object.entries(totalByCurrency)
          .filter(([code]) => code !== primaryCurrency)
          .map(([code, total]) => (
            <span key={code} className="ml-2 tabular-nums">
              {displayCurrency({ amount: total, currency: code })}
            </span>
          ))}
      </div>
      {balances.length > 0 && (
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 gap-y-1">
          {balances.map(([memberId, balanceByCurrency]) =>
            Object.entries(balanceByCurrency)
              .sort(([a], [b]) => (a === primaryCurrency ? -1 : b === primaryCurrency ? 1 : 0))
              .map(([currency, balance]) => (
                <React.Fragment key={`${memberId}_${currency}`}>
                  <div className="font-bold">{getMemberName(memberId)}</div>
                  <div className="text-right tabular-nums">{displayCurrency({ amount: balance.paid, currency })}</div>
                  <div
                    className={clsx(
                      'flex items-center justify-end font-bold tabular-nums',
                      balance.assets > 0 ? 'text-rose-500' : 'text-lime-600',
                    )}
                  >
                    {balance.assets > 0 ? (
                      <Icon className="mt-[-2px]" name="remove" />
                    ) : (
                      <Icon className="mt-[-2px]" name="add" />
                    )}
                    {displayCurrency({
                      amount: balance.assets > 0 ? balance.assets : -balance.assets,
                      currency,
                    })}
                  </div>
                </React.Fragment>
              )),
          )}
        </div>
      )}
    </div>
  )
}
