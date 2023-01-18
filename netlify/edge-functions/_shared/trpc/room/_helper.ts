export const ROOM_SELECT = {
  id: true,
  title: true,
  members: { select: { id: true, name: true, user: { select: { id: true, name: true } } } },
  events: {
    select: {
      id: true,
      label: true,
      members: { select: { memberId: true } },
      payments: { select: { id: true, amount: true, paidByMemberId: true } },
    },
  },
} as const
