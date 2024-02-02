import { createLocalStorageDescriptor } from '@app/util/createLocalStorageDescriptor'
import { z } from 'zod'
import { useLocalStorage } from './useLocalStorage'
import { useEffect } from 'react'
import { COMPRESSED_USER_ID_SCHEMA } from '@shared/utils/schema'
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
    compressedId: COMPRESSED_USER_ID_SCHEMA.optional(),
  }),
)

let task: null | Promise<RPCResponseType<typeof rpc.user.refresh.$post>> = null

export default function useUser() {
  const [user, setUserInStorage, ready] = useLocalStorage(USER_STORAGE_DESCRIPTOR)

  const setUser = async (props: { name: string }) => {
    if (user) {
      setUserInStorage({ ...user, ...props })
    }
    const res = await rpc.user.item.$post({ json: { id: user?.id, ...props } })
    const data = await res.json()
    setUserInStorage(data)
    return data
  }

  const removeUser = async () => {
    if (!user) {
      return
    }
    await rpc.user.leave.$post()
    setUserInStorage(undefined)
    const userRooms = userRoomsLocalStorageDescriptor(user.id)
    const rooms = userRooms.get()?.map((v) => v.id) ?? []
    for (const roomId of rooms) {
      roomLocalStorageDescriptor(roomId).set(undefined)
    }
    userRooms.set(undefined)
  }

  const restoreUser = async (compressedUserId: string) => {
    const fetched = await ok(rpc.user.refresh.$post({ json: { compressedUserId } }))

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

  useEffect(() => {
    if (!ready) {
      return
    }
    void (async () => {
      if (task) {
        return
      }
      task = ok(rpc.user.refresh.$post({ json: {} }))
      const fetched = await task

      if (!('error' in fetched)) {
        setUserInStorage(fetched)
      } else {
        setUserInStorage(undefined)
      }
    })()
  }, [ready, setUserInStorage])

  return [user, { setUser, restoreUser, removeUser }] as const
}

export type User = NonNullable<ReturnType<typeof useUser>[0]>
