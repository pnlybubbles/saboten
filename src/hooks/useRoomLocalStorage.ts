import { useLocalStorage } from '@/hooks/useLocalStorage'
import { createLocalStorageDescriptor } from '@/utils/localstorage'
import { useMemo } from 'react'
import { z } from 'zod'

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

export const ROOM_LOCAL_STORAGE_KEY = (roomId: string) => `room_${roomId}`

export const roomLocalStorageDescriptor = (roomId: string) =>
  createLocalStorageDescriptor(ROOM_LOCAL_STORAGE_KEY(roomId), ROOM_SCHEMA)

export default function useRoomLocalStorage(roomId: string | null) {
  return useLocalStorage(useMemo(() => (roomId ? roomLocalStorageDescriptor(roomId) : undefined), [roomId]))
}
