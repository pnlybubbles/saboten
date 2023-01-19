import { useParams } from 'react-router-dom'
import EditMember from './EditMember'
import useRoomTitle from '@/hooks/useRoomTitle'
import TitleInput from './TitleInput'
import EventSheet from './EventSheet'
import Events from './Events'
import Button from '@/components/Button'
import usePresent from '@/hooks/usePresent'
import useEvents from '@/hooks/useEvents'

export default function Main() {
  const createEventSheet = usePresent()
  const { roomId = null } = useParams()
  const [title, setTitle] = useRoomTitle(roomId)
  const [, { addEvent }] = useEvents(roomId)

  return (
    <div className="grid gap-4">
      <div className="text-xs text-zinc-400">room: {roomId ?? 'id-not-created'}</div>
      <TitleInput defaultValue={title} onChange={setTitle}></TitleInput>
      <EditMember roomId={roomId}></EditMember>
      <Button primary onClick={createEventSheet.open}>
        イベントを追加
      </Button>
      <EventSheet {...createEventSheet} roomId={roomId} onSubmit={addEvent} submitLabel="追加"></EventSheet>
      <Events roomId={roomId}></Events>
    </div>
  )
}
