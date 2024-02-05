import { Hono } from 'hono'
import type { Env } from './type'
import { zValidator } from '@hono/zod-validator'
import auth from './middleware/auth'
import { z } from 'zod'
import { drizzle } from 'drizzle-orm/d1'
import schema from '@db/schema'
import { and, asc, desc, eq } from 'drizzle-orm'
import uuid from '../db/uuid'
import first from '@util/first'
import serializeRoom from '../db/serialize'
import { HTTPException } from 'hono/http-exception'
import roomMember from './room.member'
import roomCurrencyRate from './room.currencyRate'

const room = new Hono<Env>()
  .get('/item', zValidator('query', z.object({ id: z.string().uuid() })), async (c) => {
    const db = drizzle(c.env.DB, { schema })
    const { id: roomId } = c.req.valid('query')
    const room = await db.query.room.findFirst({
      where: (room) => eq(room.id, roomId),
      with: {
        members: { orderBy: (member) => asc(member.createdAt), with: { user: { columns: { id: true, name: true } } } },
        events: {
          orderBy: (event) => desc(event.createdAt),
          with: { members: { orderBy: (member) => asc(member.createdAt) }, payments: true },
        },
        currencyRate: true,
      },
    })
    if (!room) {
      throw new HTTPException(404, { message: 'Room not found' })
    }
    return c.json(serializeRoom(room))
  })
  .get('/joined', auth, async (c) => {
    const db = drizzle(c.env.DB)
    const { userId } = c.var
    const rooms = await db
      .select({ id: schema.room.id, title: schema.room.title })
      .from(schema.room)
      .innerJoin(schema.roomMember, eq(schema.room.id, schema.roomMember.roomId))
      .where(eq(schema.roomMember.userId, userId))
      .orderBy(desc(schema.roomMember.createdAt))
    return c.json(rooms)
  })
  .post(
    '/title',
    auth,
    zValidator('json', z.object({ roomId: z.string().uuid().nullable(), value: z.string().max(20) })),
    async (c) => {
      const db = drizzle(c.env.DB)
      const { roomId, value: title } = c.req.valid('json')
      const { userId } = c.var

      if (roomId) {
        await db.update(schema.room).set({ title }).where(eq(schema.room.id, roomId)).returning()
        return c.json({
          roomId,
          title,
          room: null,
        })
      } else {
        const room = first(await db.insert(schema.room).values({ id: uuid(), title }).returning())
        const member = first(
          await db.insert(schema.roomMember).values({ userId, id: uuid(), roomId: room.id }).returning(),
        )
        const user = first(
          await db
            .select({ id: schema.user.id, name: schema.user.name })
            .from(schema.user)
            .where(eq(schema.user.id, userId)),
        )
        return c.json({
          roomId: room.id,
          title: room.title,
          room: serializeRoom({
            ...room,
            members: [{ ...member, user }],
            events: [],
            currencyRate: [],
          }),
        })
      }
    },
  )
  .post('/remove', auth, zValidator('json', z.object({ roomId: z.string().uuid() })), async (c) => {
    const db = drizzle(c.env.DB)
    const { roomId } = c.req.valid('json')
    const { userId } = c.var
    const [row] = await db
      .select()
      .from(schema.roomMember)
      .where(and(eq(schema.roomMember.roomId, roomId), eq(schema.roomMember.userId, userId)))
    if (row === undefined) {
      throw new HTTPException(403, { message: 'Only member can delete the room' })
    }
    await db.delete(schema.room).where(and(eq(schema.room.id, roomId)))
  })
  .route('/member', roomMember)
  .route('/currencyRate', roomCurrencyRate)

export default room
