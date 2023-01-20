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
  console.log(defaultValue)

  const { dirty } = useDirty(
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
    setLabel('')
    setAmount('0')
    onSubmit({
      label,
      amount,
      paidByMemberId: paidByMember ?? userMemberId,
      memberIds: eventMembers,
    })
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
            <div className="grid grid-flow-col">
              {members?.map((member) => (
                <button
                  key={member.tmpId}
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
                    'transition-[margin,opacity,width] disabled:opacity-30',
                    !paidByMemberEditMode && member.id !== paidByMember
                      ? 'pointer-events-none ml-0 w-0 opacity-0'
                      : 'ml-3 w-10 opacity-100',
                  )}
                >
                  <Avatar
                    mini
                    className={clsx(
                      'transition',
                      member.id === paidByMember && paidByMemberEditMode && 'ring-2 ring-zinc-900 ring-offset-2',
                    )}
                    name={member.user?.name ?? member.name}
                  ></Avatar>
                </button>
              )) ?? <Avatar mini name={user.name}></Avatar>}
            </div>
          </TextField>
        </div>
        <div className="grid gap-3 rounded-xl bg-surface px-5 py-4">
          <div className="text-xs font-bold text-zinc-400">割り勘するメンバー</div>
          <div className="grid grid-flow-col justify-start gap-3">
            {members?.map((member) => (
              <button
                key={member.tmpId}
                disabled={member.id === null}
                className="disabled:opacity-30"
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
                <Avatar
                  mini
                  className={clsx(
                    'transition',
                    member.id && eventMembers.includes(member.id) && 'ring-2 ring-zinc-900 ring-offset-2',
                  )}
                  name={member.user?.name ?? member.name}
                ></Avatar>
              </button>
            ))}
          </div>
        </div>
        <Button onClick={handleCreate} primary disabled={label === '' || amount === '' || amount === '0'}>
          {submitLabel}
        </Button>
      </div>
    </Sheet>
  )
}
