import Button from '@/components/Button'
import Sheet from '@/components/Sheet'
import TextField from '@/components/TextField'
import usePresent from '@/hooks/usePresent'
import useRoomMember from '@/hooks/useRoomMember'
import useUser from '@/hooks/useUser'
import { useState } from 'react'

interface Props {
  roomId: string | null
}

export default function EditMember({ roomId }: Props) {
  const sheet = usePresent(false)
  const [members, { addMember, removeMember }] = useRoomMember(roomId)
  const [name, setName] = useState('')
  const [user] = useUser()

  return (
    <>
      <Button onClick={sheet.open}>メンバー</Button>
      <Sheet {...sheet}>
        <div className="grid gap-6">
          <ul className="grid gap-2">
            {members?.map((v) => (
              <li key={v.id} className="grid grid-flow-col grid-cols-[1fr_auto]">
                <div>{v.user?.name ?? v.name ?? `名無し (${v.tmpId.slice(0, 2)})`}</div>
                {user && v.user?.id !== user.id && (
                  <button
                    disabled={v.id === null}
                    onClick={() => v.id && removeMember(v.id)}
                    className="disabled:opacity-30"
                  >
                    Kick
                  </button>
                )}
              </li>
            ))}
          </ul>
          <TextField label="ニックネーム" name="nickname" value={name} onChange={setName} />
          <Button
            onClick={() => {
              setName('')
              void addMember(name)
            }}
            disabled={name === ''}
            primary
          >
            追加
          </Button>
        </div>
      </Sheet>
    </>
  )
}
