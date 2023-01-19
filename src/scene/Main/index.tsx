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
      <div className="fixed bottom-8 left-0 w-full grid grid-cols-[max-content] justify-center">
        <button
          className="grid grid-flow-col gap-1 items-center justify-items-center h-16 w-16 rounded-full bg-primary text-white shadow-primary shadow-2xl active:scale-90 select-none transition"
          onClick={createEventSheet.open}
        >
          <Icon name="add" size={24}></Icon>
        </button>
      </div>
    </div>
  )
}
