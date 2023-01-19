import useUser from './hooks/useUser'
import Button from './components/Button'
import Main from './scene/Main'
import unreachable from './utils/basic/unreachable'
import { useState } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import TextField from './components/TextField'
import { uuidToCompressedPrintableString } from './utils/basic/uuidToCompressedPrintableString'

const router = createBrowserRouter([
  {
    path: '/:roomId?',
    element: <Main></Main>,
  },
])

export default function App() {
  const [user] = useUser()

  return (
    <div className="p-8 text-zinc-900 text-base">
      <h1 className="text-lime-600 font-bold text-xl">SABOTEN</h1>
      {user !== null && (
        <div>
          <div>{user.name}</div>
          <div className="text-xs text-zinc-400">user: {user.id}</div>
          <div className="text-xs text-zinc-400">compress: {uuidToCompressedPrintableString(user.id)}</div>
        </div>
      )}
      {user === null ? <Landing></Landing> : <RouterProvider router={router} />}
    </div>
  )
}

function Landing() {
  const [stage, setStage] = useState<'start' | 'create' | 'restore'>('start')

  return stage === 'start' ? (
    <div className="grid gap-4">
      <Button onClick={() => setStage('create')} primary>
        はじめる
      </Button>
      <div>以前に利用したことがある場合は合言葉を使って復元できます</div>
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
    <div className="grid gap-4">
      <div className="grid gap-2">
        <div>自分のニックネームを入力してください</div>
        <div>※個人情報は入力しないでください</div>
      </div>
      <TextField name="name" value={name} onChange={setName} disabled={busy} />
      <Button onClick={create} disabled={busy}>
        旅をはじめる
      </Button>
    </div>
  )
}
