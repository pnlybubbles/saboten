import { createLocalStorageDescriptor } from '@/utils/basic/createLocalStorageDescriptor'
import { z } from 'zod'
import { useLocalStorage } from './useLocalStorage'
import { useEffect } from 'react'
import trpc from '@/utils/trpc'
import { COMPRESSED_USER_ID_SCHEMA } from '@shared/utils/schema'

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

  const restoreUser = async (compressedUserId: string) => {
    const fetched = await trpc.user.refresh.mutate({ compressedUserId })

    if (fetched) {
      setUserInStorage(fetched)
    } else {
      setUserInStorage(undefined)
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

  return [user, { setUser, restoreUser }] as const
}

export type User = NonNullable<ReturnType<typeof useUser>[0]>
