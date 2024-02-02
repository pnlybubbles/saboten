import type { ClientResponse } from 'hono/client'
import { hc } from 'hono/client'
import type { API } from '@api'

const rpc = hc<API>('/api')

export default rpc

type PromiseType<T> = T extends Promise<infer U> ? U : T

export type RPCResponseType<T extends (...args: never[]) => Promise<ClientResponse<unknown>>> =
  PromiseType<ReturnType<T>> extends ClientResponse<infer U> ? U : never
