import { Hono } from 'hono'
// import { drizzle } from 'drizzle-orm/d1'
// import { createInsertSchema } from 'drizzle-zod'
// import { user } from '../db/schema'
import { cors } from 'hono/cors'

type Bindings = {
  // DB: D1Database
}

const api = new Hono<{ Bindings: Bindings }>()

api.use('*', cors())

const route = api.get('/', (c) => {
  // const db = drizzle(c.env.DB)
  // const result = await db.select().from(users).all()
  return c.json({ hello: true })
})

export default api

export type API = typeof route
