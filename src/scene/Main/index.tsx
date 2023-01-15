import Button from '@/components/Button'
import { useState } from 'react'

export default function Main() {
  const [editTitle, setEditTitle] = useState(false)
  const [title, setTitle] = useState('')
  const [presentCreateEventSheet, setPresentCreateEventSheet] = useState(false)

  return (
    <div>
      <button onClick={() => setEditTitle(true)}>{title !== '' ? title : '無名の旅'}</button>
      {editTitle && (
        <input type="text" value={title} onChange={(e) => setTitle(e.currentTarget.value)} className="border" />
      )}
      <div></div>
      <Button onClick={() => setPresentCreateEventSheet(true)}>+</Button>
      {presentCreateEventSheet && <CreateEventSheet></CreateEventSheet>}
    </div>
  )
}

type Balance = {
  amount: number
  fromMemberId: string | null
  participatingMemberIds: string[]
}

function CreateEventSheet() {
  const [label, setLabel] = useState('')
  const [balance, setBalance] = useState<Balance>({
    amount: 0,
    fromMemberId: null,
    participatingMemberIds: [],
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
      <Button>追加する</Button>
    </div>
  )
}
