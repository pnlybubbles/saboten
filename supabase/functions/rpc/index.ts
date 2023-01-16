// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'https://deno.land/std@0.172.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '../_shared/trpc/router.ts'

serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  return fetchRequestHandler({
    endpoint: '',
    req,
    router: appRouter,
    createContext: (opts) => ({
      req: opts.req,
    }),
    responseMeta: () => ({ headers: corsHeaders }),
  })
})
