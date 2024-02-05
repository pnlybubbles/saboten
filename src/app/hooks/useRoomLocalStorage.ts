import { useLocalStorage } from '@app/hooks/useLocalStorage'
import { createLocalStorageDescriptor } from '@app/util/createLocalStorageDescriptor'
import { CURRENCY_CODE_SCHEMA } from '@shared/utils/currency'
import ISO8601_STRING_SCHEMA from '@util/ISO8601_STRING_SCHEMA'
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
        z.object({ amount: z.number(), paidByMemberId: z.string().uuid().nullable(), currency: CURRENCY_CODE_SCHEMA }),
      ),
      createdAt: ISO8601_STRING_SCHEMA,
    }),
  ),
  currencyRate: z.array(
    z.object({
      currency: CURRENCY_CODE_SCHEMA,
      toCurrency: CURRENCY_CODE_SCHEMA,
      rate: z.number(),
      createdAt: ISO8601_STRING_SCHEMA,
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
