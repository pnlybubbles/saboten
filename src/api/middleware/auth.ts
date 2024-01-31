import type { MiddlewareHandler } from 'hono'
import { getCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'

const auth: MiddlewareHandler<{ Variables: { userId: string } }> = async function auth(c, next) {
  const id = getCookie(c, 'id')
  if (id === undefined) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }
  c.set('userId', id)
  await next()
}

export default auth
