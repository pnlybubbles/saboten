import { useParams } from 'react-router-dom'
import EditMember from './EditMember'
import useRoomTitle from '@/hooks/useRoomTitle'
import TitleInput from './TitleInput'
import EventSheet from './EventSheet'
import Events from './Events'
import Button from '@/components/Button'
import usePresent from '@/hooks/usePresent'
import useEvents from '@/hooks/useEvents'
import Balance from './Balance'
import Avatar from '@/components/Avatar'
import useUser from '@/hooks/useUser'

export default function Main() {
  const createEventSheet = usePresent()
  const { roomId = null } = useParams()
  const [title, setTitle] = useRoomTitle(roomId)
  const [, { addEvent }] = useEvents(roomId)
  const [user] = useUser()

  return (
    <div className="grid gap-4">
      <div>
        <Avatar name={user?.name ?? null}></Avatar>
      </div>
      <TitleInput defaultValue={title} onChange={setTitle}></TitleInput>
      <Balance roomId={roomId}></Balance>
      <EditMember roomId={roomId}></EditMember>
      <Button primary onClick={createEventSheet.open}>
        イベントを追加
      </Button>
      <EventSheet {...createEventSheet} roomId={roomId} onSubmit={addEvent} submitLabel="追加"></EventSheet>
      <Events roomId={roomId}></Events>
    </div>
  )
}
