import Button from '@/components/Button'
import Sheet from '@/components/Sheet'
import usePresent from '@/hooks/usePresent'
import useRoom from '@/hooks/useRoom'
import { useState } from 'react'

interface Props {
  roomId: string | null
}

export default function EditMember({ roomId }: Props) {
  const sheet = usePresent(false)
  const [room, { addMember }] = useRoom(roomId)
  const [name, setName] = useState('')

  return (
    <>
      <Button onClick={sheet.open}>メンバー</Button>
      <Sheet {...sheet}>
        {room?.members.map((v) => (
          <div key={v.id}>
            <div>{v.user?.name ?? v.name ?? `名無し (${v.id.slice(0, 2)})`}</div>
          </div>
        ))}
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
