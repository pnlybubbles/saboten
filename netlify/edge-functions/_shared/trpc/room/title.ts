import { sessionProcedure } from '../server.ts'
import { z } from 'zod'
import prisma from '../../prisma.ts'

export default sessionProcedure
  .input(z.object({ id: z.string().uuid().nullable(), value: z.string().max(20) }))
  .mutation(async ({ input: { id, value: title }, ctx: { userId } }) => {
    if (id) {
      const room = await prisma.room.update({
        data: { title },
        where: { id },
        select: { id: true, title: true, members: true, events: true },
      })
      return room
    } else {
      const room = await prisma.room.create({
        data: { title, members: { create: { userId } } },
        select: { id: true, title: true, members: true, events: true },
      })
      return room
    }
  })
