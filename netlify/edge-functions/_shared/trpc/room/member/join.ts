import { z } from 'zod'
import prisma from '../../../prisma.ts'
import { sessionProcedure } from '../../server.ts'
import { ROOM_SELECT } from '../_helper.ts'

export default sessionProcedure
  .input(z.object({ roomId: z.string().uuid(), memberId: z.string().uuid().nullable() }))
  .mutation(async ({ input: { roomId, memberId }, ctx: { userId } }) => {
    if (memberId) {
      await prisma.roomMember.update({
        data: { room: { connect: { id: roomId } }, user: { connect: { id: userId } } },
        where: { id: memberId },
      })
      const members = await prisma.roomMember.findMany({
        where: { roomId },
        select: ROOM_SELECT.members.select,
      })
      return members
    } else {
      await prisma.roomMember.create({
        data: { room: { connect: { id: roomId } }, user: { connect: { id: userId } } },
      })
      const members = await prisma.roomMember.findMany({
        where: { roomId },
        select: ROOM_SELECT.members.select,
      })
      return members
    }
  })
