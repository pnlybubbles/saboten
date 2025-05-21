import { useCallback, useEffect, useState } from 'react'
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
import cc from 'currency-codes'
import Clickable from '@app/components/Clickable'
import { useMemo } from 'react'
import unreachable from '@app/util/unreachable'
import * as Icon from 'lucide-react'
import Tab from '@app/components/Tab'
import useRoomArchived from '@app/hooks/useRoomArchive'
import Tips from '@app/components/Tips'
import CurrencyPicker from '@app/components/CurrencyPicker'
import useRoomCurrency from '@app/hooks/useRoomCurrency'
import { DEFAULT_PRIMARY_CURRENCY } from './CurrencySettingSheet'

type EventPayloadDefault =
  | (Omit<Extract<EventPayload, { type: 'payment' }>, 'paidByMemberId'> & { paidByMemberId: string | null })
  | (Omit<Extract<EventPayload, { type: 'transfer' }>, 'paidByMemberId' | 'transferToMemberId'> & {
      paidByMemberId: string | null
      transferToMemberId: string | null
    })

interface Props extends SheetProps {
  roomId: string | null
  defaultValue?: EventPayloadDefault | undefined
  onSubmit: (payload: EventPayloadAddPhase) => Promise<void>
  submitLabel: string
  onRemove?: () => void
  hideTypeTab?: boolean
  id?: string | undefined
}

