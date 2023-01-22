import Icon from '@/components/Icon'
import useEvents from '@/hooks/useEvents'
import useRoomMember from '@/hooks/useRoomMember'
import formatCurrencyNumber from '@/utils/basic/formatCurrencyNumber'
import clsx from 'clsx'
import React from 'react'

interface Props {
  roomId: string | null
}

export default function Balance({ roomId }: Props) {
  const [, { getMemberName }] = useRoomMember(roomId)
  const [events] = useEvents(roomId)

  const totalByCurrency = (events ?? []).reduce((acc, v) => {
    for (const payment of v.payments) {
      acc[payment.currency] ??= BigInt(0)
      acc[payment.currency] += BigInt(payment.amount)
    }
    return acc
  }, {} as { [code: string]: bigint })

  const primaryCurrency =
    totalByCurrency['JPY'] === undefined || totalByCurrency['JPY'] === BigInt(0)
      ? Object.keys(totalByCurrency)[0]
      : 'JPY'

  const balanceByMemberId = (events ?? []).reduce((acc, v) => {
    let sum = BigInt(0)
    for (const payment of v.payments) {
      const amount = payment.currency === primaryCurrency ? BigInt(payment.amount) : BigInt(0)
      acc[payment.paidByMemberId] ??= { paid: BigInt(0), assets: BigInt(0) }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      acc[payment.paidByMemberId]!.paid += amount
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      acc[payment.paidByMemberId]!.assets += amount
      sum += amount
    }
    const div = sum / BigInt(v.members.length)
    for (const member of v.members) {
      acc[member.memberId] ??= { paid: BigInt(0), assets: BigInt(0) }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      acc[member.memberId]!.assets -= div
    }
    return acc
  }, {} as { [memberId: string]: { paid: bigint; assets: bigint } })

  const visibleBalances = Object.entries(balanceByMemberId).filter(
    ([, balance]) => balance.assets !== BigInt(0) || balance.paid !== BigInt(0),
  )

  return (
    <div className="grid gap-2">
      <div>
        <span className="text-3xl font-bold tabular-nums">
          {formatCurrencyNumber(
            (primaryCurrency ? totalByCurrency[primaryCurrency] : null) ?? BigInt(0),
            primaryCurrency ?? 'JPY',
          )}
        </span>
        {Object.entries(totalByCurrency)
          .filter(([code]) => code !== primaryCurrency)
          .map(([code, total]) => (
            <span key={code} className="ml-2 tabular-nums">
              {formatCurrencyNumber(total, code)}
            </span>
          ))}
      </div>
      {visibleBalances.length > 0 && (
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 gap-y-1">
          {visibleBalances.map(([memberId, balance]) => (
            <React.Fragment key={memberId}>
              <div className="font-bold">{getMemberName(memberId)}</div>
              <div className="text-right tabular-nums">
                {formatCurrencyNumber(balance.paid, primaryCurrency ?? 'JPY')}
              </div>
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
                {formatCurrencyNumber(balance.assets > 0 ? balance.assets : -balance.assets, primaryCurrency ?? 'JPY')}
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
}
