import useEvents from '@/hooks/useEvents'
import useRoomMember from '@/hooks/useRoomMember'
import formatCurrencyNumber from '@/utils/basic/formatCurrencyNumber'
import isNonNullable from '@/utils/basic/isNonNullable'

interface Props {
  roomId: string | null
}

export default function Events({ roomId }: Props) {
  const [, { getMemberName }] = useRoomMember(roomId)
  const [events] = useEvents(roomId)

  return (
    <div className="grid gap-4">
      {events?.map((event) => (
        <div key={event.id}>
          <div>{event.id}</div>
          <div className="text-lg font-bold">{event.label}</div>
          <div>
            {event.payments.map(
              (v) =>
                `${formatCurrencyNumber(BigInt(v.amount), 'JPY')} (by ${getMemberName(v.paidByMemberId) ?? 'unknown'})`,
            )}
          </div>
          <div className="text-zinc-500">
            {event.members
              .map(({ memberId }) => getMemberName(memberId))
              .filter(isNonNullable)
              .join(', ')}
          </div>
        </div>
      ))}
    </div>
  )
}
