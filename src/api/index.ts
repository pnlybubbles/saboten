import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import type { Env } from './type'
import user from './user'
import room from './room'
import event from './event'

const api = new Hono<Env>()
  .basePath('/api')
  .use(logger())
  .use('*', cors())
  .get('/', (c) => {
    return c.json({ hello: true })
  })
  .route('/user', user)
  .route('/room', room)
  .route('/event', event)

export default api

export type API = typeof api
