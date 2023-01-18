import { useState } from 'react'
import Button from '@/components/Button'
import Sheet from '@/components/Sheet'
import usePresent from '@/hooks/usePresent'
import TextField from '@/components/TextField'
import useRoomMember from '@/hooks/useRoomMember'
import useEvents from '@/hooks/useEvents'
import useUser from '@/hooks/useUser'
import isNonNullable from '@/utils/basic/isNonNullable'

interface Props {
  roomId: string | null
}

export default function CreateEvent({ roomId }: Props) {
  const createEventSheet = usePresent()
  const [user] = useUser()
  const [members] = useRoomMember(roomId)
  const userMemberId = user ? members?.find((v) => v.user?.id === user.id)?.id ?? null : null

  const [, { addEvent }] = useEvents(roomId)

  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('0')

  const handleCreate = () => {
    if (roomId === null || userMemberId === null) {
      throw new Error('Not implemented')
    }
    setLabel('')
    setAmount('0')
    void addEvent({
      label,
      amount,
      paidByMemberId: userMemberId,
      memberIds: members?.map((v) => v.id).filter(isNonNullable) ?? [],
    })
    createEventSheet.close()
  }

  return (
    <>
      <Button onClick={createEventSheet.open}>イベントを追加</Button>
      <Sheet {...createEventSheet}>
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
            追加
          </Button>
        </div>
      </Sheet>
    </>
  )
}
