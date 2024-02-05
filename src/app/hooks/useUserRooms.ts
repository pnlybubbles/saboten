import { createLocalStorageDescriptor } from '@app/util/createLocalStorageDescriptor'
import { z } from 'zod'
import { useLocalStorage } from './useLocalStorage'
import { useEffect, useMemo } from 'react'
import useUser from './useUser'
import { useCallback } from 'react'
import type { RPCResponseType } from '@app/util/rpc'
import rpc from '@app/util/rpc'
import ok from '@app/util/ok'

const USER_ROOMS_STORAGE = z.array(z.object({ id: z.string(), title: z.string() }))

export const USER_ROOMS_LOCAL_STORAGE_KEY = (userId: string) => `user_rooms_${userId}`

export const userRoomsLocalStorageDescriptor = (userId: string) =>
  createLocalStorageDescriptor(USER_ROOMS_LOCAL_STORAGE_KEY(userId), USER_ROOMS_STORAGE)

let onceFetched = false
let task: null | Promise<RPCResponseType<typeof rpc.api.room.joined.$get>> = null

export default function useUserRooms() {
  const [user] = useUser()
  const [state, setStateInStorage, ready] = useLocalStorage(
    useMemo(() => (user?.id ? userRoomsLocalStorageDescriptor(user.id) : undefined), [user?.id]),
  )

  const revalidate = useCallback(async () => {
    if (task) {
      return
    }
    task = ok(rpc.api.room.joined.$get())
    const fetched = await task
    task = null

    if (fetched) {
      setStateInStorage(fetched)
    } else {
      setStateInStorage(undefined)
    }
  }, [setStateInStorage])

  useEffect(() => {
    if (!ready) {
      return
    }
    if (onceFetched) {
      return
    }
    onceFetched = true
    void revalidate()
  }, [ready, revalidate])

  return [state, { revalidate }] as const
}
