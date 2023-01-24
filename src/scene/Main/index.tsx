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
import Tips from '@/components/Tips'
import clsx from 'clsx'

interface Props {
  roomId: string | null
}

export default function Main({ roomId }: Props) {
  const createEventSheet = usePresent()
  const [title, setTitle] = useRoomTitle(roomId)
  const [events, { addEvent }] = useEvents(roomId)
  const [user] = useUser()
  const editMemberSheet = usePresent()
  const editUserSheet = usePresent()
  const noEvent = events === undefined || events.length === 0

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
        <div className="group">
          <TitleInput defaultValue={title} onChange={setTitle}></TitleInput>
          {(title === undefined || title.length === 0) && (
            <Tips className="mt-[-0.5rem] h-6 text-zinc-400 transition-[opacity,margin,height] group-focus-within:mt-0 group-focus-within:h-0 group-focus-within:opacity-0">
              タイトルを入力して旅をはじめましょう！
            </Tips>
          )}
        </div>
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
      <div className={'pointer-events-none fixed bottom-0 left-0 w-full'}>
        {noEvent && <div className="h-12 w-full bg-gradient-to-t from-zinc-50"></div>}
        <div className={clsx('grid justify-items-center gap-2 pb-8 pt-2', noEvent && 'bg-zinc-50')}>
          {noEvent && <Tips className="text-zinc-400">最初のイベントを追加しよう</Tips>}
          <button
            className="pointer-events-auto grid h-16 w-16 select-none grid-flow-col items-center justify-items-center gap-1 rounded-full bg-zinc-900 text-white shadow-xl transition active:scale-90"
            onClick={createEventSheet.open}
          >
            <Icon name="add" size={24}></Icon>
          </button>
        </div>
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
      {userRooms.slice(0, 5).map(({ id, title }) => (
        <RecentRoomItem roomId={id} title={title} key={id}></RecentRoomItem>
      ))}
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
