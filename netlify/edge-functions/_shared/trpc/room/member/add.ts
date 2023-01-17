import { z } from 'zod'
import prisma from '../../../prisma.ts'
import { sessionProcedure } from '../../server.ts'
import { ROOM_SELECT } from '../_helper.ts'

export default sessionProcedure
  .input(z.object({ roomId: z.string().uuid().nullable(), name: z.string() }))
  .mutation(async ({ input: { roomId, name }, ctx: { userId } }) => {
    if (roomId) {
      const member = await prisma.roomMember.create({ data: { name, room: { connect: { id: roomId } } } })
      return {
        type: 'member' as const,
        data: member,
      }
    } else {
      const room = await prisma.room.create({
        data: { members: { createMany: { data: [{ userId }, { name }] } } },
        select: ROOM_SELECT,
      })
      return {
        type: 'room' as const,
        data: room,
      }
    }
  })
