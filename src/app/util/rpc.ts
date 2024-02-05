import type { ClientResponse } from 'hono/client'
import { hc } from 'hono/client'
import type { API } from '@api'
import log from './log'

const rpc = hc<API>('/')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createProxy = (target: object, path: string[] = [], memo: Map<string, unknown> = new Map()): any => {
  const key = path.join('.')

  const memorizedProxy = memo.get(key)
  if (memorizedProxy !== undefined) return memorizedProxy

  const proxy = new Proxy(target, {
    apply: (target, thisArg, argArray) => {
      log('RPC', key, argArray)

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
      return Reflect.apply(target as any, thisArg, argArray)
    },
    get: (target, prop, receiver) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
      return createProxy(Reflect.get(target, prop, receiver), [...path, prop.toString()], memo)
    },
  })

  memo.set(key, proxy)

  return proxy
}

export default createProxy(rpc) as typeof rpc

type PromiseType<T> = T extends Promise<infer U> ? U : T

export type RPCResponseType<T extends (...args: never[]) => Promise<ClientResponse<unknown>>> =
  PromiseType<ReturnType<T>> extends ClientResponse<infer U> ? U : never
