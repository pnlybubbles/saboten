import prisma from '../../prisma.ts'
import { sessionProcedure } from '../server.ts'

export default sessionProcedure.query(async ({ ctx: { userId } }) => {
  const rooms = await prisma.roomMember.findMany({
    where: { userId },
    select: { room: { select: { id: true, title: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return rooms.map(({ room }) => room)
})
