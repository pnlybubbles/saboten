export const ROOM_SELECT = {
  id: true,
  title: true,
  members: { select: { id: true, name: true, user: { select: { id: true, name: true } } } },
  events: {
    select: {
      id: true,
      label: true,
      members: { select: { memberId: true } },
      payments: { select: { amount: true, paidByMemberId: true } },
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  },
} as const
