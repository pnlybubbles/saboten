import { useState } from 'react'
import Button from '@/components/Button'
import type { SheetProps } from '@/components/Sheet'
import Sheet from '@/components/Sheet'
import TextField from '@/components/TextField'
import useRoomMember from '@/hooks/useRoomMember'
import useUser from '@/hooks/useUser'
import isNonNullable from '@/utils/basic/isNonNullable'
import type { EventPayload } from '@/hooks/useEvents'

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

  const handleCreate = () => {
    if (roomId === null || userMemberId === null) {
      throw new Error('Not implemented')
    }
    setLabel('')
    setAmount('0')
    onSubmit({
      label,
      amount,
      paidByMemberId: userMemberId,
      memberIds: members?.map((v) => v.id).filter(isNonNullable) ?? [],
    })
    sheet.onPresent(false)
  }

  return (
    <Sheet {...sheet}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <div className="text-sm font-bold">イベントの名前</div>
          <TextField value={label} onChange={setLabel} placeholder="お昼のカオマンガイ" />
        </div>
        <div className="grid gap-2">
          <div className="text-sm font-bold">支払ったお金</div>
          <TextField type="number" value={amount} onChange={setAmount} />
        </div>
        <div className="grid gap-2">
          <div className="text-sm font-bold">割り勘するメンバー</div>
          <div>{members?.map((v) => v.user?.name ?? v.name).join(', ')}</div>
        </div>
        <Button onClick={handleCreate} primary disabled={label === '' || amount === '' || amount === '0'}>
          {submitLabel}
        </Button>
      </div>
    </Sheet>
  )
}
