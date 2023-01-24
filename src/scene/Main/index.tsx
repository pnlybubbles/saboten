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
import Button from '@/components/Button'
import EditUser from './EditUser'
import useUserRooms from '@/hooks/useUserRooms'
import { Link } from 'react-router-dom'
import useRoomLocalStorage from '@/hooks/useRoomLocalStorage'
import { deriveMemberName } from '@/hooks/useRoomMember'
import { useMemo } from 'react'

interface Props {
  roomId: string | null
}

export default function Main({ roomId }: Props) {
  const createEventSheet = usePresent()
  const [title, setTitle] = useRoomTitle(roomId)
  const [, { addEvent }] = useEvents(roomId)
  const [user] = useUser()
  const editMemberSheet = usePresent()
  const editUserSheet = usePresent()

  return (
    <div className="grid">
      <div className="z-[1] mb-[-1.5rem] grid gap-4 bg-white p-8 pb-0">
        <div className="grid grid-flow-col justify-start gap-4">
          <button onClick={editUserSheet.open} className="transition active:scale-90">
            <Avatar name={user?.name ?? null}></Avatar>
          </button>
          <Button onClick={editMemberSheet.open} icon={<Icon name="group"></Icon>}>
            メンバー
          </Button>
        </div>
        <TitleInput defaultValue={title} onChange={setTitle}></TitleInput>
      </div>
      <div className="sticky top-0 rounded-b-[44px] bg-white p-8 pb-6 shadow-xl">
        <Balance roomId={roomId}></Balance>
      </div>
      <EditUser defaultValue={user?.name ?? ''} {...editUserSheet}></EditUser>
      <EditMember roomId={roomId} {...editMemberSheet}></EditMember>
      <EventSheet {...createEventSheet} roomId={roomId} onSubmit={addEvent} submitLabel="追加"></EventSheet>
      <div className="p-8 pb-[8rem]">
        {roomId === null ? (
          <div>
            <RecentRooms></RecentRooms>
          </div>
        ) : (
          <Events roomId={roomId}></Events>
        )}
      </div>
      <div className="fixed bottom-8 left-0 grid w-full grid-cols-[max-content] justify-center">
        <button
          className="grid h-16 w-16 select-none grid-flow-col items-center justify-items-center gap-1 rounded-full bg-zinc-900 text-white shadow-xl transition active:scale-90"
          onClick={createEventSheet.open}
        >
          <Icon name="add" size={24}></Icon>
        </button>
      </div>
    </div>
  )
}

function RecentRooms() {
  const [userRooms] = useUserRooms()

  if (userRooms === null || userRooms.length === 0) {
    return null
  }

  return (
    <div className="grid gap-2">
      <div className="text-xs font-bold">最近の旅</div>
      <div>
        {userRooms.slice(0, 5).map(({ id, title }) => (
          <RecentRoomItem roomId={id} title={title} key={id}></RecentRoomItem>
        ))}
      </div>
    </div>
  )
}

function RecentRoomItem({ roomId, title }: { roomId: string; title: string }) {
  const [user] = useUser()

  // キャッシュに乗ってたら表示するくらいの気持ち
  // あえてfetchしない
  const [room] = useRoomLocalStorage(roomId)
  const members = useMemo(
    () => room?.members.map((member) => ({ name: deriveMemberName(user, member), id: member.id })),
    [room?.members, user],
  )

  return (
    <Link
      to={`/${roomId}`}
      className="grid grid-flow-col items-center justify-between rounded-lg bg-surface px-5 py-4 transition active:scale-95"
    >
      <div className="font-bold">{title}</div>
      <div className="flex">
        {members?.map((member) => (
          <Avatar className="ml-[-0.5rem] ring-2 ring-surface" mini="xs" name={member.name} key={member.id}></Avatar>
        ))}
      </div>
    </Link>
  )
}
