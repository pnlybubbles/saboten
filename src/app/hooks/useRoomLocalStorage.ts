import { useLocalStorage } from '@/hooks/useLocalStorage'
import { createLocalStorageDescriptor } from '@/util/createLocalStorageDescriptor'
import { CURRENCY_CODE_SCHEMA } from '@shared/utils/currency'
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
      payments: z.array(
        z.object({ amount: z.string(), paidByMemberId: z.string().uuid(), currency: CURRENCY_CODE_SCHEMA }),
      ),
      createdAt: z.string().datetime(),
    }),
  ),
  currencyRate: z.array(
    z.object({
      currency: CURRENCY_CODE_SCHEMA,
      toCurrency: CURRENCY_CODE_SCHEMA,
      rate: z.number(),
      createdAt: z.string().datetime(),
    }),
  ),
})

export type Room = z.infer<typeof ROOM_SCHEMA>

export const ROOM_LOCAL_STORAGE_KEY = (roomId: string) => `room_${roomId}`

export const roomLocalStorageDescriptor = (roomId: string) =>
  createLocalStorageDescriptor(ROOM_LOCAL_STORAGE_KEY(roomId), ROOM_SCHEMA)

export default function useRoomLocalStorage(roomId: string | null) {
  return useLocalStorage(useMemo(() => (roomId ? roomLocalStorageDescriptor(roomId) : undefined), [roomId]))
}
