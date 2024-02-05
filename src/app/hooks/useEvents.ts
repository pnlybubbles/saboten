import fetchRoom from '@app/util/fetchRoom'
import type { Room } from './useRoomLocalStorage'
import { ROOM_LOCAL_STORAGE_KEY, roomLocalStorageDescriptor } from './useRoomLocalStorage'
import useStore, { createStore } from './useStore'
import genTmpId from '@app/util/genTmpId'
import { useCallback, useMemo } from 'react'
import useEnterNewRoom from './useEnterNewRoom'
import { parseISO } from 'date-fns'
import rpc from '@app/util/rpc'
import ok from '@app/util/ok'
import useRoomMember from './useRoomMember'

const transform = (room: Room) =>
  room.events.map((v) => ({
    ...v,
    id: v.id as string | null,
    tmpId: genTmpId(),
    createdAt: parseISO(v.createdAt),
  }))

const eventsStore = createStore(
  (roomId: string | null) => ROOM_LOCAL_STORAGE_KEY(roomId ?? 'tmp'),
  (roomId: string | null) => {
    if (roomId === null) {
      return Promise.resolve(null)
    }
    return fetchRoom(roomId).then(transform)
  },
  (roomId: string | null) => {
    if (roomId === null) {
      return null
    }
    const room = roomLocalStorageDescriptor(roomId).get()
    return room ? transform(room) : undefined
  },
)

export type EventPayload = {
  label: string
  amount: number
  currency: string
  paidByMemberId: string
  memberIds: string[]
}

export type EventPayloadAddPhase =
  | EventPayload
  | { label: string; amount: number; currency: string; paidByMemberId: null; memberIds: null }

export default function useEvents(roomId: string | null) {
  const [state, setState] = useStore(eventsStore, roomId)

  const enterNewRoom = useEnterNewRoom()

  const addEvent = useCallback(
    (event: EventPayloadAddPhase) =>
      setState(
        (current) => {
          if (current == undefined || event.paidByMemberId === null) {
            // ルームが未作成の場合にはoptimistic updateしない
            return current
          }
          return [
            {
              id: null,
              label: event.label,
              tmpId: genTmpId(),
              members: event.memberIds.map((memberId) => ({ memberId })),
              payments: [{ amount: event.amount, currency: event.currency, paidByMemberId: event.paidByMemberId }],
              createdAt: new Date(),
            },
            ...(current ?? []),
          ]
        },
        async () => {
          const data = await ok(rpc.api.event.add.$post({ json: { ...event, roomId } }))
          const desc = roomLocalStorageDescriptor(data.roomId)
          if (data.room) {
            desc.set(data.room)
            enterNewRoom(data.roomId)
            return
          } else {
            const current = desc.get()
            if (current === null) {
              // この時点でデータがキャッシュサれていないのは流石にエラー
              throw new Error('No cache')
            }
            desc.set({ ...current, events: data.events })
            return data.events.map((v) => ({ ...v, tmpId: genTmpId(), createdAt: parseISO(v.createdAt) }))
          }
        },
      ),
    [enterNewRoom, roomId, setState],
  )

  const updateEvent = useCallback(
    (event: EventPayload & { id: string }) =>
      setState(
        (current) => {
          if (current == undefined) {
            return current
          }
          const index = current.findIndex((v) => v.id === event.id)
          if (index === -1) {
            return current
          }
          return [
            ...current.slice(0, index),
            {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              ...current[index]!,
              id: event.id,
              label: event.label,
              members: event.memberIds.map((memberId) => ({ memberId })),
              payments: [{ amount: event.amount, currency: event.currency, paidByMemberId: event.paidByMemberId }],
            },
            ...current.slice(index + 1),
          ]
        },
        async () => {
          if (roomId === null) {
            // TODO: もしかしたらaddしたすぐ直後の場合はroomIdが確定していない可能性もある
            throw new Error('No room to remove event')
          }
          const data = await ok(rpc.api.event.update.$post({ json: { ...event, eventId: event.id } }))
          const desc = roomLocalStorageDescriptor(roomId)
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
          return events.map((v) => ({ ...v, tmpId: genTmpId(), createdAt: parseISO(v.createdAt) }))
        },
      ),
    [roomId, setState],
  )

  const removeEvent = useCallback(
    (eventId: string) =>
      setState(
        (current) => {
          if (current == undefined) {
            return current
          }
          const index = current.findIndex((v) => v.id === eventId)
          if (index === -1) {
            // 消すものがないので何もしない
            return current
          }
          return [...current.slice(0, index), ...current.slice(index + 1)]
        },
        async () => {
          if (roomId === null) {
            // TODO: もしかしたらaddしたすぐ直後の場合はroomIdが確定していない可能性もある
            throw new Error('No room to remove event')
          }
          const data = await ok(rpc.api.event.remove.$post({ json: { eventId, roomId } }))
          const desc = roomLocalStorageDescriptor(roomId)
          const current = desc.get()
          if (current === null) {
            // この時点でデータがキャッシュサれていないのは流石にエラー
            throw new Error('No cache')
          }
          desc.set({ ...current, events: data })
          return data.map((v) => ({ ...v, tmpId: genTmpId(), createdAt: parseISO(v.createdAt) }))
        },
      ),
    [roomId, setState],
  )

  // TODO: この依存は無い方が良い気がしつつ、参照方向としてはこれで自然な気もする
  const [, { getMember }] = useRoomMember(roomId)

  const validatedState = useMemo(
    () =>
      state
        ? state.map((event) => ({
            ...event,
            // すでに抜けているメンバーが居たら除去 (onDelete: cascade)
            members: event.members.filter((v) => getMember(v.memberId)),
            // すでに抜けているメンバーの支払いがある場合はnullにする (onDelete: set-null)
            payments: event.payments.map((v) =>
              v.paidByMemberId && getMember(v.paidByMemberId) ? v : { ...v, paidByMemberId: null },
            ),
          }))
        : state,
    [state, getMember],
  )

  return [validatedState, { addEvent, updateEvent, removeEvent }] as const
}

export type Event = NonNullable<ReturnType<typeof useEvents>[0]>[number]
