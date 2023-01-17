import Button from '@/components/Button'
import Sheet from '@/components/Sheet'
import usePresent from '@/hooks/usePresent'
import useRoom from '@/hooks/useRoom'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import EditMember from './EditMember'

export default function Main() {
  const createEventSheet = usePresent()
  const { roomId } = useParams()
  const [room, { setTitle }] = useRoom(roomId ?? null)

  return (
    <div className="grid gap-4">
      <div>{roomId ?? 'id-not-created'}</div>
      <TitleInput defaultValue={room?.title} onChange={setTitle}></TitleInput>
      <EditMember roomId={roomId ?? null}></EditMember>
      <Button onClick={createEventSheet.open}>イベントを追加</Button>
      <Sheet {...createEventSheet}>
        <CreateEvent></CreateEvent>
      </Sheet>
    </div>
  )
}

const PLACEHOLDER_STRING = '無名の旅'

function TitleInput({
  defaultValue,
  onChange,
}: {
  defaultValue: string | undefined
  onChange: (title: string) => void
}) {
  const [edit, setEdit] = useState(false)
  const [title, setTitle] = useState(defaultValue ?? '')

  const isDirty = useRef(false)

  useEffect(() => {
    if (isDirty.current) {
      return
    }
    setTitle(defaultValue ?? '')
  }, [defaultValue, edit])

  return edit ? (
    <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.currentTarget.value)}
      onBlur={() => {
        onChange(title)
        setEdit(false)
      }}
      className="border"
      placeholder={PLACEHOLDER_STRING}
      autoFocus
    />
  ) : (
    <button
      className={title === '' ? 'text-gray-500' : ''}
      onClick={() => {
        setEdit(true)
        isDirty.current = true
      }}
    >
      {title !== '' ? title : PLACEHOLDER_STRING}
    </button>
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
