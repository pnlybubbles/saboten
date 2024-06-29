import { createLocalStorageDescriptor } from '@app/util/createLocalStorageDescriptor'
import { z } from 'zod'
import { useLocalStorage } from './useLocalStorage'
import { useEffect, useState } from 'react'
import COMPRESSED_UUID_SCHEMA from '@util/COMPRESSED_UUID_SCHEMA'
import { userRoomsLocalStorageDescriptor } from './useUserRooms'
import { roomLocalStorageDescriptor } from './useRoomLocalStorage'
import type { RPCResponseType } from '@app/util/rpc'
import rpc from '@app/util/rpc'
import ok from '@app/util/ok'

const USER_STORAGE_DESCRIPTOR = createLocalStorageDescriptor(
  'user_id',
  z.object({
    id: z.string(),
    name: z.string(),
    secret: COMPRESSED_UUID_SCHEMA,
  }),
)

let task: null | Promise<RPCResponseType<typeof rpc.api.user.refresh.$post>> = null

export default function useUser() {
  const [user, setUserInStorage, ready] = useLocalStorage(USER_STORAGE_DESCRIPTOR)

  const setUser = async (props: { name: string }) => {
    if (user) {
      setUserInStorage({ ...user, ...props })
    }
    const data = await ok(rpc.api.user.item.$post({ json: props }))
    setUserInStorage(data)
    return data
  }

  const removeUser = async () => {
    if (!user) {
      return
    }
    await ok(rpc.api.user.leave.$post())
    setUserInStorage(undefined)
    const userRooms = userRoomsLocalStorageDescriptor(user.id)
    const rooms = userRooms.get()?.map((v) => v.id) ?? []
    for (const roomId of rooms) {
      roomLocalStorageDescriptor(roomId).set(undefined)
    }
    userRooms.set(undefined)
  }

  const restoreUser = async (compressedSecret: string) => {
    const fetched = await ok(rpc.api.user.refresh.$post({ json: { secret: compressedSecret } }))

    if (!('error' in fetched)) {
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

  const [refreshed, setRefreshed] = useState(false)

  useEffect(() => {
    if (!ready) {
      return
    }
    void (async () => {
      if (task) {
        return
      }
      task = ok(rpc.api.user.refresh.$post({ json: {} }))
      const fetched = await task

      setRefreshed(true)

      if (!('error' in fetched)) {
        setUserInStorage(fetched)
      } else {
        setUserInStorage(undefined)
      }
    })()
  }, [ready, setUserInStorage])

  return [user, { setUser, restoreUser, removeUser, ready, refreshed }] as const
}

export type User = NonNullable<ReturnType<typeof useUser>[0]>
