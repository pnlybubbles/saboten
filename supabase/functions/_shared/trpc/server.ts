import { serialize } from 'cookie'
import { initTRPC } from '@trpc/server'
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { inferAsyncReturnType } from '@trpc/server'

const COOKIE_DEFAULT_OPTION = { path: '/', httpOnly: true, sameSite: 'none', secure: true } as const

export const createContext = (opts: FetchCreateContextFnOptions) => {
  const setCookie = (...args: Parameters<typeof serialize>) => {
    opts.resHeaders.append('Set-Cookie', serialize(args[0], args[1], { ...COOKIE_DEFAULT_OPTION, ...args[2] }))
  }

  const removeCookie = (name: string, option?: { path: string }) => {
    opts.resHeaders.append('Set-Cookie', serialize(name, '', { path: '/', ...option, maxAge: -1 }))
  }

  const cookie = opts.req.headers.get('cookie')
  console.log(cookie)

  return {
    setCookie,
    removeCookie,
  }
}

type Context = inferAsyncReturnType<typeof createContext>

const t = initTRPC.context<Context>().create()

export const router = t.router
export const middleware = t.middleware
export const publicProcedure = t.procedure
