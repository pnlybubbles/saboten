import { createLocalStorageDescriptor } from '@/util/createLocalStorageDescriptor'
import { z } from 'zod'
import { useLocalStorage } from './useLocalStorage'
import { useEffect } from 'react'
import trpc from '@/util/trpc'
import { COMPRESSED_USER_ID_SCHEMA } from '@shared/utils/schema'
import { userRoomsLocalStorageDescriptor } from './useUserRooms'
import { roomLocalStorageDescriptor } from './useRoomLocalStorage'

const USER_STORAGE_DESCRIPTOR = createLocalStorageDescriptor(
  'user_id',
  z.object({
    id: z.string(),
    name: z.string(),
    compressedId: COMPRESSED_USER_ID_SCHEMA.optional(),
  }),
)

let task: null | ReturnType<typeof trpc.user.refresh.mutate> = null

export default function useUser() {
  const [user, setUserInStorage, ready] = useLocalStorage(USER_STORAGE_DESCRIPTOR)

  const setUser = async (props: { name: string }) => {
    if (user) {
      setUserInStorage({ ...user, ...props })
    }
    const fetched = await trpc.user.item.mutate({ id: user?.id, ...props })
    setUserInStorage(fetched)
    return fetched
  }

  const removeUser = async () => {
    if (!user) {
      return
    }
    await trpc.user.leave.mutate()
    setUserInStorage(undefined)
    const userRooms = userRoomsLocalStorageDescriptor(user.id)
    const rooms = userRooms.get()?.map((v) => v.id) ?? []
    for (const roomId of rooms) {
      roomLocalStorageDescriptor(roomId).set(undefined)
    }
    userRooms.set(undefined)
  }

  const restoreUser = async (compressedUserId: string) => {
    const fetched = await trpc.user.refresh.mutate({ compressedUserId })

    if (fetched) {
      setUserInStorage(fetched)
      if (user) {
        const userRooms = userRoomsLocalStorageDescriptor(user.id)
        const rooms = userRooms.get()?.map((v) => v.id) ?? []
        for (const roomId of rooms) {
          roomLocalStorageDescriptor(roomId).set(undefined)
        }
      }
    }

    return fetched
  }

  useEffect(() => {
    if (!ready) {
      return
    }
    void (async () => {
      if (task) {
        return
      }
      task = trpc.user.refresh.mutate()
      const fetched = await task

      if (fetched) {
        setUserInStorage(fetched)
      } else {
        setUserInStorage(undefined)
      }
    })()
  }, [ready, setUserInStorage])

  return [user, { setUser, restoreUser, removeUser }] as const
}

export type User = NonNullable<ReturnType<typeof useUser>[0]>
