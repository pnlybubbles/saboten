import { z } from 'zod'
import prisma from '../../../prisma.ts'
import { sessionProcedure } from '../../server.ts'

export default sessionProcedure
  .input(z.object({ roomId: z.string().uuid(), memberId: z.string().uuid() }))
  .mutation(async ({ input: { memberId } }) => {
    await prisma.roomMember.delete({ where: { id: memberId } })
  })
