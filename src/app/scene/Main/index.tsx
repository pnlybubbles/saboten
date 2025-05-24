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
import { useEffect, useMemo, useState } from 'react'
import Tips from '@app/components/Tips'
import clsx from 'clsx'
import Clickable from '@app/components/Clickable'
import * as Icon from 'lucide-react'
import AboutSheet from './AboutSheet'
import useRoomArchived from '@app/hooks/useRoomArchive'
import ActionMenu from './ActionMenu'

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
  const aboutSheet = usePresent()
  const noEvent = events == null || events.length === 0
  const drawer = usePresent()
  const [archived] = useRoomArchived(roomId)
  const [unarchiveTips, setUnarchiveTips] = useState(false)

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
          'fixed top-0 right-full h-full w-3/4 overflow-y-auto transition duration-300 md:right-auto md:left-[calc(max((100%-600px-640px)/2,env(safe-area-inset-left,1rem)))] md:w-[300px] md:translate-x-0',
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
            <Button
              variant="transparent"
              onClick={aboutSheet.open}
              icon={<Icon.TrafficCone size={20} />}
              className="mr-[-13px]"
            ></Button>
            <EditUser {...editUserSheet}></EditUser>
            <AboutSheet {...aboutSheet}></AboutSheet>
          </div>
          <Link to="/">
            <Button variant="primary" icon={<Icon.Plane size={20}></Icon.Plane>} onClick={drawer.close}>
              記録をはじめる
            </Button>
          </Link>
          <RecentRooms onEnter={drawer.close}></RecentRooms>
        </div>
      </div>
      <Clickable
        className={clsx(
          'w-full transition duration-300 md:ml-[calc(max((100%-600px-640px)/2,env(safe-area-inset-left,1rem))+300px)] md:w-[calc(min(100%-300px-env(safe-area-inset-left,1rem)-env(safe-area-inset-right,1rem),640px))] md:translate-x-0',
          drawer.isPresent && 'translate-x-3/4',
        )}
        onClick={drawer.close}
        div
      >
        <div
          className={clsx(
            'grid min-h-screen grid-rows-[auto_auto_1fr] md:pointer-events-auto',
            drawer.isPresent && 'pointer-events-none',
          )}
        >
          <div className="shadow-float-effect sticky -top-36 z-[1] grid gap-4 rounded-b-[44px] bg-white p-8 pb-6">
            <div className="z-10 grid grid-cols-[1fr_auto] justify-start gap-3">
              <Button
                className="transition md:pointer-events-none md:scale-50 md:opacity-0"
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation()
                  drawer.open()
                }}
                icon={
                  <div className="relative size-5">
                    <Icon.Menu
                      size={20}
                      className={clsx('absolute top-0 left-0', !drawer.isPresent ? 'opacity-100' : 'opacity-0')}
                    ></Icon.Menu>
                    <Icon.X
                      size={20}
                      className={clsx('absolute top-0 left-0', drawer.isPresent ? 'opacity-100' : 'opacity-0')}
                    ></Icon.X>
                  </div>
                }
              ></Button>
              <div className="flex justify-end">
                <Button onClick={editMemberSheet.open} icon={<Icon.Users size={20} />}></Button>
                <ActionMenu roomId={roomId} />
              </div>
            </div>
            <div className="group">
              <div className="flex items-center">
                <div
                  className={clsx(
                    'pointer-events-none text-zinc-400 transition-[width,opacity]',
                    archived ? 'w-7 pr-1' : 'w-0 opacity-0',
                  )}
                >
                  <Icon.FlagTriangleRight />
                </div>
                <TitleInput defaultValue={title} onChange={setTitle} disabled={archived} className="grow"></TitleInput>
              </div>
              {(title === undefined || title.length === 0) && (
                <Tips
                  type={Icon.PlaneTakeoff}
                  className="-mt-2 h-6 text-zinc-400 transition-[opacity,margin,height] group-focus-within:mt-0 group-focus-within:h-0 group-focus-within:opacity-0"
                >
                  タイトルを入力して記録をはじめよう！
                </Tips>
              )}
            </div>
            <Balance roomId={roomId}></Balance>
          </div>
          <EditMember roomId={roomId} {...editMemberSheet}></EditMember>
          <EventSheet
            {...createEventSheet}
            roomId={roomId}
            // roomIdが変化したらフォームのデータをリセットする
            id={roomId ?? undefined}
            onSubmit={addEvent}
            submitLabel="追加"
          ></EventSheet>
          <div className="p-8">
            {roomId === null ? <RecentRooms className="md:hidden" /> : <Events roomId={roomId}></Events>}
          </div>
          <div className={'pointer-events-none sticky bottom-0 left-0 w-full self-end'}>
            {archived ? (
              <>
                <div
                  className={clsx(
                    'h-12 w-full bg-gradient-to-t from-zinc-50 transition',
                    !unarchiveTips && 'opacity-0',
                  )}
                ></div>
                <div
                  className={clsx(
                    'grid justify-items-center gap-2 pt-2 pb-8 transition',
                    unarchiveTips && 'bg-zinc-50',
                  )}
                >
                  <Tips
                    type={Icon.FlagTriangleRight}
                    className={clsx('text-zinc-400 transition', !unarchiveTips && 'translate-y-4 opacity-0')}
                  >
                    アーカイブを解除するとイベントを追加できます
                  </Tips>
                  <Clickable
                    className="shadow-float pointer-events-auto grid w-max grid-flow-col gap-[2px] rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-400 transition active:scale-90"
                    onClick={() => setUnarchiveTips((v) => !v)}
                  >
                    <div>アーカイブ済み</div>
                  </Clickable>
                </div>
              </>
            ) : (
              <>
                {noEvent && <div className="h-12 w-full bg-gradient-to-t from-zinc-50"></div>}
                <div className={clsx('grid justify-items-center gap-2 pt-2 pb-8', noEvent && 'bg-zinc-50')}>
                  {noEvent && (
                    <Tips type={Icon.PawPrint} className="text-zinc-400">
                      最初のイベントを追加しよう！
                    </Tips>
                  )}
                  <Clickable
                    className="shadow-float pointer-events-auto grid size-16 grid-flow-col place-items-center gap-1 rounded-full bg-white transition select-none active:scale-90"
                    onClick={createEventSheet.open}
                  >
                    <Icon.Plus size={24}></Icon.Plus>
                  </Clickable>
                </div>
              </>
            )}
          </div>
        </div>
      </Clickable>
    </div>
  )
}

