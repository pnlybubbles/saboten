import { Hono } from 'hono'
import type { Env } from './type'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { drizzle } from 'drizzle-orm/d1'
import auth from './middleware/auth'
import schema from '@db/schema'
import uuid from '@db/uuid'
import first from '@util/first'
import { and, eq } from 'drizzle-orm'
import serializeRoom, { serializeCreatedAt } from '@db/serialize'

const roomMember = new Hono<Env>()
  .post(
    '/add',
    auth,
    zValidator('json', z.object({ roomId: z.string().uuid().nullable(), name: z.string() })),
    async (c) => {
      const db = drizzle(c.env.DB, { schema })
      const { roomId, name } = c.req.valid('json')
      const { userId } = c.var
      if (roomId) {
        const { id: memberId } = first(
          await db.insert(schema.roomMember).values({ name, roomId, id: uuid() }).returning(),
        )
        const members = await db.query.roomMember.findMany({
          where: (member) => eq(member.roomId, roomId),
          with: { user: true },
        })
        return c.json({
          roomId,
          memberId,
          members: members.map(serializeCreatedAt),
          room: null,
        })
      } else {
        const room = first(await db.insert(schema.room).values({ id: uuid() }).returning())
        const members = await db
          .insert(schema.roomMember)
          .values([
            { id: uuid(), roomId: room.id, userId },
            { id: uuid(), roomId: room.id, name },
          ])
          .returning()
        const user = first(
          await db
            .select({ id: schema.user.id, name: schema.user.name })
            .from(schema.user)
            .where(eq(schema.user.id, userId)),
        )
        return c.json({
          roomId: room.id,
          room: serializeRoom({
            ...room,
            members: members.map((member) => ({ ...member, user: member.userId === user.id ? user : null })),
            events: [],
            currencyRate: [],
          }),
        })
      }
    },
  )
  .post(
    '/remove',
    auth,
    zValidator('json', z.object({ roomId: z.string().uuid(), memberId: z.string().uuid() })),
    async (c) => {
      const db = drizzle(c.env.DB, { schema })
      const { roomId, memberId } = c.req.valid('json')
      await db.delete(schema.roomMember).where(eq(schema.roomMember.id, memberId))
      const members = await db.query.roomMember.findMany({
        where: (member) => eq(member.roomId, roomId),
        with: { user: { columns: { id: true, name: true } } },
      })
      return c.json(members.map(serializeCreatedAt))
    },
  )
  .post(
    '/join',
    auth,
    zValidator('json', z.object({ roomId: z.string().uuid(), memberId: z.string().uuid().nullable() })),
    async (c) => {
      const db = drizzle(c.env.DB, { schema })
      const { roomId, memberId } = c.req.valid('json')
      const { userId } = c.var
      if (memberId) {
        await db
          .update(schema.roomMember)
          .set({ userId })
          .where(and(eq(schema.roomMember.roomId, roomId), eq(schema.roomMember.id, memberId)))
        const members = await db.query.roomMember.findMany({
          where: (member) => eq(member.roomId, roomId),
          with: { user: { columns: { id: true, name: true } } },
        })
        return c.json(members.map(serializeCreatedAt))
      } else {
        await db.insert(schema.roomMember).values({ id: uuid(), roomId, userId })
        const members = await db.query.roomMember.findMany({
          where: (member) => eq(member.roomId, roomId),
          with: { user: { columns: { id: true, name: true } } },
        })
        return c.json(members.map(serializeCreatedAt))
      }
    },
  )

export default roomMember
