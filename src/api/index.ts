import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Env } from './type'

const api = new Hono<Env>()

api.use('*', cors())

const route = api.get('/', (c) => {
  // const db = drizzle(c.env.DB)
  // const result = await db.select().from(users).all()
  return c.json({ hello: true })
})

export default api

export type API = typeof route
