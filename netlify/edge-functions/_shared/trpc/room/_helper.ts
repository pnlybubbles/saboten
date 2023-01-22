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
