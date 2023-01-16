import { publicProcedure } from '../server.ts'
import { z } from 'zod'
import prisma from '../../prisma.ts'

export default publicProcedure
  .input(z.object({ id: z.string().uuid().optional(), value: z.string().max(20) }))
  .mutation(async ({ input: { id, value: title } }) => {
    if (id) {
      const room = await prisma.room.update({ data: { title }, where: { id } })
      return room
    } else {
      const room = await prisma.room.create({ data: { title } })
      return room
    }
  })
