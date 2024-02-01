import { Hono } from 'hono'
import type { Env } from './type'
import auth from './middleware/auth'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { CURRENCY_CODE_SCHEMA } from '@util/currency'
import { drizzle } from 'drizzle-orm/d1'
import schema from '@db/schema'
import { and, asc, eq } from 'drizzle-orm'
import { HTTPException } from 'hono/http-exception'
import { serializeCreatedAt } from '@db/serialize'

const roomCurrencyRate = new Hono<Env>()
  .post(
    '/update',
    auth,
    zValidator(
      'json',
      z.object({
        roomId: z.string().uuid(),
        currency: CURRENCY_CODE_SCHEMA,
        toCurrency: CURRENCY_CODE_SCHEMA,
        rate: z.number(),
      }),
    ),
    async (c) => {
      const db = drizzle(c.env.DB, { schema })
      const { roomId, currency, toCurrency, rate } = c.req.valid('json')
      const { userId } = c.var
      const [row] = await db
        .select()
        .from(schema.roomMember)
        .where(and(eq(schema.roomMember.roomId, roomId), eq(schema.roomMember.userId, userId)))
      if (row === undefined) {
        throw new HTTPException(403, { message: 'Only member can update the currency rate' })
      }
      await db
        .insert(schema.roomCurrencyRate)
        .values({ rate, roomId, currency, toCurrency })
        .onConflictDoUpdate({
          target: [
            schema.roomCurrencyRate.roomId,
            schema.roomCurrencyRate.currency,
            schema.roomCurrencyRate.toCurrency,
          ],
          set: { rate },
        })
      const currencyRate = await db.query.roomCurrencyRate.findMany({
        where: (currencyRate) => eq(currencyRate.roomId, roomId),
        orderBy: (currencyRate) => asc(currencyRate.createdAt),
      })
      return c.json(currencyRate.map(serializeCreatedAt))
    },
  )
  .post(
    '/remove',
    auth,
    zValidator(
      'json',
      z.object({
        roomId: z.string().uuid(),
        currency: CURRENCY_CODE_SCHEMA,
        toCurrency: CURRENCY_CODE_SCHEMA,
      }),
    ),
    async (c) => {
      const db = drizzle(c.env.DB, { schema })
      const { roomId, currency, toCurrency } = c.req.valid('json')
      await db
        .delete(schema.roomCurrencyRate)
        .where(
          and(
            eq(schema.roomCurrencyRate.roomId, roomId),
            eq(schema.roomCurrencyRate.currency, currency),
            eq(schema.roomCurrencyRate.toCurrency, toCurrency),
          ),
        )
      const currencyRate = await db.query.roomCurrencyRate.findMany({
        where: (currencyRate) => eq(currencyRate.roomId, roomId),
        orderBy: (currencyRate) => asc(currencyRate.createdAt),
      })
      return c.json(currencyRate.map(serializeCreatedAt))
    },
  )

export default roomCurrencyRate
