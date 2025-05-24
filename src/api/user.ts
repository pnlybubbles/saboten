import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { drizzle } from 'drizzle-orm/d1'
import type { Env } from './type'
import schema from '@db/schema'
import { eq } from 'drizzle-orm'
import uuid, { compressedPrintableStringToUuid, uuidToCompressedPrintableString } from '@api/util/uuid'
import { setCookie, deleteCookie } from 'hono/cookie'
import COMPRESSED_UUID_SCHEMA from '@util/COMPRESSED_UUID_SCHEMA'
import auth from './middleware/auth'
import first from '@util/first'
import authOrUndef from './middleware/authOrUndef'

const user = new Hono<Env>()
  .post('/item', authOrUndef, zValidator('json', z.object({ name: z.string() })), async (c) => {
    const db = drizzle(c.env.DB)
    const { name } = c.req.valid('json')
    const { userId } = c.var

    if (userId) {
      const user = first(await db.update(schema.user).set({ name }).where(eq(schema.user.id, userId)).returning())
      return c.json(withCompressedSecret(user))
    } else {
      const user = first(await db.insert(schema.user).values({ id: uuid(), secret: uuid(), name }).returning())
      setCookie(c, 'id', user.id, { maxAge: 60 * 60 * 24 * 400 })
      return c.json(withCompressedSecret(user))
    }
  })
  .post(
    '/refresh',
    authOrUndef,
    zValidator('json', z.object({ secret: COMPRESSED_UUID_SCHEMA.optional() })),
    async (c) => {
      const db = drizzle(c.env.DB)
      const { secret } = c.req.valid('json')
      const overrideUserId = secret ? await compressedSecretToUserId(db, secret) : undefined
      const userId = overrideUserId ?? c.var.userId
      if (!userId) {
        return c.json({ error: 'Invalid user ID' })
      }
      const [user] = await db.select().from(schema.user).where(eq(schema.user.id, userId))
      if (user) {
        // ユーザーが見つかったらcookieを延長
        setCookie(c, 'id', userId, { maxAge: 60 * 60 * 24 * 400 })
      } else {
        // ユーザーが見つからないのであればcookieを削除する
        deleteCookie(c, 'id')
      }
      return c.json(user ? withCompressedSecret(user) : { error: 'User not found' })
    },
  )
  .post('/leave', auth, async (c) => {
    const db = drizzle(c.env.DB)
    const { userId } = c.var
    // TODO: 空っぽになる部屋を削除する
    await db.delete(schema.user).where(eq(schema.user.id, userId))
    deleteCookie(c, 'id')
    return c.json({})
  })

async function compressedSecretToUserId(db: DrizzleD1Database, compressedSecret: string) {
  const secret = compressedPrintableStringToUuid(compressedSecret)
  const [overrideUserId] = await db.select().from(schema.user).where(eq(schema.user.secret, secret))
  return overrideUserId?.id
}

const withCompressedSecret = <T extends { secret: string }>(user: T) => ({
  ...user,
  secret: uuidToCompressedPrintableString(user.secret),
})

export default user
