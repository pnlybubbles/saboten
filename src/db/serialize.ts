import { formatISO, parse } from 'date-fns'
import type { ISO8601String } from '@util/date'

type Room = {
  id: string
  title: string
  members: {
    id: string
    name: string
    createdAt: string
    user: { id: string; name: string } | null
  }[]
  events: {
    id: string
    label: string
    members: {
      memberId: string
      createdAt: string
    }[]
    payments: {
      amount: number
      currency: string
      paidByMemberId: string | null
    }[]
    createdAt: string
  }[]
  currencyRate: {
    currency: string
    toCurrency: string
    rate: number
    createdAt: string
  }[]
}

export default function serializeRoom(room: Room) {
  return {
    ...room,
    members: room.members.map(serializeCreatedAt),
    events: room.events.map(serializeEvent),
    currencyRate: room.currencyRate.map(serializeCreatedAt),
  }
}

export const serializeEvent = (event: Room['events'][number]) =>
  serializeCreatedAt({
    ...event,
    members: event.members.map(serializeCreatedAt),
  })

export const serializeCreatedAt = <T extends { createdAt: string }>({ createdAt, ...rest }: T) => ({
  ...rest,
  createdAt: formatISO(parse(createdAt, 'yyyy-MM-dd HH:mm:ss', new Date())) as ISO8601String,
})
