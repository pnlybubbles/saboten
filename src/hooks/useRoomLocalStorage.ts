import { useLocalStorage } from '@/hooks/useLocalStorage'
import { createLocalStorageDescriptor } from '@/utils/basic/createLocalStorageDescriptor'
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
  events: z.array(
    z.object({
      id: z.string().uuid(),
      label: z.string(),
      members: z.array(z.object({ memberId: z.string().uuid() })),
      payments: z.array(z.object({ amount: z.string(), paidByMemberId: z.string().uuid() })),
    }),
  ),
})

export const ROOM_LOCAL_STORAGE_KEY = (roomId: string) => `room_${roomId}`

export const roomLocalStorageDescriptor = (roomId: string) =>
  createLocalStorageDescriptor(ROOM_LOCAL_STORAGE_KEY(roomId), ROOM_SCHEMA)

export default function useRoomLocalStorage(roomId: string | null) {
  return useLocalStorage(useMemo(() => (roomId ? roomLocalStorageDescriptor(roomId) : undefined), [roomId]))
}
