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
import { useMemo } from 'react'
import * as Icon from 'lucide-react'

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

  const payload = useMemo(
    () =>
      payments[0]
        ? payments[1] &&
          payments[0].currency === payments[1].currency &&
          payments[0].amount + payments[1].amount === 0 &&
          // メンバーが1人の場合は正常系。負の支払いがある場合は支払いの自身の打消が行われているので、支払い元と計上先が同一
          (members.length === 1 && members[0]
            ? payments[0].amount < 0
              ? payments[0].paidByMemberId === members[0].memberId
              : payments[1].paidByMemberId === members[0].memberId
            : // メンバーが0人の場合は何らかのケースで部屋から退室している
              members.length === 0
              ? payments[0].amount < 0
                ? payments[0].paidByMemberId === null
                : payments[1].paidByMemberId === null
              : false)
          ? {
              type: 'transfer' as const,
              label,
              amount: payments[0].amount < 0 ? payments[1].amount : payments[0].amount,
              currency: payments[0].currency,
              // 退室などを起因とした歯抜けのデータがある場合は、不完全な状態でフォームを復元させる
              transferToMemberId: members[0]?.memberId ?? null,
              paidByMemberId: payments[0].amount < 0 ? payments[1].paidByMemberId : payments[0].paidByMemberId,
            }
          : {
              type: 'payment' as const,
              label,
              amount: payments[0].amount,
              currency: payments[0].currency,
              memberIds: members.map((v) => v.memberId),
              paidByMemberId: payments[0].paidByMemberId,
            }
        : undefined,
    [label, members, payments],
  )

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
              ></Spinner>
              <Avatar
                mini
                name={payload?.paidByMemberId ? getMemberName(payload.paidByMemberId) ?? null : null}
              ></Avatar>
            </div>
            {payload?.type === 'transfer' && (
              <>
                <Icon.ChevronsRight size={20} className="text-zinc-400"></Icon.ChevronsRight>
                <Avatar
                  mini
                  name={payload.transferToMemberId ? getMemberName(payload.transferToMemberId) : null}
                ></Avatar>
              </>
            )}
          </div>
          <div>
            <div className="text-sm font-bold">{label}</div>
            <div className="text-xs text-zinc-400">{formatDate(createdAt)}</div>
          </div>
        </div>
        <div>
          <CurrencyText
            {...(payload
              ? displayCurrency({ currency: payload.currency, amount: payload.amount })
              : displayCurrency({ currency: 'JPY', amount: 0 }))}
          ></CurrencyText>
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
                <span className="text-xs text-error">0人</span>
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
          onRemove={() => confirm('イベントを削除しますか？') && removeEvent(id)}
          submitLabel="保存"
          {...sheet}
        ></EventSheet>
      )}
    </>
  )
}
