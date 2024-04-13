import EditMember from './EditMember'
import useRoomTitle from '@app/hooks/useRoomTitle'
import TitleInput from './TitleInput'
import EventSheet from './EventSheet'
import Events from './Events'
import usePresent from '@app/hooks/usePresent'
import useEvents from '@app/hooks/useEvents'
import Balance from './Balance'
import Avatar from '@app/components/Avatar'
import useUser from '@app/hooks/useUser'
// import Icon from '@app/components/Icon'
import Button from '@app/components/Button'
import EditUser from './EditUser'
import useUserRooms from '@app/hooks/useUserRooms'
import { Link } from 'react-router-dom'
import useRoomLocalStorage from '@app/hooks/useRoomLocalStorage'
import { deriveMemberName } from '@app/hooks/useRoomMember'
import { useEffect, useMemo } from 'react'
import Tips from '@app/components/Tips'
import clsx from 'clsx'
import Clickable from '@app/components/Clickable'
import SettingsSheet from './SettingsSheet'
import * as Icon from 'lucide-react'
import AboutSheet from './AboutSheet'

interface Props {
  roomId: string | null
}

export default function Main({ roomId }: Props) {
  const createEventSheet = usePresent()
  const [title, setTitle] = useRoomTitle(roomId)
  const [events, { addEvent }] = useEvents(roomId)
  const [user] = useUser()
  const settingsSheet = usePresent()
  const editMemberSheet = usePresent()
  const editUserSheet = usePresent()
  const aboutSheet = usePresent()
  const noEvent = events == null || events.length === 0
  const drawer = usePresent()

  useEffect(() => {
    if (drawer.isPresent) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawer.isPresent])

  return (
    <div className={clsx('relative z-0 w-full', drawer.isPresent && 'overflow-hidden')}>
      <div
        className={clsx(
          'fixed right-full top-0 h-full w-3/4 overflow-y-auto transition duration-300',
          drawer.isPresent && 'translate-x-full',
        )}
      >
        <div className="grid gap-6 p-8">
          <div className="grid grid-cols-[auto_1fr_auto] items-center justify-start gap-4">
            <Clickable onClick={editUserSheet.open} className="transition active:scale-90">
              <Avatar name={user?.name ?? null}></Avatar>
            </Clickable>
            <Clickable onClick={editUserSheet.open} className="text-left font-bold transition active:scale-95">
              {user?.name}
            </Clickable>
            <Button variant="primary" onClick={aboutSheet.open} icon={<Icon.Construction size={20} />}></Button>
            <EditUser {...editUserSheet}></EditUser>
            <AboutSheet {...aboutSheet}></AboutSheet>
          </div>
          <Link to="/">
            <Button variant="primary" icon={<Icon.Plane size={20}></Icon.Plane>} onClick={drawer.close}>
              旅をはじめる
            </Button>
          </Link>
          <RecentRooms onEnter={drawer.close}></RecentRooms>
        </div>
      </div>
      <Clickable
        className={clsx('w-full transition duration-300', drawer.isPresent && 'translate-x-3/4')}
        onClick={drawer.close}
        div
      >
        <div className={clsx('grid min-h-screen grid-rows-[auto_auto_1fr]', drawer.isPresent && 'pointer-events-none')}>
          <div className="sticky top-[-9rem] z-[1] grid gap-4 overflow-hidden rounded-b-[44px] bg-white p-8 pb-6 shadow-float">
            <div className="grid grid-cols-[1fr_auto_auto] justify-start gap-3">
              <Button
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation()
                  drawer.open()
                }}
                icon={
                  <div className="relative size-5">
                    <Icon.Menu
                      size={20}
                      className={clsx('absolute left-0 top-0', !drawer.isPresent ? 'opacity-100' : 'opacity-0')}
                    ></Icon.Menu>
                    <Icon.X
                      size={20}
                      className={clsx('absolute left-0 top-0', drawer.isPresent ? 'opacity-100' : 'opacity-0')}
                    ></Icon.X>
                  </div>
                }
              ></Button>
              <Button
                className={clsx(roomId ? 'scale-100 opacity-100' : 'pointer-events-none scale-50 opacity-0')}
                onClick={settingsSheet.open}
                icon={<Icon.Settings size={20}></Icon.Settings>}
              ></Button>
              <Button onClick={editMemberSheet.open} icon={<Icon.Users size={20} />}></Button>
            </div>
            <div className="group">
              <TitleInput defaultValue={title} onChange={setTitle}></TitleInput>
              {(title === undefined || title.length === 0) && (
                <Tips
                  type={Icon.PlaneTakeoff}
                  className="mt-[-0.5rem] h-6 text-zinc-400 transition-[opacity,margin,height] group-focus-within:mt-0 group-focus-within:h-0 group-focus-within:opacity-0"
                >
                  タイトルを入力して旅をはじめよう！
                </Tips>
              )}
            </div>
            <Balance roomId={roomId}></Balance>
          </div>
          <EditMember roomId={roomId} {...editMemberSheet}></EditMember>
          {roomId && <SettingsSheet roomId={roomId} {...settingsSheet}></SettingsSheet>}
          <EventSheet {...createEventSheet} roomId={roomId} onSubmit={addEvent} submitLabel="追加"></EventSheet>
          <div className="p-8">{roomId === null ? <RecentRooms></RecentRooms> : <Events roomId={roomId}></Events>}</div>
          <div className={'pointer-events-none sticky bottom-0 left-0 w-full self-end'}>
            {noEvent && <div className="h-12 w-full bg-gradient-to-t from-zinc-50"></div>}
            <div className={clsx('grid justify-items-center gap-2 pb-8 pt-2', noEvent && 'bg-zinc-50')}>
              {noEvent && (
                <Tips type={Icon.PawPrint} className="text-zinc-400">
                  最初のイベントを追加しよう！
                </Tips>
              )}
              <Clickable
                className="pointer-events-auto grid size-16 select-none grid-flow-col items-center justify-items-center gap-1 rounded-full bg-white shadow-float transition active:scale-90"
                onClick={createEventSheet.open}
              >
                <Icon.Plus size={24}></Icon.Plus>
              </Clickable>
            </div>
          </div>
        </div>
      </Clickable>
    </div>
  )
}

