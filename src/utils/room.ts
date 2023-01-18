import { roomLocalStorageDescriptor } from '@/hooks/useRoomLocalStorage'
import trpc from './trpc'

const taskMap = new Map<string, ReturnType<typeof trpc.room.item.query>>()

export const fetchRoom = (roomId: string) => {
  const desc = roomLocalStorageDescriptor(roomId)
  const cache = desc.get()

  if (cache) {
    return Promise.resolve(cache)
  }

  const task = taskMap.get(roomId)

  if (task) {
    return task
  }

  const promise = trpc.room.item.query({ id: roomId }).then((value) => {
    desc.set(value)
    return value
  })

  taskMap.set(roomId, promise)

  return promise
}
