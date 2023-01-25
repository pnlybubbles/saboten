import Avatar from '@/components/Avatar'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import Divider from '@/components/Divider'
import TextField from '@/components/TextField'
import Tips from '@/components/Tips'
import useRoomMember from '@/hooks/useRoomMember'
import useRoomTitle from '@/hooks/useRoomTitle'
import useUser from '@/hooks/useUser'
import unreachable from '@/utils/basic/unreachable'
import clsx from 'clsx'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Join({ roomId }: { roomId: string }) {
  const [roomTitle] = useRoomTitle(roomId)
  const [members, { getMemberName, joinMember }] = useRoomMember(roomId)
  const [selectedMember, setSelectedMember] = useState<string | null | undefined>()
  const [name, setName] = useState('')
  const [user, { setUser }] = useUser()
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  const join = async () => {
    if (selectedMember === undefined) {
      unreachable()
    }
    setBusy(true)
    try {
      const joinUser =
        user ?? (await setUser({ name: (selectedMember ? getMemberName(selectedMember) : null) ?? name }))
      await joinMember(joinUser, selectedMember)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-6 p-8">
      <div className="font-bold">{`"${roomTitle ?? '読込中...'}"に参加します`}</div>
      <div className="text-xs">
        すでにメンバーが設定されている場合には、自分にあたるメンバーを選択して参加することができます
      </div>
      <div className="grid gap-4">
        {members?.map((member) => (
          <button
            onClick={() => member.id && setSelectedMember(member.id)}
            key={member.id ?? member.tmpId}
            className={clsx(
              'm-[-0.5rem] grid grid-flow-col items-center justify-start gap-2 rounded-lg border-2 border-transparent p-2 text-left transition',
              selectedMember === member.id && 'border-zinc-900',
            )}
          >
            <Avatar mini name={getMemberName(member)}></Avatar>
            <div className="font-bold">{getMemberName(member)}</div>
            {member.user && <Badge>参加済み</Badge>}
          </button>
        ))}
        <button
          onClick={() => setSelectedMember(null)}
          className={clsx(
            'm-[-0.5rem] grid grid-cols-[auto_1fr] items-center gap-2 rounded-lg border-2 border-transparent p-2 text-left transition',
            selectedMember === null && 'border-zinc-900',
          )}
        >
          <Avatar mini name={null}></Avatar>
          <div className="text-xs font-bold">新しいメンバーとして参加する</div>
        </button>
      </div>
      {selectedMember === null && user === null && (
        <TextField label="ニックネーム" name="name" value={name} onChange={setName} disabled={busy} />
      )}
      {user && <Tips>{`ニックネーム "${user.name}" として設定済みのユーザーで参加します`}</Tips>}
      <Button
        onClick={join}
        disabled={selectedMember === undefined || (selectedMember === null && user === null && name === '')}
        loading={busy}
        variant="primary"
      >
        参加する
      </Button>
      <Divider></Divider>
      <Button onClick={() => navigate('/')}>参加しない</Button>
    </div>
  )
}
