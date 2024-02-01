import { useCallback } from 'react'
import useStore, { createStore } from './useStore'
import type { Room } from './useRoomLocalStorage'
import { ROOM_LOCAL_STORAGE_KEY, roomLocalStorageDescriptor } from './useRoomLocalStorage'
import useEnterNewRoom from './useEnterNewRoom'
import fetchRoom from '@app/util/fetchRoom'
import rpc from '@app/util/rpc'
import ok from '@app/util/ok'

const transform = (room: Room) => room.title

const roomTitleStore = createStore(
  (roomId: string | null) => ROOM_LOCAL_STORAGE_KEY(roomId ?? 'tmp'),
  (roomId: string | null) => {
    if (roomId === null) {
      return Promise.resolve('')
    }
    return fetchRoom(roomId).then(transform)
  },
  (roomId: string | null) => {
    if (roomId === null) {
      return ''
    }
    const room = roomLocalStorageDescriptor(roomId).get()
    return room ? transform(room) : undefined
  },
)

export default function useRoomTitle(roomIdOrNull: string | null) {
  const [state, setState] = useStore(roomTitleStore, roomIdOrNull)

  const enterNewRoom = useEnterNewRoom()

  const setTitle = useCallback(
    (value: string) =>
      setState(value, async () => {
        const { roomId, room, ...rest } = await ok(rpc.room.title.$post({ json: { roomId: roomIdOrNull, value } }))
        const desc = roomLocalStorageDescriptor(roomId)
        if (room) {
          desc.set(room)
          enterNewRoom(roomId)
        } else {
          const current = desc.get()
          if (current === null) {
            // この時点でデータがキャッシュサれていないのは流石にエラー
            throw new Error('No cache')
          }
          desc.set({ ...current, title: rest.title })
        }
      }),
    [enterNewRoom, roomIdOrNull, setState],
  )

  return [state, setTitle] as const
}
