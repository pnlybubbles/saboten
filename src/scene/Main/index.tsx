import { useParams } from 'react-router-dom'
import EditMember from './EditMember'
import useRoomTitle from '@/hooks/useRoomTitle'
import TitleInput from './TitleInput'
import EventSheet from './EventSheet'
import Events from './Events'
import usePresent from '@/hooks/usePresent'
import useEvents from '@/hooks/useEvents'
import Balance from './Balance'
import Avatar from '@/components/Avatar'
import useUser from '@/hooks/useUser'
import Icon from '@/components/Icon'

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
      <EventSheet {...createEventSheet} roomId={roomId} onSubmit={addEvent} submitLabel="追加"></EventSheet>
      <Events roomId={roomId}></Events>
      <div className="fixed bottom-8 left-0 grid w-full grid-cols-[max-content] justify-center">
        <button
          className="grid h-16 w-16 select-none grid-flow-col items-center justify-items-center gap-1 rounded-full bg-primary text-white shadow-2xl shadow-primary transition active:scale-90"
          onClick={createEventSheet.open}
        >
          <Icon name="add" size={24}></Icon>
        </button>
      </div>
    </div>
  )
}
