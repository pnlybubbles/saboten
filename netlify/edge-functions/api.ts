// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from './_shared/trpc/router.ts'
import { createContext } from './_shared/trpc/server.ts'

export default function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok')
  }

  return fetchRequestHandler({
    endpoint: 'api/',
    req,
    router: appRouter,
    createContext,
  })
}
