export const ROOM_SELECT = {
  id: true,
  title: true,
  members: { select: { id: true, name: true, user: { select: { id: true, name: true } } } },
  events: true,
} as const
