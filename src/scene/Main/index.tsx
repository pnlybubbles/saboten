import { useParams } from 'react-router-dom'
import EditMember from './EditMember'
import useRoomTitle from '@/hooks/useRoomTitle'
import TitleInput from './TitleInput'
import CreateEvent from './CreateEvent'

export default function Main() {
  const { roomId = null } = useParams()
  const [title, setTitle] = useRoomTitle(roomId)

  return (
    <div className="grid gap-4">
      <div>{roomId ?? 'id-not-created'}</div>
      <TitleInput defaultValue={title} onChange={setTitle}></TitleInput>
      <EditMember roomId={roomId}></EditMember>
      <CreateEvent roomId={roomId}></CreateEvent>
    </div>
  )
}
