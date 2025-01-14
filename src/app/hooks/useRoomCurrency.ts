import { useCallback } from 'react'
import useStore, { createStore } from './useStore'
import type { Room } from './useRoomLocalStorage'
import { ROOM_LOCAL_STORAGE_KEY, roomLocalStorageDescriptor } from './useRoomLocalStorage'
import fetchRoom from '@app/util/fetchRoom'
import rpc from '@app/util/rpc'
import ok from '@app/util/ok'

const transform = (room: Room) => room.currency

const roomCurrencyStore = createStore(
  (roomId: string | null) => (roomId ? ROOM_LOCAL_STORAGE_KEY(roomId) : null),
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

export default function useRoomCurrency(roomId: string | null) {
  const [state, setState] = useStore(roomCurrencyStore, roomId)

  const setCurrency = useCallback(
    (value: string | null) =>
      setState(value, async () => {
        if (roomId === null) {
          // TODO: 部屋ができていないのにルーム通貨の設定は不可能
          throw new Error('No room to remove member')
        }
        const { currency } = await ok(rpc.api.room.currency.$post({ json: { roomId, value } }))
        const desc = roomLocalStorageDescriptor(roomId)
        const current = desc.get()
        if (current === null) {
          // この時点でデータがキャッシュサれていないのは流石にエラー
          throw new Error('No cache')
        }
        desc.set({ ...current, currency })
      }),
    [roomId, setState],
  )

  return [state ?? null, setCurrency] as const
}
