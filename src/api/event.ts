import { Hono } from 'hono'
import type { Env } from './type'
import auth from './middleware/auth'
import { zValidator } from '@hono/zod-validator'
import { drizzle } from 'drizzle-orm/d1'
import { z } from 'zod'
import { CURRENCY_CODE_SCHEMA } from '@util/currency'
import { HTTPException } from 'hono/http-exception'
import schema from '@db/schema'
import uuid from '@api/util/uuid'
import first from '@util/first'
import { and, asc, desc, eq } from 'drizzle-orm'
import serializeRoom, { serializeEvent } from '@db/serialize'

const event = new Hono<Env>()
  .post(
    '/add',
    auth,
    zValidator(
      'json',
      z.object({
        roomId: z.string().uuid().nullable(),
        label: z.string(),
        memberIds: z.array(z.string().uuid()).nullable(),
        payments: z
          .array(
            z.object({
              amount: z.number().int(),
              currency: CURRENCY_CODE_SCHEMA,
              paidByMemberId: z.string().uuid().nullable(),
            }),
          )
          .min(1),
      }),
    ),
    async (c) => {
      const db = drizzle(c.env.DB, { schema })
      const { roomId, label, memberIds, payments } = c.req.valid('json')
      const { userId } = c.var
      if (roomId) {
        if (payments.some((v) => v.paidByMemberId === null) || memberIds === null) {
          // すでにルームがある場合にはmemberIdの指定は必須
          throw new HTTPException(400, { message: 'memberIds required' })
        }
        const [row] = await db
          .select()
          .from(schema.roomMember)
          .where(and(eq(schema.roomMember.roomId, roomId), eq(schema.roomMember.userId, userId)))
        if (row === undefined) {
          throw new HTTPException(403, { message: 'Only member can delete the event' })
        }
        const event = first(await db.insert(schema.event).values({ id: uuid(), roomId, label }).returning())
        await db.insert(schema.eventPayment).values(
          payments.map(({ amount, currency, paidByMemberId }) => ({
            eventId: event.id,
            amount,
            currency,
            paidByMemberId,
          })),
        )
        await db.insert(schema.eventMember).values(memberIds.map((memberId) => ({ eventId: event.id, memberId })))
        const events = await db.query.event.findMany({
          where: (event) => eq(event.roomId, roomId),
          orderBy: (event) => desc(event.createdAt),
          with: { members: { orderBy: (member) => asc(member.createdAt) }, payments: true },
        })
        return c.json({
          room: null,
          roomId,
          events: events.map(serializeEvent),
        })
      } else {
        const room = first(await db.insert(schema.room).values({ id: uuid() }).returning())
        const member = first(
          await db.insert(schema.roomMember).values({ id: uuid(), roomId: room.id, userId }).returning(),
        )
        const user = first(
          await db
            .select({ id: schema.user.id, name: schema.user.name })
            .from(schema.user)
            .where(eq(schema.user.id, userId)),
        )
        const event = first(await db.insert(schema.event).values({ id: uuid(), roomId: room.id, label }).returning())
        const eventPayment = await db
          .insert(schema.eventPayment)
          .values(
            payments.map(({ amount, currency }) => ({
              eventId: event.id,
              amount,
              currency,
              paidByMemberId: member.id,
            })),
          )
          .returning()
        const eventMember = await db
          .insert(schema.eventMember)
          .values({ eventId: event.id, memberId: member.id })
          .returning()
        const events = [{ ...event, payments: eventPayment, members: eventMember }]
        return c.json({
          room: serializeRoom({ ...room, members: [{ ...member, user }], events, currencyRate: [] }),
          roomId: room.id,
          events: events.map(serializeEvent),
        })
      }
    },
  )
  .post(
    '/remove',
    auth,
    zValidator('json', z.object({ roomId: z.string().uuid(), eventId: z.string().uuid() })),
    async (c) => {
      const db = drizzle(c.env.DB, { schema })
      const { eventId, roomId } = c.req.valid('json')
      const { userId } = c.var
      const [row] = await db
        .select()
        .from(schema.roomMember)
        .where(and(eq(schema.roomMember.roomId, roomId), eq(schema.roomMember.userId, userId)))
      if (row === undefined) {
        throw new HTTPException(403, { message: 'Only member can delete the event' })
      }
      await db.delete(schema.event).where(eq(schema.event.id, eventId))
      const events = await db.query.event.findMany({
        where: (event) => eq(event.roomId, roomId),
        orderBy: (event) => desc(event.createdAt),
        with: { members: { orderBy: (member) => asc(member.createdAt) }, payments: true },
      })
      return c.json(events.map(serializeEvent))
    },
  )
  .post(
    '/update',
    auth,
    zValidator(
      'json',
      z.object({
        eventId: z.string().uuid(),
        label: z.string(),
        memberIds: z.array(z.string().uuid()),
        payments: z
          .array(
            z.object({
              amount: z.number().int(),
              currency: CURRENCY_CODE_SCHEMA,
              paidByMemberId: z.string().uuid(),
            }),
          )
          .min(1),
      }),
    ),
    async (c) => {
      const db = drizzle(c.env.DB, { schema })
      const { eventId, label, memberIds, payments } = c.req.valid('json')
      const { userId } = c.var
      const [row] = await db
        .select()
        .from(schema.roomMember)
        .innerJoin(schema.event, eq(schema.event.roomId, schema.roomMember.roomId))
        .where(and(eq(schema.event.id, eventId), eq(schema.roomMember.userId, userId)))
      if (row === undefined) {
        throw new HTTPException(403, { message: 'Only member can update the event' })
      }
      const event = first(await db.update(schema.event).set({ label }).where(eq(schema.event.id, eventId)).returning())
      // TODO: 差分の更新にする。もしかしたらカラムを分けないほうが便利かもしれない
      await db.delete(schema.eventPayment).where(eq(schema.eventPayment.eventId, eventId))
      const eventPayments = await db
        .insert(schema.eventPayment)
        .values(
          payments.map(({ amount, currency, paidByMemberId }) => ({
            eventId: event.id,
            amount,
            currency,
            paidByMemberId,
          })),
        )
        .returning()
      // TODO: 差分の更新にする。もしかしたらカラムを分けないほうが便利かもしれない
      await db.delete(schema.eventMember).where(eq(schema.eventMember.eventId, eventId))
      const eventMembers = await db
        .insert(schema.eventMember)
        .values(memberIds.map((memberId) => ({ eventId, memberId })))
        .returning()
      return c.json(serializeEvent({ ...event, payments: eventPayments, members: eventMembers }))
    },
  )

export default event
