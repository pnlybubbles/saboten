import trpc from '@/utils/trpc'
import { useCallback } from 'react'
import useStore, { createStore } from './useStore'
import { ROOM_LOCAL_STORAGE_KEY, roomLocalStorageDescriptor } from './useRoomLocalStorage'
import useEnterNewRoom from './useEnterNewRoom'
import fetchRoom from '@/utils/fetchRoom'
import tmpId from '@/utils/basic/tmpId'

const roomMemberStore = createStore(
  (roomId: string | null) => ROOM_LOCAL_STORAGE_KEY(roomId ?? 'tmp'),
  (roomId: string | null) => {
    if (roomId === null) {
      return Promise.resolve([])
    }
    return fetchRoom(roomId).then((v) => v.members)
  },
)

export default function useRoomMember(roomId: string | null) {
  const [state, setState] = useStore(roomMemberStore, roomId)

  const enterNewRoom = useEnterNewRoom()

  const addMember = useCallback(
    (name: string) =>
      setState(
        (current) => [...(current ?? []), { name: name, user: null, id: tmpId() }],
        async () => {
          const data = await trpc.room.member.add.mutate({ roomId, name })
          const desc = roomLocalStorageDescriptor(data.roomId)
          if (data.room) {
            desc.set(data.room)
            enterNewRoom(data.roomId)
          } else {
            const current = desc.get()
            if (current === null) {
              // この時点でデータがキャッシュサれていないのは流石にエラー
              throw new Error('No cache')
            }
            desc.set({ ...current, members: data.members })
          }
        },
      ),
    [enterNewRoom, roomId, setState],
  )

  const removeMember = useCallback(
    (memberId: string) =>
      setState(
        (current) => {
          if (current === undefined) {
            return current
          }
          const index = current.findIndex((v) => v.id === memberId)
          if (index === -1) {
            // 消そうと思ってたものが既に無い。なんもしない
            return current
          }
          return [...current.slice(0, index), ...current.slice(index + 1)]
        },
        async () => {
          if (roomId === null) {
            // TODO: 部屋ができていないのにメンバーの削除は不可能
            // だが通信中の場合はキューイングしても良い...?
            return
          }
          const members = await trpc.room.member.remove.mutate({ roomId: roomId, memberId })
          const desc = roomLocalStorageDescriptor(roomId)
          const current = desc.get()
          if (current === null) {
            // この時点でデータがキャッシュサれていないのは流石にエラー
            throw new Error('No cache')
          }
          desc.set({ ...current, members })
        },
      ),
    [roomId, setState],
  )

  return [state, { addMember, removeMember }] as const
}
