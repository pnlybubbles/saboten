import { formatISO, parseISO } from 'date-fns'
import type { ISO8601String } from '@util/date'

type Room = {
  id: string
  title: string
  createdAt: string
  archive: boolean
  currency: string | null
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
    ...serializeCreatedAt(room),
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
  createdAt: formatISO(parseISO(createdAt)) as ISO8601String,
})
