import trpc from '@/utils/trpc'
import { useCallback } from 'react'
import useStore, { createStore } from './useStore'
import type { Room } from './useRoomLocalStorage'
import { ROOM_LOCAL_STORAGE_KEY, roomLocalStorageDescriptor } from './useRoomLocalStorage'
import useEnterNewRoom from './useEnterNewRoom'
import fetchRoom from '@/utils/fetchRoom'
import genTmpId from '@/utils/basic/genTmpId'
import type { User } from './useUser'
import useUser from './useUser'

const transform = (room: Room) => room.members.map((v) => ({ ...v, id: v.id as string | null, tmpId: genTmpId() }))

const roomMemberStore = createStore(
  (roomId: string | null) => ROOM_LOCAL_STORAGE_KEY(roomId ?? 'tmp'),
  (roomId: string | null) => {
    if (roomId === null) {
      return Promise.resolve(null)
    }
    return fetchRoom(roomId).then(transform)
  },
  (roomId: string | null) => {
    if (roomId === null) {
      return null
    }
    const room = roomLocalStorageDescriptor(roomId).get()
    return room ? transform(room) : undefined
  },
)

export type Member = NonNullable<ReturnType<(typeof roomMemberStore)['persistCache']>>[number]

export default function useRoomMember(roomId: string | null) {
  const [state, setState] = useStore(roomMemberStore, roomId)

  const enterNewRoom = useEnterNewRoom()

  const [user] = useUser()

  const addMember = useCallback(
    (name: string) =>
      setState(
        (current) => {
          if (user === null) {
            // ユーザーが未作成の場合はメンバー追加できない
            return current
          }
          return [
            ...(current ?? [{ name: null, user, id: null, tmpId: genTmpId() }]),
            { name: name, user: null, id: null, tmpId: genTmpId() },
          ]
        },
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
    [enterNewRoom, roomId, setState, user],
  )

  const removeMember = useCallback(
    (memberId: string) =>
      setState(
        (current) => {
          if (current == null) {
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
            throw new Error('No room to remove member')
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

  const joinMember = useCallback(
    (user: User, memberId: string | null) =>
      setState(
        (current) => {
          if (current == null) {
            // データが無いと参加は不可
            return current
          }
          if (memberId) {
            const index = current.findIndex((v) => v.id === memberId)
            if (index === -1) {
              // 存在しないメンバーIDの場合は参加不可
              return current
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return [...current.slice(0, index), { ...current[index]!, user }, ...current.slice(index)]
          } else {
            return [...current, { id: null, name: null, tmpId: genTmpId(), user }]
          }
        },
        async () => {
          if (roomId === null) {
            // 部屋がないと参加はできない
            throw new Error('No room to join')
          }
          const members = await trpc.room.member.join.mutate({ roomId, memberId })
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
  const getMemberName = (memberIdOrMember: string | Member) => {
    const member = typeof memberIdOrMember === 'string' ? getMember(memberIdOrMember) : memberIdOrMember
    return member ? deriveMemberName(user, member) : null
  }

  return [state, { addMember, removeMember, getMemberName, getMember, joinMember }] as const
}

export const deriveMemberName = (user: User | null, member: Pick<Member, 'user' | 'name'>) => {
  return (user && member.user?.id === user.id ? user.name : undefined) ?? member.user?.name ?? member.name
}
