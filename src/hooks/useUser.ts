import { createLocalStorageDescriptor } from '@/utils/localstorage'
import { z } from 'zod'
import { useLocalStorage } from './useLocalStorage'
import { useEffect } from 'react'
import trpc from '@/utils/trpc'

const USER_STORAGE_DESCRIPTOR = createLocalStorageDescriptor(
  'user_id',
  z.object({
    id: z.string(),
    name: z.string(),
  }),
)

let task: null | ReturnType<typeof trpc.user.refresh.mutate> = null

export default function useUser() {
  const [user, setUserInStorage] = useLocalStorage(USER_STORAGE_DESCRIPTOR)

  const setUser = async (props: { name: string }) => {
    const fetched = await trpc.user.item.mutate({ id: user?.id, ...props })
    setUserInStorage(fetched)
  }

  useEffect(() => {
    // TODO: 一定時間でrevalidate
    if (user) {
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
      }
    })()
  }, [setUserInStorage, user])

  return [user, setUser] as const
}
