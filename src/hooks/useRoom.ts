import { createLocalStorageDescriptor } from '@/utils/localstorage'
import { z } from 'zod'
import { useLocalStorage } from './useLocalStorage'
import { useEffect, useMemo } from 'react'
import trpc from '@/utils/trpc'

const ROOM_SCHEMA = z.object({
  id: z.string(),
  title: z.string(),
  members: z.array(
    z.object({ id: z.string().uuid(), name: z.string().nullable(), userId: z.string().uuid().nullable() }),
  ),
})

const roomStorageDescriptor = (roomId: string) => createLocalStorageDescriptor(`room_${roomId}`, ROOM_SCHEMA)

let task: null | ReturnType<typeof trpc.room.item.query> = null

export default function useRoom(roomId: string | null) {
  const [room, setRoomInStorage, ready] = useLocalStorage(
    useMemo(() => (roomId ? roomStorageDescriptor(roomId) : undefined), [roomId]),
  )

  const setTitle = async (value: string) => {
    const fetched = await trpc.room.title.mutate({ id: roomId, value })
    if (roomId) {
      setRoomInStorage(fetched)
    } else {
      roomStorageDescriptor(fetched.id).set(fetched)
    }
    return fetched
  }

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

  return [room, { setTitle }] as const
}
