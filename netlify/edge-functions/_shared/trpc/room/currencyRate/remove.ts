import { z } from 'zod'
import prisma from '../../../prisma.ts'
import { CURRENCY_CODE_SCHEMA } from '../../../utils/currency.ts'
import { sessionProcedure } from '../../server.ts'
import { ROOM_SELECT } from '../_helper.ts'

export default sessionProcedure
  .input(
    z.object({
      roomId: z.string().uuid(),
      currency: CURRENCY_CODE_SCHEMA,
      toCurrency: CURRENCY_CODE_SCHEMA,
    }),
  )
  .mutation(async ({ input: keys }) => {
    await prisma.roomCurrencyRate.delete({
      where: { roomId_toCurrency_currency: keys },
    })
    const currencyRate = await prisma.roomCurrencyRate.findMany({
      where: { roomId: keys.roomId },
      ...ROOM_SELECT.currencyRate,
    })
    return currencyRate
  })
