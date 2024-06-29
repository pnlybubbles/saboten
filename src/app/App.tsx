import useUser from './hooks/useUser'
import Main from './scene/Main'
import { RouterProvider, createBrowserRouter, useParams } from 'react-router-dom'
import useRoomMember from './hooks/useRoomMember'
import Landing from './scene/Landing'
import Spinner from './components/Spinner'
import Join from './scene/Landing/Join'

const router = createBrowserRouter([
  {
    path: '/:roomId?',
    element: <Routing></Routing>,
  },
])

export default function App() {
  return (
    <div className="min-h-screen text-base text-zinc-700">
      <RouterProvider router={router} />
    </div>
  )
}

function Routing() {
  const [user, { ready }] = useUser()
  const { roomId = null } = useParams()
  const [members] = useRoomMember(roomId)

  if (!ready) {
    // ローカルストレージの読み込みが終わるまで待つ
    return null
  }

  if (user === null) {
    return <Landing roomId={roomId}></Landing>
  }

  if (roomId === null || members === null) {
    return <Main roomId={null} />
  }

  if (members === undefined) {
    return (
      <div className="grid h-screen content-center justify-items-center gap-2">
        <Spinner></Spinner>
        <div className="text-sm font-bold text-zinc-400">読込中...</div>
      </div>
    )
  }

  if (members.find((v) => v.user?.id === user.id) === undefined) {
    return <Join roomId={roomId}></Join>
  }

  return <Main roomId={roomId} />
}
