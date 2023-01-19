import fetchRoom from '@/utils/fetchRoom'
import { ROOM_LOCAL_STORAGE_KEY, roomLocalStorageDescriptor } from './useRoomLocalStorage'
import useStore, { createStore } from './useStore'
import genTmpId from '@/utils/basic/genTmpId'
import { useCallback } from 'react'
import trpc from '@/utils/trpc'
import useEnterNewRoom from './useEnterNewRoom'

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
      })),
    )
  },
)

export type EventPayload = {
  label: string
  amount: string
  paidByMemberId: string
  memberIds: string[]
}

export default function useEvents(roomId: string | null) {
  const [state, setState] = useStore(eventsStore, roomId)

  const enterNewRoom = useEnterNewRoom()

  const addEvent = useCallback(
    (event: EventPayload) =>
      setState(
        (current) => [
          ...(current ?? []),
          {
            id: null,
            label: event.label,
            tmpId: genTmpId(),
            members: event.memberIds.map((memberId) => ({ memberId })),
            payments: [{ id: null, amount: event.amount, paidByMemberId: event.paidByMemberId }],
          },
        ],
        async () => {
          const data = await trpc.event.add.mutate({ ...event, roomId })
          const desc = roomLocalStorageDescriptor(data.roomId)
          if (data.room) {
            desc.set(data.room)
            enterNewRoom(data.roomId)
          } else {
            const current = desc.get()
            if (current === null) {
              // この時点でデータがキャッシュサれていないのは流石にエラー
              throw new Error('No cache')
            }
            desc.set({ ...current, events: data.events })
          }
          return data.events.map((v) => ({ ...v, tmpId: genTmpId() }))
        },
      ),
    [enterNewRoom, roomId, setState],
  )

  const updateEvent = useCallback(
    (event: EventPayload & { id: string }) =>
      setState(
        (current) => {
          if (current === undefined) {
            return current
          }
          const index = current.findIndex((v) => v.id === event.id)
          if (index === -1) {
            return current
          }
          return [
            ...current.slice(0, index),
            {
              id: event.id,
              label: event.label,
              tmpId: genTmpId(),
              members: event.memberIds.map((memberId) => ({ memberId })),
              payments: [{ id: null, amount: event.amount, paidByMemberId: event.paidByMemberId }],
            },
            ...current.slice(index + 1),
          ]
        },
        async () => {
          const data = await trpc.event.update.mutate({ ...event, eventId: event.id })
          const desc = roomLocalStorageDescriptor(data.roomId)
          const current = desc.get()
          if (current === null) {
            // この時点でデータがキャッシュサれていないのは流石にエラー
            throw new Error('No cache')
          }
          const index = current.events.findIndex((v) => v.id === data.id)
          if (index === -1) {
            return
          }
          const events = [...current.events.slice(0, index), data, ...current.events.slice(index + 1)]
          desc.set({
            ...current,
            events: events,
          })
          return events.map((v) => ({ ...v, tmpId: genTmpId() }))
        },
      ),
    [setState],
  )

  return [state, { addEvent, updateEvent }] as const
}

export type Event = NonNullable<ReturnType<typeof useEvents>[0]>[number]
