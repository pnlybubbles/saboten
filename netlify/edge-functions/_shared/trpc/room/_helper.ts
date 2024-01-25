export const ROOM_SELECT = {
  id: true,
  title: true,
  members: {
    select: { id: true, name: true, createdAt: true, user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  },
  events: {
    select: {
      id: true,
      label: true,
      members: { select: { memberId: true, createdAt: true }, orderBy: { createdAt: 'asc' } },
      payments: { select: { amount: true, currency: true, paidByMemberId: true } },
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  },
  currencyRate: {
    select: {
      currency: true,
      toCurrency: true,
      rate: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  },
} as const

type Room = {
  id: string
  title: string
  members: {
    id: string
    name: string | null
    createdAt: Date
    user: { id: string; name: string } | null
  }[]
  events: {
    id: string
    label: string
    members: {
      memberId: string
      createdAt: Date
    }[]
    payments: {
      amount: bigint
      currency: string
      paidByMemberId: string
    }[]
    createdAt: Date
  }[]
  currencyRate: {
    currency: string
    toCurrency: string
    rate: number
    createdAt: Date
  }[]
}

export const serializeRoom = (room: Room) => ({
  ...room,
  members: room.members.map(serializeCreatedAt),
  events: room.events.map(serializeEvent),
  currencyRate: room.currencyRate.map(serializeCreatedAt),
})

export const serializeEvent = (event: Room['events'][number]) =>
  serializeCreatedAt({
    ...event,
    members: event.members.map(serializeCreatedAt),
    payments: event.payments.map(({ amount, ...payment }) => ({ ...payment, amount: amount.toString() })),
  })

export const serializeCreatedAt = <T extends { createdAt: Date }>({ createdAt, ...rest }: T) => ({
  ...rest,
  createdAt: createdAt.toISOString(),
})