function RecentRooms(props: { onEnter?: () => void }) {
  const [userRooms] = useUserRooms()

  if (userRooms === null || userRooms.length === 0) {
    return null
  }

  return (
    <div className="grid gap-2">
      <div className="text-xs font-bold">最近の旅</div>
      {userRooms.map(({ id, title }) => (
        <RecentRoomItem roomId={id} title={title} key={id} {...props}></RecentRoomItem>
      ))}
    </div>
  )
}

function RecentRoomItem({ roomId, title, onEnter }: { roomId: string; title: string; onEnter?: () => void }) {
  const [user] = useUser()

  // キャッシュに乗ってたら表示するくらいの気持ち
  // あえてfetchしない
  const [room] = useRoomLocalStorage(roomId)
  const members = useMemo(
    () => room?.members.map((member) => ({ name: deriveMemberName(user, member), id: member.id })),
    [room?.members, user],
  )

  const displayTitle = room?.title ?? title

  return (
    <Clickable {...(onEnter && { onClick: onEnter })} div>
      <Link
        to={`/${roomId}`}
        className="grid grid-flow-col items-center justify-between gap-1 rounded-lg bg-surface px-5 py-4 transition active:scale-95"
      >
        <div className={clsx('font-bold', displayTitle === '' && 'text-zinc-400')}>
          {displayTitle === '' ? 'No title' : displayTitle}
        </div>
        <div className="flex pl-2">
          {members?.map((member) => (
            <Avatar className="ml-[-0.5rem] ring-2 ring-surface" mini="xs" name={member.name} key={member.id}></Avatar>
          ))}
        </div>
      </Link>
    </Clickable>
  )
}
