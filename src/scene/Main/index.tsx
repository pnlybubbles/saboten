import Button from '@/components/Button'
import Sheet from '@/components/Sheet'
import usePresent from '@/hooks/usePresent'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import EditMember from './EditMember'
import useRoomTitle from '@/hooks/useRoomTitle'
import TitleInput from './TitleInput'

export default function Main() {
  const createEventSheet = usePresent()
  const { roomId = null } = useParams()
  const [title, setTitle] = useRoomTitle(roomId)

  return (
    <div className="grid gap-4">
      <div>{roomId ?? 'id-not-created'}</div>
      <TitleInput defaultValue={title} onChange={setTitle}></TitleInput>
      <EditMember roomId={roomId}></EditMember>
      <Button onClick={createEventSheet.open}>イベントを追加</Button>
      <Sheet {...createEventSheet}>
        <CreateEvent></CreateEvent>
      </Sheet>
    </div>
  )
}

type Balance = {
  amount: number
  byMemberId: string | null
  forMemberIds: string[]
}

function CreateEvent() {
  const [label, setLabel] = useState('')
  const [balance, setBalance] = useState<Balance>({
    amount: 0,
    byMemberId: null,
    forMemberIds: [],
  })

  return (
    <div>
      <textarea value={label} onChange={(e) => setLabel(e.currentTarget.value)} className="border" />
      <input
        type="number"
        value={balance.amount}
        onChange={(e) => setBalance((v) => ({ ...v, amount: parseInt(e.target.value) }))}
        className="border"
      />
      <Button>追加</Button>
    </div>
  )
}
