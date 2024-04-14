import { useCallback, useState } from 'react'
import Button from '@app/components/Button'
import type { SheetProps } from '@app/components/Sheet'
import Sheet from '@app/components/Sheet'
import TextField from '@app/components/TextField'
import useRoomMember from '@app/hooks/useRoomMember'
import useUser from '@app/hooks/useUser'
import isNonNullable from '@app/util/isNonNullable'
import type { EventPayload, EventPayloadAddPhase } from '@app/hooks/useEvents'
import Avatar from '@app/components/Avatar'
import clsx from 'clsx'
import useDirty from '@app/hooks/useDirty'
import isUnique from '@app/util/isUnique'
import usePresent from '@app/hooks/usePresent'
import cc from 'currency-codes'
import Clickable from '@app/components/Clickable'
import { useMemo } from 'react'
import unreachable from '@app/util/unreachable'
import * as Icon from 'lucide-react'
import useRoomCurrencyRate from '@app/hooks/useRoomCurrencyRate'

type EventPayloadDefault = Omit<EventPayload, 'paidByMemberId'> & {
  paidByMemberId: string | null
}

interface Props extends SheetProps {
  roomId: string | null
  defaultValue?: EventPayloadDefault | undefined
  onSubmit: (payload: EventPayloadAddPhase) => Promise<void>
  submitLabel: string
  onRemove?: () => void
}

const FREQUENTLY_USED_CURRENCY_CODES = ['JPY', 'USD', 'EUR']

