import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { drizzle } from 'drizzle-orm/d1'
import type { Env } from './type'
import schema from '@db/schema'
import { eq } from 'drizzle-orm'
import unwrap from '@util/unwrap'
import uuid, { compressedPrintableStringToUuid, uuidToCompressedPrintableString } from './util/uuid'
import { setCookie, deleteCookie } from 'hono/cookie'
import { COMPRESSED_USER_ID_SCHEMA } from '@util/schema'
import auth from './middleware/auth'

const user = new Hono<Env>()
  .post('/item', zValidator('json', z.object({ id: z.string().uuid().optional(), name: z.string() })), async (c) => {
    const db = drizzle(c.env.DB)
    const { id, name } = c.req.valid('json')

    if (id) {
      const [user] = await db.update(schema.user).set({ name }).where(eq(schema.user.id, id)).returning()
      return c.json(withCompressedUserId(unwrap(user, 'User update failed.')))
    } else {
      const [result] = await db.insert(schema.user).values({ id: uuid(), secret: uuid(), name }).returning()
      const user = unwrap(result)
      setCookie(c, 'id', user.id, { maxAge: 60 * 60 * 24 * 365 * 2 })
      return c.json(withCompressedUserId(user))
    }
  })
  .post(
    '/refresh',
    auth,
    zValidator('json', z.object({ compressedUserId: COMPRESSED_USER_ID_SCHEMA }).optional()),
    async (c) => {
      const db = drizzle(c.env.DB)
      const input = c.req.valid('json')
      const overrideUserId =
        input?.compressedUserId !== undefined ? compressedPrintableStringToUuid(input.compressedUserId) : undefined
      const userId = overrideUserId ?? c.var.userId
      if (!userId) {
        return c.json(null)
      }
      const [user] = await db.select().from(schema.user).where(eq(schema.user.id, userId))
      if (user) {
        // ユーザーが見つかったらcookieを延長
        setCookie(c, 'id', userId, { maxAge: 60 * 60 * 24 * 365 * 2 })
      } else {
        // ユーザーが見つからないのであればcookieを削除する
        deleteCookie(c, 'id')
      }
      return c.json(user ? withCompressedUserId(user) : null)
    },
  )
  .post('/leave', auth, async (c) => {
    const db = drizzle(c.env.DB)
    const { userId } = c.var
    // TODO: 空っぽになる部屋を削除する
    await db.delete(schema.user).where(eq(schema.user.id, userId))
    deleteCookie(c, 'id')
  })

export default user

const withCompressedUserId = <T extends { id: string }>(user: T) =>
  ({
    ...user,
    // TOOD: 消す可能性があるのでoptionalにしておく
    compressedId: uuidToCompressedPrintableString(user.id),
  }) as typeof user & { compressedId?: string }
