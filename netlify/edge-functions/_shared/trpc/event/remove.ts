import { z } from 'zod'
import prisma from '../../prisma.ts'
import { ROOM_SELECT } from '../room/_helper.ts'
import { sessionProcedure } from '../server.ts'

export default sessionProcedure
  .input(z.object({ roomId: z.string().uuid(), eventId: z.string().uuid() }))
  .mutation(async ({ input: { eventId, roomId } }) => {
    await prisma.event.delete({ where: { id: eventId } })
    const events = await prisma.event.findMany({ where: { roomId }, ...ROOM_SELECT.events })
    return events
  })
