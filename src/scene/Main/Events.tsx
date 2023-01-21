import type { Event } from '@/hooks/useEvents'
import useEvents from '@/hooks/useEvents'
import useRoomMember from '@/hooks/useRoomMember'
import formatCurrencyNumber from '@/utils/basic/formatCurrencyNumber'
import EventSheet from './EventSheet'
import usePresent from '@/hooks/usePresent'
import Avatar from '@/components/Avatar'
import formatDate from '@/utils/basic/formatDate'

interface Props {
  roomId: string | null
}

export default function Events({ roomId }: Props) {
  const [events] = useEvents(roomId)

  return (
    <div className="grid gap-6 py-2">
      {events?.map((event) => (
        <Item key={event.id ?? event.tmpId} {...event} roomId={roomId}></Item>
      ))}
    </div>
  )
}

function Item({ id, label, payments, members, roomId, createdAt }: Event & Props) {
  const sheet = usePresent()
  const [, { getMemberName }] = useRoomMember(roomId)
  const [, { updateEvent }] = useEvents(roomId)

  return (
    <button
      className="grid grid-cols-[auto_1fr_auto] items-center gap-4 text-left transition active:scale-95 disabled:opacity-30"
      onClick={sheet.open}
      disabled={!id}
    >
      <Avatar mini name={payments[0] ? getMemberName(payments[0].paidByMemberId) ?? null : null}></Avatar>
      <div>
        <div className="font-bold">{label}</div>
        <div className="text-xs text-zinc-400">{formatDate(createdAt)}</div>
      </div>
      <div>
        <span>{formatCurrencyNumber(BigInt(payments[0]?.amount ?? 0), 'JPY')}</span>
        <span className="text-zinc-400"> / </span>
        <span className="text-xs text-zinc-400">{members.length}人</span>
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
