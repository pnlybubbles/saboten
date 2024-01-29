import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Env } from './type'
import user from './user'

const api = new Hono<Env>()
  .use('*', cors())
  .get('/', (c) => {
    return c.json({ hello: true })
  })
  .route('/user', user)

export default api

export type API = typeof api
