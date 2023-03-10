import { publicProcedure } from '../server.ts'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import prisma from '../../prisma.ts'
import { ROOM_SELECT, serializeRoom } from './_helper.ts'

export default publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input: { id } }) => {
  const room = await prisma.room.findUnique({
    where: { id },
    select: ROOM_SELECT,
  })
  if (!room) {
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }
  return serializeRoom(room)
})
