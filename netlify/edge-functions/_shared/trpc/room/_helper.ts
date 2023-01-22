export const ROOM_SELECT = {
  id: true,
  title: true,
  members: {
    select: { id: true, name: true, user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  },
  events: {
    select: {
      id: true,
      label: true,
      members: { select: { memberId: true }, orderBy: { createdAt: 'asc' } },
      payments: { select: { amount: true, currency: true, paidByMemberId: true } },
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  },
} as const
