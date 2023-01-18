import { TRPCError } from '@trpc/server'
import { sessionProcedure } from '../server.ts'
import { z } from 'zod'
import prisma from '../../prisma.ts'
import { ROOM_SELECT } from '../room/_helper.ts'
import { DECIMAL_SCHEMA } from '../../utils/decimal.ts'

export default sessionProcedure
  .input(
    z.object({
      roomId: z.string().uuid().nullable(),
      label: z.string(),
      amount: DECIMAL_SCHEMA,
      paidByMemberId: z.string().uuid().nullable(),
      memberIds: z.array(z.string().uuid()).nullable(),
    }),
  )
  .mutation(async ({ input: { roomId, label, paidByMemberId, memberIds, amount }, ctx: { userId } }) => {
    if (roomId) {
      if (paidByMemberId === null || memberIds === null) {
        // すでにルームがある場合にはmemberIdの指定は必須
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }
      const event = await prisma.event.create({
        data: {
          room: { connect: { id: roomId } },
          label,
          payments: { create: { paiedByMember: { connect: { id: paidByMemberId } }, amount } },
          members: { createMany: { data: memberIds.map((memberId) => ({ memberId })) } },
        },
        include: { payments: true, members: true },
      })
      return {
        room: null,
        roomId,
        event,
      }
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
        include: { payments: true, members: true },
      })
      return {
        room,
        roomId: room.id,
        event,
      }
    }
  })