export default function EventSheet({ roomId, defaultValue, onSubmit, submitLabel, onRemove, ...sheet }: Props) {
  const [user] = useUser()
  const [members, { getMemberName }] = useRoomMember(roomId)
  const userMemberId = user ? members?.find((v) => v.user?.id === user.id)?.id ?? null : null

  const defaultCurrency = defaultValue?.currency ?? 'JPY'
  const defaultCurrencyDigits = cc.code(defaultCurrency)?.digits ?? 0
  const eventMembersCandidate = useMemo(() => members?.map((v) => v.id).filter(isNonNullable) ?? [], [members])
  const defaultFormValue = useMemo(
    () => ({
      label: defaultValue?.label ?? '',
      amount: defaultValue?.amount ? (defaultValue.amount / 10 ** defaultCurrencyDigits).toString() : '',
      paidByMember: defaultValue?.paidByMemberId === undefined ? userMemberId : defaultValue.paidByMemberId,
      eventMembers: defaultValue?.memberIds ?? eventMembersCandidate,
      currency: defaultCurrency,
    }),
    [
      defaultCurrency,
      defaultCurrencyDigits,
      defaultValue?.amount,
      defaultValue?.label,
      defaultValue?.memberIds,
      defaultValue?.paidByMemberId,
      eventMembersCandidate,
      userMemberId,
    ],
  )
  const [label, setLabel] = useState(defaultFormValue.label)
  const [amount, setAmount] = useState(defaultFormValue.amount)
  const [paidByMember, setPaidByMember] = useState(defaultFormValue.paidByMember)
  const [eventMembers, setEventMembers] = useState(defaultFormValue.eventMembers)
  const [currency, setCurrency] = useState(defaultFormValue.currency)
  const validatedAmountValue = useMemo(() => {
    const currencyDigits = cc.code(currency)?.digits
    if (currencyDigits === undefined) return null
    if (amount === '') return null
    const amountNumeric = parseFloat(amount)
    if (isNaN(amountNumeric) || amountNumeric === 0) return null
    // 通貨単位によって有効な少数桁数をチェックする
    const dot = amount.indexOf('.')
    if (dot !== -1) {
      const fractionDigits = amount.length - dot - 1
      if (fractionDigits > currencyDigits) return null
    }
    // 整数に変換
    return amountNumeric * 10 ** currencyDigits
  }, [amount, currency])

  const editCurrencySheet = usePresent()
  const [paidByMemberEditMode, setPaidByMemberEditMode] = useState(false)

  const { dirty, clearDirty } = useDirty(
    useCallback(() => {
      if (!sheet.isPresent) {
        return
      }
      setLabel(defaultFormValue.label)
      setCurrency(defaultFormValue.currency)
      setAmount(defaultFormValue.amount)
      setPaidByMember(defaultFormValue.paidByMember)
      setEventMembers(defaultFormValue.eventMembers)
    }, [
      defaultFormValue.amount,
      defaultFormValue.currency,
      defaultFormValue.eventMembers,
      defaultFormValue.label,
      defaultFormValue.paidByMember,
      sheet.isPresent,
    ]),
  )

  const [busy, setBusy] = useState(false)

  const handleSubmit = async () => {
    if (validatedAmountValue === null) {
      throw new Error('Invalid amount')
    }
    if (roomId === null || userMemberId === null) {
      // room作成前の場合はoptimistic updateしないので、リクエストを待つ
      setBusy(true)
      try {
        await onSubmit({
          label,
          amount: validatedAmountValue,
          currency,
          paidByMemberId: null,
          memberIds: null,
        })
      } finally {
        setBusy(false)
      }
    } else {
      if (paidByMember === null) {
        throw new Error('"paidByMember" must be updated to be non-null')
      }
      void onSubmit({
        label,
        amount: validatedAmountValue,
        currency,
        paidByMemberId: paidByMember,
        memberIds: eventMembers,
      })
    }
    clearDirty()
    sheet.onPresent(false)
  }

  const [roomCurrencyRate] = useRoomCurrencyRate(roomId)
  const recentlyUsedCurrencyCodes = useMemo(() => roomCurrencyRate?.map((v) => v.currency) ?? [], [roomCurrencyRate])

  const handleSelectCurrency = (code: string) => {
    setCurrency(code)
    editCurrencySheet.close()
  }

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
              'grid h-18 grid-flow-row content-between rounded-xl bg-surface px-5 pb-[0.625rem] pt-[0.85rem] transition',
              editCurrencySheet.isPresent && 'shadow-focus',
            )}
            onClick={editCurrencySheet.open}
          >
            <div className="text-xs font-bold text-zinc-400">通貨</div>
            <div className="text-base">{currency}</div>
          </div>
          <Sheet {...editCurrencySheet}>
            <div className="grid gap-2">
              <div className="text-xs font-bold">よく使う</div>
              <div className="grid grid-cols-[auto_auto_1fr] items-stretch">
                {[...recentlyUsedCurrencyCodes, ...FREQUENTLY_USED_CURRENCY_CODES].filter(isUnique).map((code) => (
                  <EditCurrencyItem
                    key={code}
                    code={code}
                    onClick={() => handleSelectCurrency(code)}
                    active={currency === code}
                  ></EditCurrencyItem>
                ))}
              </div>
              <div className="text-xs font-bold">すべて</div>
              <div className="grid grid-cols-[auto_auto_1fr] items-stretch">
                {cc.codes().map((code) => (
                  <EditCurrencyItem
                    key={code}
                    code={code}
                    onClick={() => handleSelectCurrency(code)}
                    active={currency === code}
                  ></EditCurrencyItem>
                ))}
              </div>
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
            <div className="flex">
              <div className="w-4 bg-gradient-to-l from-surface"></div>
              <div className="mr-[-4px] flex justify-end bg-surface">
                {members ? (
                  [
                    ...(paidByMember === null && !paidByMemberEditMode
                      ? [
                          <Clickable
                            key="null"
                            onClick={() => {
                              if (!paidByMemberEditMode) {
                                setPaidByMemberEditMode(true)
                              }
                            }}
                            className={clsx(
                              'box-content rounded-full border-2 p-[2px] transition-[margin,opacity,border-color] active:scale-90 disabled:opacity-30',
                              'mx-1 w-10 opacity-100 first:ml-0 last:mr-0',
                              'border-zinc-900',
                            )}
                          >
                            <Avatar mini noNegative name={null}></Avatar>
                          </Clickable>,
                        ]
                      : []),
                    ...members.map((member) => (
                      <Clickable
                        key={member.id ?? member.tmpId}
                        onClick={() => {
                          if (member.id === null) {
                            unreachable()
                          }
                          if (paidByMemberEditMode) {
                            setPaidByMember(member.id)
                            setPaidByMemberEditMode(false)
                          } else {
                            setPaidByMemberEditMode(true)
                          }
                        }}
                        disabled={member.id === null}
                        className={clsx(
                          'box-content rounded-full border-2 border-transparent p-[2px] transition-[margin,opacity,border-color] active:scale-90 disabled:opacity-30',
                          paidByMemberEditMode || member.id === paidByMember
                            ? 'w-10 opacity-100'
                            : // width: 2.5rem + border: 2px * 2 + padding: 2px * 2
                              'ml-[calc(-2.5rem-8px)] opacity-0',
                          member.id === paidByMember && 'mx-1 border-zinc-900 first:ml-0 last:mr-0',
                        )}
                      >
                        <Avatar mini noNegative name={getMemberName(member)}></Avatar>
                      </Clickable>
                    )),
                  ]
                ) : (
                  <div className="rounded-full border-2 border-zinc-900 p-[2px]">
                    <Avatar mini noNegative name={user.name}></Avatar>
                  </div>
                )}
              </div>
            </div>
          </TextField>
        </div>
        <div className="grid gap-3 rounded-xl bg-surface px-5 py-4">
          <div className="text-xs font-bold text-zinc-400">割り勘するメンバー</div>
          <div className="ml-[-4px] grid grid-flow-col justify-start gap-1">
            {members?.map((member) => (
              <Clickable
                key={member.id ?? member.tmpId}
                disabled={member.id === null}
                className={clsx(
                  'rounded-full border-2 border-transparent p-[2px] transition active:scale-90 disabled:opacity-30',
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
                <Avatar mini noNegative name={getMemberName(member)}></Avatar>
              </Clickable>
            )) ?? (
              <div className="rounded-full border-2 border-zinc-900 p-[2px]">
                <Avatar mini noNegative name={user.name}></Avatar>
              </div>
            )}
          </div>
        </div>
        <div className={clsx('grid gap-2', onRemove && 'grid-cols-[auto_1fr]')}>
          {onRemove && <Button onClick={onRemove} icon={<Icon.Trash2 size={20} />} variant="danger"></Button>}
          <Button
            onClick={handleSubmit}
            disabled={
              label === '' ||
              validatedAmountValue === null ||
              (eventMembersCandidate.length > 0 && eventMembers.length === 0) ||
              (roomId !== null && paidByMember === null)
            }
            loading={busy}
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </Sheet>
  )
}

function EditCurrencyItem({ code, onClick, active }: { code: string; onClick: () => void; active: boolean }) {
  return (
    <>
      <div className="grid items-center pr-2">
        <Icon.Check size={20} className={active ? 'opacity-100' : 'opacity-0'} />
      </div>
      <Clickable className="grid items-center text-left" onClick={onClick}>
        <div>{code}</div>
      </Clickable>
      <Clickable className="py-1 pl-2 text-left text-zinc-400" onClick={onClick}>
        {cc.code(code)?.currency}
      </Clickable>
    </>
  )
}
