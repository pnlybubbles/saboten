import useUser from './hooks/useUser'
import Main from './scene/Main'
import { RouterProvider, createBrowserRouter, useParams } from 'react-router-dom'
import useRoomMember from './hooks/useRoomMember'
import Landing from './scene/Landing'
import Spinner from './components/Spinner'

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
    return (
      <div className="p-8">
        <Landing roomId={roomId}></Landing>
      </div>
    )
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
    return <div>TODO: join room</div>
  }

  return <Main roomId={roomId} />
}
