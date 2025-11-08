import type { Event } from '@app/hooks/useEvents'
import useEvents, { semanticEventPayload } from '@app/hooks/useEvents'
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
import { useMemo } from 'react'
import * as Icon from 'lucide-react'
import { DEFAULT_PRIMARY_CURRENCY } from './CurrencySettingSheet'

interface Props {
  roomId: string | null
}

export default function Events({ roomId }: Props) {
  const [events] = useEvents(roomId)

  return (
    <div className="grid gap-6">
      {events?.map((event) => (
        <Item key={event.id ?? event.tmpId} {...event} roomId={roomId} />
      ))}
    </div>
  )
}

function Item({ id, label, payments, members, roomId, createdAt }: Event & Props) {
  const sheet = usePresent()
  const [, { getMemberName }] = useRoomMember(roomId)
  const [, { updateEvent, removeEvent }] = useEvents(roomId)
  const [, { displayCurrency }] = useRoomCurrencyRate(roomId)

  const payload = useMemo(() => semanticEventPayload({ payments, label, members }), [label, members, payments])

  return (
    <>
      <Clickable
        className="grid grid-cols-[1fr_auto] items-center gap-2 text-left transition active:scale-95 disabled:opacity-30"
        onClick={sheet.open}
        disabled={id === null}
      >
        <div className="grid grid-cols-[auto_1fr] gap-4">
          <div className="grid grid-flow-col items-center gap-[6px]">
            <div className="flex items-center">
              <Spinner
                className={clsx(
                  'pointer-events-none text-zinc-400 transition-[margin,opacity]',
                  id === null ? 'mr-2 opacity-100' : 'mr-[-20px] opacity-0',
                )}
              />
              <Avatar mini name={payload?.paidByMemberId ? (getMemberName(payload.paidByMemberId) ?? null) : null} />
            </div>
            {payload?.type === 'transfer' && (
              <>
                <Icon.ChevronsRight size={20} className="text-zinc-400" />
                <Avatar mini name={payload.transferToMemberId ? getMemberName(payload.transferToMemberId) : null} />
              </>
            )}
          </div>
          <div>
            <div className="text-sm font-bold">{label}</div>
            <div className="text-xs text-zinc-400">{formatDate(createdAt)}</div>
          </div>
        </div>
        <div>
          {payload?.amount === 0 ? (
            <span className="text-error text-sm">未入力</span>
          ) : (
            <CurrencyText
              {...(payload
                ? displayCurrency({ currency: payload.currency, amount: payload.amount })
                : displayCurrency({ currency: DEFAULT_PRIMARY_CURRENCY, amount: 0 }))}
            />
          )}
          {payload?.type !== 'transfer' && (
            <>
              <span className="text-zinc-400"> / </span>
              {members[0] ? (
                <span className="inline-flex max-w-10 text-xs text-zinc-400">
                  <div className="truncate">
                    {members.length > 1 ? `${members.length}人` : getMemberName(members[0].memberId)}
                  </div>
                </span>
              ) : (
                <span className="text-error text-xs">0人</span>
              )}
            </>
          )}
        </div>
      </Clickable>
      {id && (
        <EventSheet
          roomId={roomId}
          defaultValue={payload}
          onSubmit={async (v) => {
            if (v.paidByMemberId === null) {
              // 更新時にroom作成がまだなことはないので無視
              unreachable()
            }
            await updateEvent({ ...v, id })
          }}
          onRemove={() => confirm('支払いを削除しますか？') && removeEvent(id)}
          submitLabel="保存"
          {...sheet}
        />
      )}
    </>
  )
}
