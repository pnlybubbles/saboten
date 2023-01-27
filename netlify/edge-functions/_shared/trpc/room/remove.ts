import { sessionProcedure } from '../server.ts'
import { z } from 'zod'
import prisma from '../../prisma.ts'

export default sessionProcedure
  .input(z.object({ roomId: z.string().uuid() }))
  .mutation(async ({ input: { roomId } }) => {
    await prisma.room.delete({ where: { id: roomId } })
  })
