import { z } from 'zod'
import prisma from '../../../prisma.ts'
import { sessionProcedure } from '../../server.ts'
import { ROOM_SELECT } from '../_helper.ts'

export default sessionProcedure
  .input(z.object({ roomId: z.string().uuid(), memberId: z.string().uuid() }))
  .mutation(async ({ input: { roomId, memberId } }) => {
    await prisma.roomMember.delete({ where: { id: memberId } })
    const members = await prisma.roomMember.findMany({
      where: { roomId },
      select: ROOM_SELECT.members.select,
    })
    return members
  })
