import fetchRoom from '@/utils/fetchRoom'
import { ROOM_LOCAL_STORAGE_KEY } from './useRoomLocalStorage'
import useStore, { createStore } from './useStore'
import genTmpId from '@/utils/basic/genTmpId'
import { useCallback } from 'react'

const eventsStore = createStore(
  (roomId: string | null) => ROOM_LOCAL_STORAGE_KEY(roomId ?? 'tmp'),
  (roomId: string | null) => {
    if (roomId === null) {
      return Promise.resolve([])
    }
    return fetchRoom(roomId).then((v) =>
      v.events.map((v) => ({
        ...v,
        id: v.id as string | null,
        tmpId: genTmpId(),
        payments: v.payments.map((w) => ({ ...w, id: w.id as string | null })),
      })),
    )
  },
)

export default function useEvents(roomId: string | null) {
  const [state, setState] = useStore(eventsStore, roomId)

  const addEvent = useCallback(
    (event: { label: string; paidByMemberId: string; memberIds: string[]; amount: string }) =>
      setState((current) => [
        ...(current ?? []),
        {
          id: null,
          label: event.label,
          tmpId: genTmpId(),
          members: event.memberIds.map((memberId) => ({ memberId })),
          payments: [{ id: null, amount: event.amount, paidByMemberId: event.paidByMemberId }],
        },
      ]),
    [setState],
  )

  return [state, { addEvent }] as const
}
