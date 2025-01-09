import Avatar from '@app/components/Avatar'
import Button from '@app/components/Button'
import Clickable from '@app/components/Clickable'
import Divider from '@app/components/Divider'
import TextField from '@app/components/TextField'
import Tips from '@app/components/Tips'
import useRoomMember from '@app/hooks/useRoomMember'
import useRoomTitle from '@app/hooks/useRoomTitle'
import useUser from '@app/hooks/useUser'
import unreachable from '@app/util/unreachable'
import clsx from 'clsx'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Icon from 'lucide-react'
import ScreenShots from './Screenshots'

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
    <div className="mx-auto grid max-w-screen-sm gap-6 p-8">
      <div className="font-bold">{`"${roomTitle ?? '読込中...'}"に参加します`}</div>
      <div className="text-xs">
        すでにメンバーが設定されている場合には、自分にあたるメンバーを選択して参加することができます
      </div>
      <div className="grid gap-4">
        {members?.map((member) => (
          <Clickable
            onClick={() => member.id && setSelectedMember(member.id)}
            key={member.id ?? member.tmpId}
            className={clsx(
              '-m-2 grid grid-flow-col items-center justify-start gap-4 rounded-lg border-2 border-transparent px-3 py-2 text-left transition active:scale-95',
              selectedMember === member.id && 'border-zinc-900',
            )}
          >
            <Avatar mini name={getMemberName(member)}></Avatar>
            <div className="grid grid-flow-col items-center gap-2">
              <div className="text-sm font-bold">{getMemberName(member)}</div>
              {member.user && <span className="text-xs text-zinc-400">参加済み</span>}
            </div>
          </Clickable>
        ))}
        <Clickable
          onClick={() => setSelectedMember(null)}
          className={clsx(
            '-m-2 grid grid-cols-[auto_1fr] items-center gap-4 rounded-lg border-2 border-transparent px-3 py-2 text-left transition active:scale-95',
            selectedMember === null && 'border-zinc-900',
          )}
        >
          <Avatar mini name={null}></Avatar>
          <div className="text-sm font-bold">新しいメンバーとして参加</div>
        </Clickable>
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
        参加
      </Button>
      <Divider></Divider>
      <Button onClick={() => navigate('/')}>参加しない</Button>
      <div className="grid justify-center py-2">
        <Icon.Asterisk size={20} className="text-zinc-400" />
      </div>
      <ScreenShots></ScreenShots>
    </div>
  )
}