export default function EventSheet({
  roomId,
  defaultValue,
  onSubmit,
  submitLabel,
  onRemove,
  hideTypeTab,
  id,
  ...sheet
}: Props) {
  const [user] = useUser()
  const [members, { getMemberName }] = useRoomMember(roomId)
  const userMemberId = user ? members?.find((v) => v.user?.id === user.id)?.id ?? null : null

  const [roomCurrency] = useRoomCurrency(roomId)
  const defaultCurrency = defaultValue?.currency ?? roomCurrency ?? DEFAULT_PRIMARY_CURRENCY
  const defaultCurrencyDigits = cc.code(defaultCurrency)?.digits ?? 0
  const eventMembersCandidate = useMemo(() => members?.map((v) => v.id).filter(isNonNullable) ?? [], [members])
  const defaultEventMembersTmp =
    defaultValue?.type === 'payment'
      ? defaultValue.memberIds
      : defaultValue?.type === 'transfer'
        ? defaultValue.transferToMemberId // 歯抜けデータの場合はnullになる場合がある
        : eventMembersCandidate
  const defaultEventMembers = useMemo(
    () =>
      defaultEventMembersTmp === null
        ? []
        : typeof defaultEventMembersTmp === 'string'
          ? [defaultEventMembersTmp]
          : defaultEventMembersTmp,
    [defaultEventMembersTmp],
  )

  const defaultFormValue = useMemo(
    () => ({
      type: defaultValue?.type ?? 'payment',
      label: defaultValue?.label ?? '',
      amount: defaultValue?.amount ? (defaultValue.amount / 10 ** defaultCurrencyDigits).toString() : '',
      // 歯抜けデータの場合はnullになる場合がある
      paidByMember: defaultValue?.paidByMemberId === undefined ? userMemberId : defaultValue.paidByMemberId,
      eventMembers: defaultEventMembers,
      currency: defaultCurrency,
    }),
    [
      defaultCurrency,
      defaultCurrencyDigits,
      defaultEventMembers,
      defaultValue?.amount,
      defaultValue?.label,
      defaultValue?.paidByMemberId,
      defaultValue?.type,
      userMemberId,
    ],
  )

  const [tab, setTab] = useState<'payment' | 'transfer'>(defaultFormValue.type)
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
    // ex: 1.1 * 100 = 110.00000000000001 ~ 110
    // ex: 4.1 * 100 = 409.99999999999994 ~ 410
    return Math.round(amountNumeric * 10 ** currencyDigits)
  }, [amount, currency])

  const [paidByMemberEditMode, setPaidByMemberEditMode] = useState(false)

  const { dirty, clearDirty, resetIfCleared } = useDirty(
    useCallback(() => {
      setTab(defaultFormValue.type)
      setLabel(defaultFormValue.label)
      setCurrency(defaultFormValue.currency)
      setAmount(defaultFormValue.amount)
      setPaidByMember(defaultFormValue.paidByMember)
      setEventMembers(defaultFormValue.eventMembers)
      setPaidByMemberEditMode(false)
    }, [
      defaultFormValue.amount,
      defaultFormValue.currency,
      defaultFormValue.eventMembers,
      defaultFormValue.label,
      defaultFormValue.paidByMember,
      defaultFormValue.type,
    ]),
  )

  useEffect(() => {
    // シートを閉じるときにリセットしないのは、アニメーション中にリセットされてしまって見た目が悪いため
    // シートが開いたときに編集済みでなければデフォルトに戻す
    if (sheet.isPresent) {
      resetIfCleared()
    }
  }, [resetIfCleared, sheet.isPresent])

  useEffect(() => {
    // 指定されているidが変化した場合は状態を強制的にリセットする
    if (id) {
      clearDirty()
      resetIfCleared()
    }
  }, [clearDirty, id, resetIfCleared])

  const transferToMember = eventMembers.filter((v) => v !== paidByMember)[0]

  const [busy, setBusy] = useState(false)

  const handleSubmit = async () => {
    if (validatedAmountValue === null) {
      throw new Error('Invalid amount')
    }
    if (roomId === null || userMemberId === null) {
      // room作成前の場合はoptimistic updateしないので、リクエストを待つ
      setBusy(true)
      try {
        if (tab === 'payment') {
          await onSubmit({
            type: 'payment',
            label,
            amount: validatedAmountValue,
            currency,
            paidByMemberId: null,
            memberIds: null,
          })
        } else if (tab === 'transfer') {
          await onSubmit({
            type: 'transfer',
            label,
            amount: validatedAmountValue,
            currency,
            paidByMemberId: null,
            transferToMemberId: null,
          })
        } else {
          unreachable(tab)
        }
      } finally {
        setBusy(false)
      }
    } else {
      if (paidByMember === null) {
        throw new Error('"paidByMember" must be updated to be non-null')
      }
      if (tab === 'payment') {
        void onSubmit({
          type: 'payment',
          label,
          amount: validatedAmountValue,
          currency,
          paidByMemberId: paidByMember,
          memberIds: eventMembers,
        })
      } else if (tab === 'transfer') {
        if (transferToMember === undefined) {
          throw new Error('Transfer event must be specify at least 1 "eventMembers"')
        }
        void onSubmit({
          type: 'transfer',
          label,
          amount: validatedAmountValue,
          currency,
          paidByMemberId: paidByMember,
          transferToMemberId: transferToMember,
        })
      } else {
        unreachable(tab)
      }
    }
    clearDirty()
    sheet.onPresent(false)
  }

  const [archived] = useRoomArchived(roomId)

  if (user === null) {
    return null
  }

  return (
    <Sheet {...sheet}>
      <div className="grid gap-4">
        {!hideTypeTab && (
          <Tab
            options={[
              { label: '支払い', value: 'payment' },
              { label: '送金', value: 'transfer' },
            ]}
            value={tab}
            onChange={dirty(setTab)}
            disabled={archived}
            className="w-20"
          ></Tab>
        )}
        <TextField label="イベントの名前" name="label" value={label} onChange={dirty(setLabel)} disabled={archived} />
        <div className="grid grid-cols-[auto_1fr] gap-3">
          <CurrencyPicker
            roomId={roomId}
            value={currency}
            onChange={setCurrency}
            className="grid h-18 grid-flow-row content-between rounded-xl bg-surface px-5 pb-2.5 pt-[0.85rem] text-start transition disabled:opacity-40 aria-expanded:shadow-focus"
            disabled={archived}
          >
            <div className="text-xs font-bold text-zinc-400">通貨</div>
            <div className="text-base">{currency}</div>
          </CurrencyPicker>
          <TextField
            label={tab === 'payment' ? '支払った金額' : '送金した金額'}
            name="amount"
            type="float"
            inputMode="decimal"
            value={amount}
            onChange={dirty(setAmount)}
            disabled={archived}
            className="group"
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
                              'box-content rounded-full border-2 p-[2px] transition-[margin,opacity,border-color,transform] active:scale-90 disabled:opacity-30',
                              'mx-1 w-9 opacity-100 first:ml-0 last:mr-0',
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
                          'box-content rounded-full border-2 border-transparent p-[2px] transition-[margin,opacity,border-color,transform] active:scale-90 disabled:opacity-30',
                          paidByMemberEditMode || member.id === paidByMember
                            ? 'w-9 opacity-100'
                            : // width: 2.25rem + border: 2px * 2 + padding: 2px * 2
                              'pointer-events-none ml-[calc(-2.25rem-8px)] opacity-0',
                          member.id === paidByMember && 'mx-1 border-zinc-900 first:ml-0 last:mr-0',
                          'group-aria-disabled:border-transparent',
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
        <div
          className="group grid gap-3 rounded-xl bg-surface px-5 py-4 aria-disabled:pointer-events-none aria-disabled:opacity-40"
          aria-disabled={archived}
        >
          <div className="text-xs font-bold text-zinc-400">
            {tab === 'payment' ? '割り勘するメンバー' : '送金先のメンバー'}
          </div>
          <div className="ml-[-4px] flex flex-wrap justify-start gap-1">
            {members?.map(
              (member) =>
                (tab !== 'transfer' || member.id !== paidByMember) && (
                  <Clickable
                    key={member.id ?? member.tmpId}
                    disabled={member.id === null}
                    className={clsx(
                      'rounded-full border-2 border-transparent p-[2px] transition active:scale-90 disabled:opacity-30',
                      'group-aria-disabled:border-transparent',
                      member.id &&
                        (tab === 'payment'
                          ? // 支払いのイベントの場合は複数選択可能
                            eventMembers.includes(member.id)
                          : tab === 'transfer'
                            ? // 送金イベントの場合は最初の選択のみ使う
                              transferToMember === member.id
                            : unreachable(tab))
                        ? 'border-zinc-900'
                        : 'group-aria-disabled:hidden',
                    )}
                    onClick={() => {
                      if (member.id === null) {
                        return
                      }
                      if (tab === 'payment') {
                        if (eventMembers.includes(member.id)) {
                          setEventMembers((v) => v.filter((w) => w !== member.id))
                        } else {
                          setEventMembers((v) => [...v, member.id].filter(isNonNullable).filter(isUnique))
                        }
                      } else if (tab === 'transfer') {
                        setEventMembers([member.id])
                      } else {
                        unreachable(tab)
                      }
                    }}
                  >
                    <Avatar mini noNegative name={getMemberName(member)}></Avatar>
                  </Clickable>
                ),
            ) ??
              (tab === 'transfer' ? null : (
                <div className="rounded-full border-2 border-zinc-900 p-[2px]">
                  <Avatar mini noNegative name={user.name}></Avatar>
                </div>
              ))}
            <div className="ml-[4px] hidden h-12 items-center rounded-xl border-2 border-dotted border-zinc-400 px-4 text-xs text-zinc-400 first:grid">
              選択できるメンバーがいません
            </div>
          </div>
        </div>
        <div className={clsx('grid gap-2', onRemove && !archived && 'grid-cols-[auto_1fr]')}>
          {onRemove && !archived && (
            <Button onClick={onRemove} icon={<Icon.Trash2 size={20} />} variant="danger"></Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={
              label === '' ||
              validatedAmountValue === null ||
              (eventMembersCandidate.length > 0 && eventMembers.length === 0) ||
              (tab === 'transfer' && transferToMember === undefined) ||
              (roomId !== null && paidByMember === null) ||
              archived
            }
            loading={busy}
          >
            {archived ? 'アーカイブ済み' : submitLabel}
          </Button>
        </div>
        <Tips type={Icon.FlagTriangleRight} className={clsx(!archived && 'hidden')}>
          設定からアーカイブを解除することで編集できるようになります。
        </Tips>
      </div>
    </Sheet>
  )
}
