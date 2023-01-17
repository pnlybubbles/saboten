import { z } from 'zod'
import prisma from '../../prisma.ts'
import { publicProcedure } from '../server.ts'

export const addMember = publicProcedure
  .input(z.object({ roomId: z.string().uuid(), name: z.string() }))
  .mutation(async ({ input: { roomId, name } }) => {
    const member = await prisma.roomMember.create({ data: { name, room: { connect: { id: roomId } } } })
    return member
  })
