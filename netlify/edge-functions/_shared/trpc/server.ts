import { serialize, parse } from 'cookie'
import { initTRPC } from '@trpc/server'
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { inferAsyncReturnType, TRPCError } from '@trpc/server'

function getUserId(headers: Headers) {
  const cookieHeader = headers.get('cookie')
  if (!cookieHeader) {
    return null
  }
  const cookies = parse(cookieHeader)
  const id = cookies['id']
  if (!id) {
    return null
  }
  return id
}

const COOKIE_DEFAULT_OPTION = { path: '/', httpOnly: true, sameSite: 'lax', secure: true } as const

export const createContext = (opts: FetchCreateContextFnOptions) => {
  const setCookie = (...args: Parameters<typeof serialize>) => {
    opts.resHeaders.append('Set-Cookie', serialize(args[0], args[1], { ...COOKIE_DEFAULT_OPTION, ...args[2] }))
  }

  const removeCookie = (name: string, option?: { path: string }) => {
    opts.resHeaders.append('Set-Cookie', serialize(name, '', { path: '/', ...option, maxAge: -1 }))
  }

  return {
    setCookie,
    removeCookie,
    userId: getUserId(opts.req.headers),
  }
}

type Context = inferAsyncReturnType<typeof createContext>

const t = initTRPC.context<Context>().create()

export const router = t.router
export const middleware = t.middleware
export const publicProcedure = t.procedure

const withSession = t.middleware(({ next, ctx: { userId } }) => {
  if (userId === null) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({
    ctx: {
      userId,
    },
  })
})

export const sessionProcedure = t.procedure.use(withSession)
