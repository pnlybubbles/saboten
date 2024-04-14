import type { Event } from '@app/hooks/useEvents'
import useEvents from '@app/hooks/useEvents'
import useRoomMember from '@app/hooks/useRoomMember'
import EventSheet from './EventSheet'
import usePresent from '@app/hooks/usePresent'
import Avatar from '@app/components/Avatar'
import formatDate from '@app/util/formatDate'
import useRoomCurrencyRate from '@app/hooks/useRoomCurrencyRate'
import CurrencyText from '@app/components/CurrencyText'
import Spinner from '@app/components/Spinner'
import clsx from 'clsx'
import Clickable from '@app/components/Clickable'
import unreachable from '@app/util/unreachable'

interface Props {
  roomId: string | null
}

export default function Events({ roomId }: Props) {
  const [events] = useEvents(roomId)

  return (
    <div className="grid gap-6">
      {events?.map((event) => <Item key={event.id ?? event.tmpId} {...event} roomId={roomId}></Item>)}
    </div>
  )
}

function Item({ id, label, payments, members, roomId, createdAt }: Event & Props) {
  const sheet = usePresent()
  const [, { getMemberName }] = useRoomMember(roomId)
  const [, { updateEvent, removeEvent }] = useEvents(roomId)
  const [, { displayCurrency }] = useRoomCurrencyRate(roomId)

  return (
    <>
      <Clickable
        className="grid grid-cols-[auto_1fr_auto] items-center gap-4 text-left transition active:scale-95 disabled:opacity-30"
        onClick={sheet.open}
        disabled={id === null}
      >
        <div className="flex items-center">
          <Spinner
            className={clsx(
              'pointer-events-none text-zinc-400 transition-[margin,opacity]',
              id === null ? 'mr-2 opacity-100' : 'mr-[-20px] opacity-0',
            )}
          ></Spinner>
          <Avatar
            mini
            name={payments[0]?.paidByMemberId ? getMemberName(payments[0].paidByMemberId) ?? null : null}
          ></Avatar>
        </div>
        <div>
          <div className="font-bold">{label}</div>
          <div className="text-xs text-zinc-400">{formatDate(createdAt)}</div>
        </div>
        <div>
          <CurrencyText
            {...(payments[0]
              ? displayCurrency({ currency: payments[0].currency, amount: payments[0].amount })
              : displayCurrency({ currency: 'JPY', amount: 0 }))}
          ></CurrencyText>
          <span className="text-zinc-400"> / </span>
          {members[0] ? (
            <span className="inline-flex max-w-10 text-xs text-zinc-400">
              <div className="truncate">
                {members.length > 1 ? `${members.length}人` : getMemberName(members[0].memberId)}
              </div>
            </span>
          ) : (
            <span className="text-xs text-error">0人</span>
          )}
        </div>
      </Clickable>
      {id && (
        <EventSheet
          roomId={roomId}
          defaultValue={
            payments[0]
              ? {
                  label,
                  amount: payments[0].amount,
                  currency: payments[0].currency,
                  memberIds: members.map((v) => v.memberId),
                  paidByMemberId: payments[0].paidByMemberId,
                }
              : undefined
          }
          onSubmit={async (v) => {
            if (v.paidByMemberId === null) {
              // 更新時にroom作成がまだなことはないので無視
              unreachable()
            }
            await updateEvent({ ...v, id })
          }}
          onRemove={() => confirm('イベントを削除しますか？') && removeEvent(id)}
          submitLabel="保存"
          {...sheet}
        ></EventSheet>
      )}
    </>
  )
}
