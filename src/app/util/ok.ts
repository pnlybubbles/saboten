import type { ClientResponse } from 'hono/client'

export default async function ok<T>(rpc: Promise<ClientResponse<T>>) {
  const response = await rpc
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  return response.json()
}
