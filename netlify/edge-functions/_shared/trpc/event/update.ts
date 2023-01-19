import { sessionProcedure } from '../server.ts'
import { z } from 'zod'
import prisma from '../../prisma.ts'
import { DECIMAL_SCHEMA } from '../../utils/decimal.ts'

export default sessionProcedure
  .input(
    z.object({
      eventId: z.string().uuid(),
      label: z.string(),
      amount: DECIMAL_SCHEMA,
      paidByMemberId: z.string().uuid(),
      memberIds: z.array(z.string().uuid()),
    }),
  )
  .mutation(async ({ input: { eventId, label, amount, paidByMemberId, memberIds } }) => {
    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        label,
        payments: { update: { where: { eventId_paidByMemberId: { eventId, paidByMemberId } }, data: { amount } } },
        members: { createMany: { data: memberIds.map((memberId) => ({ memberId })), skipDuplicates: true } },
      },
      include: { payments: true, members: true },
    })
    return event
  })
