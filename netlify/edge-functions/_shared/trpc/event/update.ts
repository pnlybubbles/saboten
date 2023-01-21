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
        // TODO: paymentsはいったん1件までしか入らないはずなので、全件updateする
        payments: { updateMany: { where: {}, data: { paidByMemberId, amount } } },
        members: {
          deleteMany: {},
          createMany: { data: memberIds.map((memberId) => ({ memberId })) },
        },
      },
      include: { payments: true, members: true },
    })
    return event
  })
