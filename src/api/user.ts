import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { drizzle } from 'drizzle-orm/d1'
import type { Env } from './type'
import schema from 'src/db/schema'
import { eq } from 'drizzle-orm'
import unwrap from '@util/unwrap'
import uuid from './util/uuid'
import { setCookie } from 'hono/cookie'
import { uuidToCompressedPrintableString } from '@util/uuid'

const user = new Hono<Env>().post(
  '/item',
  zValidator('json', z.object({ id: z.string().uuid().optional(), name: z.string() })),
  async (c) => {
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
  },
)

export default user

const withCompressedUserId = <T extends { id: string }>(user: T) =>
  ({
    ...user,
    // TOOD: 消す可能性があるのでoptionalにしておく
    compressedId: uuidToCompressedPrintableString(user.id),
  }) as typeof user & { compressedId?: string }
