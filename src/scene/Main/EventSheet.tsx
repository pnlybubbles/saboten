import React, { useCallback, useState } from 'react'
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
import Icon from '@/components/Icon'
import usePresent from '@/hooks/usePresent'
import cc from 'currency-codes'

interface Props extends SheetProps {
  roomId: string | null
  defaultValue?: EventPayload | undefined
  onSubmit: (payload: EventPayload) => void
  submitLabel: string
  onRemove?: () => void
}

export default function EventSheet({ roomId, defaultValue, onSubmit, submitLabel, onRemove, ...sheet }: Props) {
  const [user] = useUser()
  const [members, { getMemberName }] = useRoomMember(roomId)
  const userMemberId = user ? members?.find((v) => v.user?.id === user.id)?.id ?? null : null

  const [label, setLabel] = useState(defaultValue?.label ?? '')
  const [amount, setAmount] = useState(defaultValue?.amount ?? '')
  const [paidByMember, setPaidByMember] = useState(defaultValue?.paidByMemberId ?? userMemberId)
  const [paidByMemberEditMode, setPaidByMemberEditMode] = useState(false)
  const [eventMembers, setEventMembers] = useState(
    defaultValue?.memberIds ?? (members?.map((v) => v.id) ?? [userMemberId]).filter(isNonNullable),
  )
  const editCurrencySheet = usePresent()
  const [currency, setCurrency] = useState(defaultValue?.currency ?? 'JPY')

  const { dirty, clearDirty } = useDirty(
    useCallback(() => {
      if (!sheet.isPresent) {
        return
      }
      setLabel(defaultValue?.label ?? '')
      setAmount(defaultValue?.amount ?? '')
      setCurrency(defaultValue?.currency ?? 'JPY')
      setPaidByMember(defaultValue?.paidByMemberId ?? userMemberId)
      setEventMembers(defaultValue?.memberIds ?? (members?.map((v) => v.id) ?? [userMemberId]).filter(isNonNullable))
    }, [
      sheet.isPresent,
      defaultValue?.label,
      defaultValue?.amount,
      defaultValue?.currency,
      defaultValue?.paidByMemberId,
      defaultValue?.memberIds,
      userMemberId,
      members,
    ]),
  )

  const handleSubmit = () => {
    if (roomId === null || userMemberId === null) {
      throw new Error('Not implemented')
    }
    onSubmit({
      label,
      amount,
      currency,
      paidByMemberId: paidByMember ?? userMemberId,
      memberIds: eventMembers,
    })
    clearDirty()
    sheet.onPresent(false)
  }

  const handleSelectCurrency = (code: string) => {
    setCurrency(code)
    editCurrencySheet.close()
  }
  console.log(editCurrencySheet.isPresent)

  if (user === null) {
    // TODO: loading
    return <div>ユーザーのニックネーム設定が必要です</div>
  }

  return (
    <Sheet {...sheet}>
      <div className="grid gap-4">
        <TextField label="イベントの名前" name="label" value={label} onChange={dirty(setLabel)} />
        <div className="grid grid-cols-[auto_1fr] gap-3">
          <div
            className={clsx(
              'grid h-18 grid-flow-row content-between rounded-xl border-2 border-transparent bg-surface px-5 pt-[0.975rem] pb-[0.875rem] transition',
              editCurrencySheet.isPresent && 'border-zinc-900',
            )}
            onClick={editCurrencySheet.open}
          >
            <div className="text-xs font-bold text-zinc-400">通貨</div>
            <div>{currency}</div>
          </div>
          <Sheet {...editCurrencySheet}>
            <div className="ml-[-1rem] grid grid-cols-[auto_auto_1fr] items-stretch">
              {cc.codes().map((code) => (
                <React.Fragment key={code}>
                  <div className="grid items-center pr-2">
                    <Icon name="check" className={currency === code ? 'opacity-100' : 'opacity-0'}></Icon>
                  </div>
                  <div className="grid items-center" onClick={() => handleSelectCurrency(code)}>
                    <div>{code}</div>
                  </div>
                  <div className="py-1 pl-2 text-zinc-400" onClick={() => handleSelectCurrency(code)}>
                    {cc.code(code)?.currency}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </Sheet>
          <TextField
            label="支払った金額"
            name="amount"
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={dirty(setAmount)}
          >
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
                  <Avatar mini name={getMemberName(member)}></Avatar>
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
                <Avatar mini name={getMemberName(member)}></Avatar>
              </button>
            ))}
          </div>
        </div>
        <div className={clsx('grid gap-2', onRemove && 'grid-cols-[auto_1fr]')}>
          {onRemove && <Button onClick={onRemove} icon={<Icon name="delete" />} danger></Button>}
          <Button onClick={handleSubmit} disabled={label === '' || amount === '' || amount === '0'}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
