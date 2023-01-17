import Button from '@/components/Button'
import Sheet from '@/components/Sheet'
import usePresent from '@/hooks/usePresent'
import trpc from '@/utils/trpc'
import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function Main() {
  const ref = useRef<HTMLInputElement>(null)
  const [editTitle, setEditTitle] = useState(false)
  const [title, setTitle] = useState('')
  const createEventSheet = usePresent()
  const navigate = useNavigate()
  const { roomId } = useParams()

  const updateTitle = async () => {
    setEditTitle(false)
    const { id } = await trpc.room.title.mutate({ value: title, id: roomId })
    navigate(`/${id}`)
  }

  return (
    <div>
      <div>{roomId ?? 'id-not-created'}</div>
      <button
        onClick={() => {
          setEditTitle(true)
          ref.current?.focus()
        }}
      >
        {title !== '' ? title : '無名の旅'}
      </button>
      {editTitle && (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          onBlur={updateTitle}
          className="border"
          ref={ref}
        />
      )}
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
