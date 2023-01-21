import useUser from './hooks/useUser'
import Button from './components/Button'
import Main from './scene/Main'
import unreachable from './utils/basic/unreachable'
import { useState } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import TextField from './components/TextField'
import Icon from './components/Icon'

const router = createBrowserRouter([
  {
    path: '/:roomId?',
    element: <Main></Main>,
  },
])

export default function App() {
  const [user] = useUser()

  return (
    <div className="min-h-screen p-8 text-base text-zinc-700">
      {user === null ? <Landing></Landing> : <RouterProvider router={router} />}
    </div>
  )
}

function Landing() {
  const [stage, setStage] = useState<'start' | 'create' | 'restore'>('start')

  return stage === 'start' ? (
    <div className="grid gap-6">
      <div className="text-2xl font-bold text-primary">SABOTEN</div>
      <div>
        <div>シンプルな割り勘アプリ</div>
        <div>旅のお金を記録してかんたんに精算</div>
      </div>
      <Button onClick={() => setStage('create')} primary>
        はじめる
      </Button>
      <div className="grid grid-cols-[auto_1fr] gap-1 text-xs">
        <Icon name="tips_and_updates" />
        <div>以前に利用したことがある場合は合言葉を使って記録を復元できます</div>
      </div>
      <Button onClick={() => setStage('restore')}>合言葉を入力する</Button>
    </div>
  ) : stage === 'create' ? (
    <Create></Create>
  ) : stage === 'restore' ? (
    <div>
      <div>以前のスクショした合言葉を入力してください</div>
      <TextField onChange={() => void 0} />
    </div>
  ) : (
    unreachable(stage)
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
