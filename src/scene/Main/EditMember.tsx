import Button from '@/components/Button'
import Sheet from '@/components/Sheet'
import usePresent from '@/hooks/usePresent'
import useRoom from '@/hooks/useRoom'
import useUser from '@/hooks/useUser'
import { useState } from 'react'

interface Props {
  roomId: string | null
}

export default function EditMember({ roomId }: Props) {
  const sheet = usePresent(false)
  const [room, { addMember, removeMember }] = useRoom(roomId)
  const [name, setName] = useState('')
  const [user] = useUser()

  return (
    <>
      <Button onClick={sheet.open}>メンバー</Button>
      <Sheet {...sheet}>
        <ul className="grid gap-2">
          {room?.members.map((v) => (
            <li key={v.id} className="grid grid-flow-col grid-cols-[1fr_auto]">
              <div>{v.user?.name ?? v.name ?? `名無し (${v.id.slice(0, 2)})`}</div>
              {user && v.user?.id !== user.id && <button onClick={() => removeMember(v.id)}>Kick</button>}
            </li>
          ))}
        </ul>
        <input type="text" value={name} onChange={(e) => setName(e.currentTarget.value)} />
        <Button
          onClick={() => {
            setName('')
            void addMember(name)
          }}
        >
          追加
        </Button>
      </Sheet>
    </>
  )
}
