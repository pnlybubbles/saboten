import { createTRPCProxyClient, httpLink } from '@trpc/client'
import type { AppRouter } from '@shared/trpc/router'
import { log } from './log'

const trpc = createTRPCProxyClient<AppRouter>({
  links: [httpLink({ url: '/api' })],
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createProxy = (target: object, path: string[] = []): any =>
  new Proxy(target, {
    apply: (target, thisArg, argArrray) => {
      log('trpc', { path: path.join('.'), args: argArrray })

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      const value = Reflect.apply(target as any, thisArg, argArrray)

      return value
    },
    get: (target, prop, receiver) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
      return createProxy(Reflect.get(target, prop, receiver), [...path, prop.toString()])
    },
  })

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export default createProxy(trpc) as typeof trpc
