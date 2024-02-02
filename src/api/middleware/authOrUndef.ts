import type { MiddlewareHandler } from 'hono'
import { getCookie } from 'hono/cookie'

const authOrUndef: MiddlewareHandler<{ Variables: { userId: string | undefined } }> = async function authOrUndef(
  c,
  next,
) {
  const id = getCookie(c, 'id')
  c.set('userId', id)
  await next()
}

export default authOrUndef
