import trpc from '@/utils/trpc'
import { useCallback } from 'react'
import useStore, { createStore } from './useStore'
import { ROOM_LOCAL_STORAGE_KEY, roomLocalStorageDescriptor } from './useRoomLocalStorage'
import useEnterNewRoom from './useEnterNewRoom'
import { fetchRoom } from '@/utils/room'

const roomTitleStore = createStore(
  (roomId: string | null) => ROOM_LOCAL_STORAGE_KEY(roomId ?? 'tmp'),
  (roomId: string | null) => {
    if (roomId === null) {
      return Promise.resolve('')
    }
    return fetchRoom(roomId).then((v) => v.title)
  },
)

export default function useRoomTitle(roomId: string | null) {
  const [state, setState] = useStore(roomTitleStore, roomId)

  const enterNewRoom = useEnterNewRoom()

  const setTitle = useCallback(
    (value: string) => {
      void setState(value, async (value) => {
        const { id, title, room } = await trpc.room.title.mutate({ id: roomId, value })
        const desc = roomLocalStorageDescriptor(id)
        if (room) {
          desc.set(room)
          enterNewRoom(id)
        } else {
          const current = desc.get()
          if (current === null) {
            // この時点でデータがキャッシュサれていないのは流石にエラー
            throw new Error('No cache')
          }
          desc.set({ ...current, title })
        }
      })
    },
    [enterNewRoom, roomId, setState],
  )

  return [state, setTitle] as const
}
