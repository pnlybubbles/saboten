import { useCallback } from 'react'
import useStore, { createStore } from './useStore'
import type { Room } from './useRoomLocalStorage'
import { ROOM_LOCAL_STORAGE_KEY, roomLocalStorageDescriptor } from './useRoomLocalStorage'
import useEnterNewRoom from './useEnterNewRoom'
import fetchRoom from '@app/util/fetchRoom'
import genTmpId from '@app/util/genTmpId'
import type { User } from './useUser'
import useUser from './useUser'
import rpc from '@app/util/rpc'
import ok from '@app/util/ok'

const transform = (room: Room) => room.members.map((v) => ({ ...v, id: v.id as string | null, tmpId: genTmpId() }))

const roomMemberStore = createStore(
  (roomId: string | null) => (roomId ? ROOM_LOCAL_STORAGE_KEY(roomId) : null),
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
          if (current == null) {
            // ルームが未作成の場合にはoptimistic updateしない
            return current
          }
          return [...current, { name: name, user: null, id: null, tmpId: genTmpId() }]
        },
        async () => {
          const data = await ok(rpc.api.room.member.add.$post({ json: { roomId, name } }))
          const desc = roomLocalStorageDescriptor(data.roomId)
          if (data.room) {
            desc.set(data.room)
            enterNewRoom(data.roomId)
            return
          } else {
            const current = desc.get()
            if (current === null) {
              // この時点でデータがキャッシュサれていないのは流石にエラー
              throw new Error('No cache')
            }
            desc.set({ ...current, members: data.members })
            return data.members.map((v) => ({ ...v, tmpId: genTmpId() }))
          }
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
          const members = await ok(rpc.api.room.member.remove.$post({ json: { roomId: roomId, memberId } }))
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

  const renameMember = useCallback(
    (memberId: string, name: string) =>
      setState(
        (current) => {
          if (current == null) {
            return current
          }
          const index = current.findIndex((v) => v.id === memberId)
          if (index === -1) {
            // リネームしようと思ってたものが既に無い。なんもしない
            return current
          }
          return [...current.slice(0, index), { ...current[index]!, name }, ...current.slice(index + 1)]
        },
        async () => {
          if (roomId === null) {
            // TODO: 部屋ができていないのにメンバーのリネームは不可能
            // メンバー追加&部屋作成はキューイングされるので、roomId=nullのクロージャに入ってる間にキューに入った場合はエラーになる
            throw new Error('No room to remove member')
          }
          const members = await ok(rpc.api.room.member.rename.$post({ json: { roomId: roomId, memberId, name } }))
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
            return [...current.slice(0, index), { ...current[index]!, user }, ...current.slice(index + 1)]
          } else {
            return [...current, { id: null, name: null, tmpId: genTmpId(), user }]
          }
        },
        async () => {
          if (roomId === null) {
            // 部屋がないと参加はできない
            throw new Error('No room to join')
          }
          const members = await ok(rpc.api.room.member.join.$post({ json: { roomId, memberId } }))
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

  const getMember = useCallback((memberId: string) => state?.find((v) => v.id === memberId), [state])
  const getMemberName = useCallback(
    (memberIdOrMember: string | Member) => {
      const member = typeof memberIdOrMember === 'string' ? getMember(memberIdOrMember) : memberIdOrMember
      return member ? deriveMemberName(user, member) : null
    },
    [getMember, user],
  )

  const isMe = useCallback(
    (memberId: string) => user?.id && getMember(memberId)?.user?.id === user.id,
    [getMember, user?.id],
  )

  return [state, { addMember, removeMember, renameMember, getMemberName, getMember, joinMember, isMe }] as const
}

export const deriveMemberName = (user: User | null, member: Pick<Member, 'user' | 'name'>) => {
  // 下の `validMemberName` と同じロジック
  // メンバー名が存在するケースはそれを優先して使う
  if (member.name !== null && member.name !== '') {
    return member.name
  }
  // メンバー名がリセットした場合はユーザー指定のニックネームを使う
  return (user && member.user?.id === user.id ? user.name : undefined) ?? member.user?.name ?? null
}

export const validMemberName = (member: Pick<Member, 'name'>) => {
  return member.name !== null && member.name !== ''
}
