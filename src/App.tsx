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
  const [user] = useUser()
  const { roomId = null } = useParams()
  const [members] = useRoomMember(roomId)

  if (user === null) {
    return <Landing roomId={roomId}></Landing>
  }

  if (roomId === null) {
    return <Main roomId={null} />
  }

  if (members === undefined) {
    return (
      <div>
        <Spinner></Spinner>
        <div>読込中...</div>
      </div>
    )
  }

  if (members.find((v) => v.user?.id === user.id) === undefined) {
    return <Join roomId={roomId}></Join>
  }

  return <Main roomId={roomId} />
}
