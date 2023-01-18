import { createLocalStorageDescriptor } from '@/utils/localstorage'
import { z } from 'zod'
import { useLocalStorage } from './useLocalStorage'
import { useCallback, useEffect, useMemo } from 'react'
import trpc from '@/utils/trpc'
import unreachable from '@/utils/basic/unreachable'
import { useNavigate } from 'react-router-dom'

const ROOM_SCHEMA = z.object({
  id: z.string(),
  title: z.string(),
  members: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string().nullable(),
      user: z.object({ id: z.string().uuid(), name: z.string() }).nullable(),
    }),
  ),
})

const roomStorageDescriptor = (roomId: string) => createLocalStorageDescriptor(`room_${roomId}`, ROOM_SCHEMA)

let task: null | ReturnType<typeof trpc.room.item.query> = null

export default function useRoom(roomId: string | null) {
  const [room, setRoomInStorage, ready] = useLocalStorage(
    useMemo(() => (roomId ? roomStorageDescriptor(roomId) : undefined), [roomId]),
  )

  const navigate = useNavigate()

  const enterNewRoom = useCallback(
    (roomId: string) => {
      navigate(`/${roomId}`)
    },
    [navigate],
  )

  const addMember = useCallback(
    async (name: string) => {
      const { type, data } = await trpc.room.member.add.mutate({ roomId, name })
      if (type === 'room') {
        roomStorageDescriptor(data.id).set(data)
        enterNewRoom(data.id)
      } else if (type === 'member') {
        const desc = roomStorageDescriptor(data.roomId)
        const room = desc.get()
        if (room) {
          desc.set({ ...room, members: [...room.members, { ...data, user: null }] })
        } else {
          // TODO: revalidate
        }
      } else {
        unreachable(type)
      }
    },
    [enterNewRoom, roomId],
  )

  const removeMember = useCallback(
    async (id: string) => {
      if (roomId === null) {
        // TODO: 部屋ができていないのにメンバーの削除は不可能
        // だが通信中の場合はキューイングしても良い...?
        return
      }
      await trpc.room.member.remove.mutate({ roomId, memberId: id })
      const desc = roomStorageDescriptor(roomId)
      const room = desc.get()
      if (room === null) {
        // 何かが整合していない。流石にエラー
        throw new Error('No room cache')
      }
      const index = room.members.findIndex((v) => v.id === id)
      if (index === -1) {
        // 消そうと思ってたものが既に無い。なんもしない
        return
      }
      desc.set({ ...room, members: [...room.members.slice(0, index), ...room.members.slice(index + 1)] })
    },
    [roomId],
  )

  useEffect(() => {
    if (!ready) {
      return
    }
    // TODO: 一定時間でrevalidate
    if (room) {
      return
    }
    if (roomId === null) {
      return
    }
    void (async () => {
      if (task) {
        return
      }
      task = trpc.room.item.query({ id: roomId })
      const fetched = await task

      if (fetched) {
        setRoomInStorage(fetched)
      }
    })()
  }, [setRoomInStorage, room, roomId, ready])

  return [room, { addMember, removeMember }] as const
}
