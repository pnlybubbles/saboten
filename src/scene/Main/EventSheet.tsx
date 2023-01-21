import { useCallback, useState } from 'react'
import Button from '@/components/Button'
import type { SheetProps } from '@/components/Sheet'
import Sheet from '@/components/Sheet'
import TextField from '@/components/TextField'
import useRoomMember from '@/hooks/useRoomMember'
import useUser from '@/hooks/useUser'
import isNonNullable from '@/utils/basic/isNonNullable'
import type { EventPayload } from '@/hooks/useEvents'
import Avatar from '@/components/Avatar'
import clsx from 'clsx'
import useDirty from '@/hooks/useDirty'
import isUnique from '@/utils/basic/isUnique'

interface Props extends SheetProps {
  roomId: string | null
  defaultValue?: EventPayload | undefined
  onSubmit: (payload: EventPayload) => void
  submitLabel: string
}

export default function EventSheet({ roomId, defaultValue, onSubmit, submitLabel, ...sheet }: Props) {
  const [user] = useUser()
  const [members] = useRoomMember(roomId)
  const userMemberId = user ? members?.find((v) => v.user?.id === user.id)?.id ?? null : null

  const [label, setLabel] = useState(defaultValue?.label ?? '')
  const [amount, setAmount] = useState(defaultValue?.amount ?? '0')
  const [paidByMember, setPaidByMember] = useState(defaultValue?.paidByMemberId ?? userMemberId)
  const [paidByMemberEditMode, setPaidByMemberEditMode] = useState(false)
  const [eventMembers, setEventMembers] = useState(
    defaultValue?.memberIds ?? (members?.map((v) => v.id) ?? [userMemberId]).filter(isNonNullable),
  )

  const { dirty, clearDirty } = useDirty(
    useCallback(() => {
      setLabel(defaultValue?.label ?? '')
      setAmount(defaultValue?.amount ?? '0')
      setPaidByMember(defaultValue?.paidByMemberId ?? userMemberId)
      setEventMembers(defaultValue?.memberIds ?? (members?.map((v) => v.id) ?? [userMemberId]).filter(isNonNullable))
    }, [
      defaultValue?.amount,
      defaultValue?.label,
      defaultValue?.memberIds,
      defaultValue?.paidByMemberId,
      members,
      userMemberId,
    ]),
  )

  const handleCreate = () => {
    if (roomId === null || userMemberId === null) {
      throw new Error('Not implemented')
    }
    onSubmit({
      label,
      amount,
      paidByMemberId: paidByMember ?? userMemberId,
      memberIds: eventMembers,
    })
    clearDirty()
    sheet.onPresent(false)
  }

  if (user === null) {
    // TODO: loading
    return <div>ユーザーのニックネーム設定が必要です</div>
  }

  return (
    <Sheet {...sheet}>
      <div className="grid gap-4">
        <TextField label="イベントの名前" name="label" value={label} onChange={dirty(setLabel)} />
        <div className="grid grid-cols-[1fr_auto] gap-1">
          <TextField label="支払った金額" name="amount" type="number" value={amount} onChange={dirty(setAmount)}>
            <div className="mr-[-4px] flex justify-end">
              {members?.map((member) => (
                <button
                  key={member.id ?? member.tmpId}
                  onClick={() => {
                    if (paidByMemberEditMode) {
                      setPaidByMember(member.id)
                      setPaidByMemberEditMode(false)
                    } else {
                      setPaidByMemberEditMode(true)
                    }
                  }}
                  disabled={member.id === null}
                  className={clsx(
                    'box-content rounded-full border-2 border-transparent p-[2px] transition-[margin,opacity,border-color] disabled:opacity-30',
                    paidByMemberEditMode || member.id === paidByMember
                      ? 'ml-1 w-10 opacity-100'
                      : 'ml-[calc(-2.5rem-8px)] opacity-0',
                    member.id === paidByMember && 'border-zinc-900',
                  )}
                >
                  <Avatar mini name={member.user?.name ?? member.name}></Avatar>
                </button>
              )) ?? <Avatar mini name={user.name}></Avatar>}
            </div>
          </TextField>
        </div>
        <div className="grid gap-3 rounded-xl bg-surface px-5 py-4">
          <div className="text-xs font-bold text-zinc-400">割り勘するメンバー</div>
          <div className="ml-[-4px] grid grid-flow-col justify-start gap-1">
            {members?.map((member) => (
              <button
                key={member.id ?? member.tmpId}
                disabled={member.id === null}
                className={clsx(
                  'rounded-full border-2 border-transparent p-[2px] transition disabled:opacity-30',
                  member.id && eventMembers.includes(member.id) && 'border-zinc-900',
                )}
                onClick={() => {
                  if (member.id === null) {
                    return
                  }
                  if (eventMembers.includes(member.id)) {
                    setEventMembers((v) => v.filter((w) => w !== member.id))
                  } else {
                    setEventMembers((v) => [...v, member.id].filter(isNonNullable).filter(isUnique))
                  }
                }}
              >
                <Avatar mini name={member.user?.name ?? member.name}></Avatar>
              </button>
            ))}
          </div>
        </div>
        <Button onClick={handleCreate} disabled={label === '' || amount === '' || amount === '0'}>
          {submitLabel}
        </Button>
      </div>
    </Sheet>
  )
}
