import type { ClientResponse } from 'hono/client'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

export default async function ok<T extends Promise<ClientResponse<unknown, ContentfulStatusCode, 'json'>>>(rpc: T) {
  const response = await rpc
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  return (await response.json()) as T extends Promise<ClientResponse<infer R, ContentfulStatusCode, 'json'>> ? R : never
}
