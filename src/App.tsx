import useUser from './hooks/useUser'
import Button from './components/Button'
import Main from './scene/Main'
import unreachable from './utils/basic/unreachable'
import { useState } from 'react'
import { RouterProvider, createBrowserRouter, useNavigate, useParams } from 'react-router-dom'
import TextField from './components/TextField'
import Icon from './components/Icon'
import useRoomTitle from './hooks/useRoomTitle'
import useRoomMember from './hooks/useRoomMember'
import Avatar from './components/Avatar'
import clsx from 'clsx'

const router = createBrowserRouter([
  {
    path: '/:roomId?',
    element: <Routing></Routing>,
  },
])

export default function App() {
  return (
    <div className="min-h-screen p-8 text-base text-zinc-700">
      <RouterProvider router={router} />
    </div>
  )
}

function Routing() {
  const [user] = useUser()

  return user === null ? <Landing></Landing> : <Main></Main>
}

function Landing() {
  const { roomId = null } = useParams()
  const [roomTitle] = useRoomTitle(roomId)
  const [stage, setStage] = useState<'start' | 'create' | 'restore'>('start')
  const navigate = useNavigate()

  return stage === 'start' ? (
    <div className="grid gap-6">
      <div className="text-2xl font-bold text-primary">SABOTEN</div>
      <div>
        <div>シンプルな割り勘アプリ</div>
        <div>旅のお金を記録してかんたんに精算</div>
      </div>
      {roomId !== null && (
        <div className="grid grid-cols-[auto_1fr] items-center gap-1 rounded-lg bg-secondary p-4 text-xs font-bold text-primary">
          <Icon name="group"></Icon>
          <div>{`"${roomTitle ?? '読込中...'}" に招待されました`}</div>
        </div>
      )}
      <Button onClick={() => setStage('create')} primary>
        {roomId ? '参加する' : 'はじめる'}
      </Button>
      <div className="grid grid-cols-[auto_1fr] gap-1 text-xs">
        <Icon name="tips_and_updates" />
        <div>以前に利用したことがある場合は合言葉を使って記録を復元できます</div>
      </div>
      <Button onClick={() => setStage('restore')}>{roomId ? '合言葉を入力して参加する' : '合言葉を入力する'}</Button>
      {roomId !== null && (
        <>
          <div className="border-b border-dashed border-zinc-400"></div>
          <Button onClick={() => navigate('/')}>参加しない</Button>
        </>
      )}
    </div>
  ) : stage === 'create' ? (
    roomId ? (
      <Join roomId={roomId} />
    ) : (
      <Create />
    )
  ) : stage === 'restore' ? (
    <div>
      <div>以前のスクショした合言葉を入力してください</div>
      <TextField onChange={() => void 0} />
    </div>
  ) : (
    unreachable(stage)
  )
}

function Join({ roomId }: { roomId: string }) {
  const [roomTitle] = useRoomTitle(roomId)
  const [members, { getMemberName, joinMember }] = useRoomMember(roomId)
  const [selectedMember, setSelectedMember] = useState<string | null | undefined>()
  const [name, setName] = useState('')
  const [, setUser] = useUser()
  const [busy, setBusy] = useState(false)

  const create = async () => {
    setBusy(true)
    try {
      const user = await setUser({ name: (selectedMember ? getMemberName(selectedMember) : null) ?? name })
      await joinMember(user, selectedMember ?? null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div className="font-bold">{`"${roomTitle ?? '読込中...'}"に参加します`}</div>
      <div className="text-xs">どのメンバーとして参加するかを選択してください</div>
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
            <Avatar mini name={member.user?.name ?? member.name}></Avatar>
            <div className="font-bold">{member.user?.name ?? member.name}</div>
            {member.user && (
              <div className="rounded-md border border-zinc-400 px-1 text-xs text-zinc-400">参加済み</div>
            )}
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
      {selectedMember === null && (
        <TextField label="ニックネーム" name="name" value={name} onChange={setName} disabled={busy} />
      )}
      <Button
        onClick={create}
        disabled={selectedMember === undefined || (selectedMember === null && name === '') || busy}
      >
        参加する
      </Button>
    </div>
  )
}

function Create() {
  const [name, setName] = useState('')
  const [, setUser] = useUser()
  const [busy, setBusy] = useState(false)

  const create = async () => {
    setBusy(true)
    try {
      await setUser({ name })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <div className="font-bold">自分のニックネームを設定します</div>
        <div className="grid grid-cols-[auto_1fr] items-center gap-1 text-xs">
          <Icon name="warning"></Icon>
          <div>個人情報は入力しないでください</div>
        </div>
      </div>
      <TextField label="ニックネーム" name="name" value={name} onChange={setName} disabled={busy} />
      <Button onClick={create} disabled={busy}>
        旅をはじめる
      </Button>
    </div>
  )
}
