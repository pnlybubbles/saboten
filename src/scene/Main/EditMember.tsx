import Avatar from '@/components/Avatar'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import type { SheetProps } from '@/components/Sheet'
import Sheet from '@/components/Sheet'
import TextField from '@/components/TextField'
import useRoomMember from '@/hooks/useRoomMember'
import useUser from '@/hooks/useUser'
import { useState } from 'react'

interface Props extends SheetProps {
  roomId: string | null
}

export default function EditMember({ roomId, ...sheet }: Props) {
  const [members, { addMember, removeMember, getMemberName }] = useRoomMember(roomId)
  const [name, setName] = useState('')
  const [user] = useUser()

  const handleRemove = (id: string | null) => {
    if (id === null) {
      return
    }
    if (!confirm(`"${getMemberName(id) ?? ''}" をメンバーから外します。よろしいですか？`)) {
      return
    }
    void removeMember(id)
  }

  return (
    <Sheet {...sheet}>
      <div className="grid gap-4">
        <div className="font-bold">メンバーを管理する</div>
        <ul className="grid gap-4">
          {members?.map((v) => (
            <li key={v.id} className="grid grid-flow-col grid-cols-[auto_1fr_auto] items-center gap-4">
              <Avatar mini name={v.user?.name ?? v.name}></Avatar>
              <div className="grid grid-flow-col items-center justify-start gap-2">
                <div className="font-bold">{v.user?.name ?? v.name}</div>
                {v.user && (
                  <div className="rounded-md border border-zinc-400 px-1 text-xs text-zinc-400">
                    {v.user.id === user?.id ? '自分' : '参加済み'}
                  </div>
                )}
              </div>
              {user && v.user?.id !== user.id && (
                <button
                  disabled={v.id === null}
                  onClick={() => handleRemove(v.id)}
                  className="grid h-8 w-8 items-center justify-items-center transition active:scale-90 disabled:opacity-30"
                >
                  <Icon name="person_remove"></Icon>
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
  )
}
