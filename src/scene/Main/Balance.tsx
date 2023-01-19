import useEvents from '@/hooks/useEvents'
import useRoomMember from '@/hooks/useRoomMember'
import formatCurrencyNumber from '@/utils/basic/formatCurrencyNumber'
import isNonNullable from '@/utils/basic/isNonNullable'
import clsx from 'clsx'
import React from 'react'

interface Props {
  roomId: string | null
}

export default function Balance({ roomId }: Props) {
  const [members, { getMemberName }] = useRoomMember(roomId)
  const [events] = useEvents(roomId)
  const total = events?.reduce(
    (acc, v) => acc + v.payments.map((v) => BigInt(v.amount)).reduce((acc, v) => acc + v, BigInt(0)),
    BigInt(0),
  )
  const balanceByMemberId = events?.reduce(
    (acc, v) => {
      let sum = BigInt(0)
      for (const payment of v.payments) {
        const amount = BigInt(payment.amount)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        acc[payment.paidByMemberId]!.paid += amount
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        acc[payment.paidByMemberId]!.assets += amount
        sum += amount
      }
      const div = sum / BigInt(v.members.length)
      for (const member of v.members) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        acc[member.memberId]!.assets -= div
      }
      return acc
    },
    Object.fromEntries(
      members
        ?.map((v) => v.id)
        .filter(isNonNullable)
        .map((id) => [id, { assets: BigInt(0), paid: BigInt(0) }]) ?? [],
    ),
  )

  return (
    <div className="grid gap-2">
      <div className="font-bold text-3xl">{formatCurrencyNumber(total ?? BigInt(0), 'JPY')}</div>
      {balanceByMemberId && (
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 gap-y-1">
          {Object.entries(balanceByMemberId).map(([memberId, balance]) => (
            <React.Fragment key={memberId}>
              <div className="font-bold">{getMemberName(memberId)}</div>
              <div>{formatCurrencyNumber(balance.paid, 'JPY')}</div>
              <div className={clsx('font-bold', balance.assets > 0 ? 'text-rose-800' : 'text-lime-800')}>
                {balance.assets > 0 ? '-' : '+'}
                {formatCurrencyNumber(balance.assets > 0 ? balance.assets : -balance.assets, 'JPY')}
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
}
