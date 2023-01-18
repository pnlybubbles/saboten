import { TRPCError } from '@trpc/server'
import { sessionProcedure } from '../server.ts'
import { z } from 'zod'
import prisma from '../../prisma.ts'
import { ROOM_SELECT } from '../room/_helper.ts'

export default sessionProcedure
  .input(
    z.object({
      roomId: z.string().uuid().nullable(),
      label: z.string(),
      amount: z.number(),
      paidByMemberId: z.string().uuid(),
      eventMemberIds: z.array(z.string().uuid()),
    }),
  )
  .mutation(async ({ input: { roomId, label, paidByMemberId, eventMemberIds, amount }, ctx: { userId } }) => {
    if (roomId) {
      const event = await prisma.event.create({
        data: {
          room: { connect: { id: roomId } },
          label,
          payments: { create: { paiedByMember: { connect: { id: paidByMemberId } }, amount } },
          members: { createMany: { data: eventMemberIds.map((memberId) => ({ memberId })) } },
        },
        include: { payments: true },
      })
      return event
    } else {
      const room = await prisma.room.create({
        data: { members: { createMany: { data: [{ userId }] } } },
        select: ROOM_SELECT,
      })
      const memberId = room.members.find((v) => v.user?.id !== userId)?.id
      if (memberId === undefined) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }
      const event = await prisma.event.create({
        data: {
          room: { connect: { id: room.id } },
          payments: { create: { paiedByMember: { connect: { id: memberId } }, amount } },
          members: { create: { member: { connect: { id: memberId } } } },
        },
      })
      return event
    }
  })