function RecentRooms({ className, ...props }: { onEnter?: () => void; className?: string }) {
  const [userRooms] = useUserRooms()
  const archive = usePresent()

  if (userRooms === null || userRooms.length === 0) {
    return null
  }

  return (
    <div className={className}>
      {userRooms.filter((v) => !v.archive).length > 0 && (
        <div className="mt-6 mb-4 grid grid-flow-col grid-cols-[1fr] first:mt-2">
          <div className="text-xs font-bold">最近の記録</div>
        </div>
      )}
      {userRooms
        .filter((v) => !v.archive)
        .map(({ id, title }) => (
          <RecentRoomItem roomId={id} title={title} key={id} {...props}></RecentRoomItem>
        ))}
      <Clickable
        className="mt-6 mb-4 -ml-1 grid grid-flow-col items-center justify-start gap-1 text-xs font-bold transition first:mt-2 active:scale-90"
        onClick={() => archive.onPresent((v) => !v)}
      >
        <Icon.ChevronRight
          size={16}
          className={clsx('transition', archive.isPresent && 'rotate-90')}
        ></Icon.ChevronRight>
        <div>アーカイブ</div>
      </Clickable>
      {archive.isPresent &&
        userRooms
          .filter((v) => v.archive)
          .map(({ id, title }) => <RecentRoomItem roomId={id} title={title} key={id} {...props}></RecentRoomItem>)}
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
        className="grid grid-flow-col items-center justify-between gap-1 py-2 transition active:scale-95"
      >
        <div className={clsx('text-sm', displayTitle === '' && 'text-zinc-400')}>
          {displayTitle === '' ? 'No title' : displayTitle}
        </div>
        <div className="flex pl-2">
          {members?.map((member) => (
            <Avatar className="ring-backdrop -ml-2 ring-2" mini="xs" name={member.name} key={member.id}></Avatar>
          ))}
        </div>
      </Link>
    </Clickable>
  )
}
