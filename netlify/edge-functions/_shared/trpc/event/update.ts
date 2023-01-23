import { sessionProcedure } from '../server.ts'
import { z } from 'zod'
import prisma from '../../prisma.ts'
import { DECIMAL_SCHEMA } from '../../utils/decimal.ts'
import { CURRENCY_CODE_SCHEMA } from '../../utils/currency.ts'
import { ROOM_SELECT, serializeEvent } from '../room/_helper.ts'

export default sessionProcedure
  .input(
    z.object({
      eventId: z.string().uuid(),
      label: z.string(),
      amount: DECIMAL_SCHEMA,
      currency: CURRENCY_CODE_SCHEMA,
      paidByMemberId: z.string().uuid(),
      memberIds: z.array(z.string().uuid()),
    }),
  )
  .mutation(async ({ input: { eventId, label, amount, currency, paidByMemberId, memberIds } }) => {
    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        label,
        // TODO: paymentsはいったん1件までしか入らないはずなので、全件updateする
        payments: { updateMany: { where: {}, data: { paidByMemberId, amount: BigInt(amount), currency } } },
        members: {
          deleteMany: {},
          createMany: { data: memberIds.map((memberId) => ({ memberId })) },
        },
      },
      select: ROOM_SELECT.events.select,
    })
    return serializeEvent(event)
  })
