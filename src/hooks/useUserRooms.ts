import { createLocalStorageDescriptor } from '@/utils/basic/createLocalStorageDescriptor'
import { z } from 'zod'
import { useLocalStorage } from './useLocalStorage'
import { useEffect, useMemo } from 'react'
import useUser from './useUser'
import trpc from '@/utils/trpc'

const USER_ROOMS_STORAGE = z.array(z.object({ id: z.string(), title: z.string() }))

export const USER_ROOMS_LOCAL_STORAGE_KEY = (userId: string) => `user_rooms_${userId}`

export const userRoomsLocalStorageDescriptor = (userId: string) =>
  createLocalStorageDescriptor(USER_ROOMS_LOCAL_STORAGE_KEY(userId), USER_ROOMS_STORAGE)

let task: null | ReturnType<typeof trpc.room.joined.query> = null

export default function useUserRooms() {
  const [user] = useUser()
  const [state, setStateInStorage, ready] = useLocalStorage(
    useMemo(() => (user?.id ? userRoomsLocalStorageDescriptor(user.id) : undefined), [user?.id]),
  )

  useEffect(() => {
    if (!ready) {
      return
    }
    void (async () => {
      if (task) {
        return
      }
      task = trpc.room.joined.query()
      const fetched = await task

      if (fetched) {
        setStateInStorage(fetched)
      } else {
        setStateInStorage(undefined)
      }
    })()
  }, [ready, setStateInStorage])

  return [state] as const
}
