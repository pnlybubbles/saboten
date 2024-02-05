import { roomLocalStorageDescriptor } from '@app/hooks/useRoomLocalStorage'
import ok from './ok'
import type { RPCResponseType } from './rpc'
import rpc from './rpc'

const taskMap = new Map<string, Promise<RPCResponseType<typeof rpc.api.room.item.$get>>>()

export default function fetchRoom(roomId: string) {
  const desc = roomLocalStorageDescriptor(roomId)

  const task = taskMap.get(roomId)

  if (task) {
    return task
  }

  const promise = ok(rpc.api.room.item.$get({ json: { id: roomId } })).then((value) => {
    value.events.map((v) => v.payments)
    desc.set(value)
    return value
  })

  taskMap.set(roomId, promise)

  return promise
}
