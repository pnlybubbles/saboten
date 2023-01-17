import useUser from './hooks/useUser'
import Button from './components/Button'
import Main from './scene/Main'
import unreachable from './utils/basic/unreachable'
import { useState } from 'react'
import trpc from './utils/trpc'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/:roomId?',
    element: <Main></Main>,
  },
])

export default function App() {
  const [user] = useUser()

  const refresh = () => {
    void trpc.user.refresh.mutate()
  }

  return (
    <div className="p-4">
      <h1 className="text-lime-600 font-bold text-xl">SABOTEN</h1>
      {user !== null && (
        <div>
          <div>
            {user.name} ({user.id})
          </div>
        </div>
      )}
      {user === null ? <Landing></Landing> : <RouterProvider router={router} />}
      <Button onClick={refresh}>refresh</Button>
    </div>
  )
}

function Landing() {
  const [stage, setStage] = useState<'start' | 'create' | 'restore'>('start')

  return stage === 'start' ? (
    <div>
      <Button onClick={() => setStage('create')}>はじめる</Button>
      <div>以前に利用したことがある場合は合言葉を使って復元できます</div>
      <Button onClick={() => setStage('restore')}>合言葉を入力する</Button>
    </div>
  ) : stage === 'create' ? (
    <Create></Create>
  ) : stage === 'restore' ? (
    <div>
      <div>以前のスクショした合言葉を入力してください</div>
      <input type="text" />
    </div>
  ) : (
    unreachable(stage)
  )
}

function Create() {
  const [name, setName] = useState('')
  const [, setUser] = useUser()

  const create = () => {
    void setUser({ name })
  }

  return (
    <div>
      <div>自分のニックネームを入力してください</div>
      <div>※個人情報は入力しないでください</div>
      <input type="text" value={name} onChange={(e) => setName(e.currentTarget.value)} />
      <Button onClick={create}>旅をはじめる</Button>
    </div>
  )
}
