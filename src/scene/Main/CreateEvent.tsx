import { useState } from 'react'
import Button from '@/components/Button'
import Sheet from '@/components/Sheet'
import usePresent from '@/hooks/usePresent'
import TextField from '@/components/TextField'
import useRoomMember from '@/hooks/useRoomMember'

interface Props {
  roomId: string | null
}

export default function CreateEvent({ roomId }: Props) {
  const createEventSheet = usePresent()
  const [members] = useRoomMember(roomId)

  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('0')

  return (
    <>
      <Button onClick={createEventSheet.open}>イベントを追加</Button>
      <Sheet {...createEventSheet}>
        <div className="grid gap-4">
          <TextField value={label} onChange={setLabel} className="border" placeholder="ラベル" />
          <TextField type="number" value={amount} onChange={setAmount} className="border" />
          <div>{members?.map((v) => v.user?.name ?? v.name).join(',')}</div>
          <Button>追加</Button>
        </div>
      </Sheet>
    </>
  )
}
