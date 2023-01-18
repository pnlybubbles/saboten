import { sessionProcedure } from '../server.ts'
import { z } from 'zod'
import prisma from '../../prisma.ts'
import { ROOM_SELECT } from './_helper.ts'

export default sessionProcedure
  .input(z.object({ roomId: z.string().uuid().nullable(), value: z.string().max(20) }))
  .mutation(async ({ input: { roomId, value: title }, ctx: { userId } }) => {
    if (roomId) {
      const room = await prisma.room.update({
        data: { title },
        where: { id: roomId },
      })
      return {
        roomId,
        title: room.title,
        room: null,
      }
    } else {
      const room = await prisma.room.create({
        data: { title, members: { create: { userId } } },
        select: ROOM_SELECT,
      })
      return {
        roomId: room.id,
        title: room.title,
        room,
      }
    }
  })
