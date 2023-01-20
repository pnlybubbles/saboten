import type { Event } from '@/hooks/useEvents'
import useEvents from '@/hooks/useEvents'
import useRoomMember from '@/hooks/useRoomMember'
import formatCurrencyNumber from '@/utils/basic/formatCurrencyNumber'
import isNonNullable from '@/utils/basic/isNonNullable'
import EventSheet from './EventSheet'
import usePresent from '@/hooks/usePresent'

interface Props {
  roomId: string | null
}

export default function Events({ roomId }: Props) {
  const [events] = useEvents(roomId)

  return (
    <div className="grid gap-4 py-2">
      {events?.map((event) => (
        <Item key={event.tmpId} {...event} roomId={roomId}></Item>
      ))}
    </div>
  )
}

function Item({ id, label, payments, members, roomId }: Event & Props) {
  const sheet = usePresent()
  const [, { getMemberName }] = useRoomMember(roomId)
  const [, { updateEvent }] = useEvents(roomId)

  return (
    <button className="text-left transition active:scale-95 disabled:opacity-30" onClick={sheet.open} disabled={!id}>
      <div className="text-xs text-zinc-400">{id}</div>
      <div className="text-lg font-bold">{label}</div>
      <div>
        {payments.map(
          (v) =>
            `${formatCurrencyNumber(BigInt(v.amount), 'JPY')} (by ${getMemberName(v.paidByMemberId) ?? 'unknown'})`,
        )}
      </div>
      <div className="text-zinc-500">
        {members
          .map(({ memberId }) => getMemberName(memberId))
          .filter(isNonNullable)
          .join(', ')}
      </div>
      {id && (
        <EventSheet
          roomId={roomId}
          defaultValue={
            payments[0]
              ? {
                  label,
                  amount: payments[0].amount,
                  memberIds: members.map((v) => v.memberId),
                  paidByMemberId: payments[0].paidByMemberId,
                }
              : undefined
          }
          onSubmit={(v) => updateEvent({ ...v, id })}
          submitLabel="保存"
          {...sheet}
        ></EventSheet>
      )}
    </button>
  )
}
