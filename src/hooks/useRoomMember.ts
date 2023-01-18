import trpc from '@/utils/trpc'
import { useCallback } from 'react'
import useStore, { createStore } from './useStore'
import { ROOM_LOCAL_STORAGE_KEY, roomLocalStorageDescriptor } from './useRoomLocalStorage'
import useEnterNewRoom from './useEnterNewRoom'
import fetchRoom from '@/utils/fetchRoom'
import genTmpId from '@/utils/basic/genTmpId'
import unreachable from '@/utils/basic/unreachable'

const roomMemberStore = createStore(
  (roomId: string | null) => ROOM_LOCAL_STORAGE_KEY(roomId ?? 'tmp'),
  (roomId: string | null) => {
    if (roomId === null) {
      return Promise.resolve([])
    }
    return fetchRoom(roomId).then((v) => v.members.map((v) => ({ ...v, id: v.id as string | null, tmpId: genTmpId() })))
  },
)

export default function useRoomMember(roomId: string | null) {
  const [state, setState] = useStore(roomMemberStore, roomId)

  const enterNewRoom = useEnterNewRoom()

  const addMember = useCallback(
    (name: string) =>
      setState(
        (current) => [...(current ?? []), { name: name, user: null, id: null, tmpId: genTmpId() }],
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
          return data.members.map((v) => ({ ...v, tmpId: genTmpId() }))
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
            // メンバー追加&部屋作成はキューイングされるので、roomId=nullのクロージャに入ってる間にキューに入った場合はエラーになる
            unreachable()
          }
          const members = await trpc.room.member.remove.mutate({ roomId: roomId, memberId })
          const desc = roomLocalStorageDescriptor(roomId)
          const current = desc.get()
          if (current === null) {
            // この時点でデータがキャッシュサれていないのは流石にエラー
            throw new Error('No cache')
          }
          desc.set({ ...current, members })
          return members.map((v) => ({ ...v, tmpId: genTmpId() }))
        },
      ),
    [roomId, setState],
  )

  const getMember = (memberId: string) => state?.find((v) => v.id === memberId)
  const getMemberName = (memberId: string) => {
    const member = getMember(memberId)
    return member?.user?.name ?? member?.name ?? undefined
  }

  return [state, { addMember, removeMember, getMemberName, getMember }] as const
}
