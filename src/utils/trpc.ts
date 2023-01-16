import { createTRPCProxyClient, httpLink } from '@trpc/client'
import type { AppRouter } from '@shared/trpc/router'
import { affixBearerToken } from './bearer'
import { ANON_JWT } from '@shared/constant'

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: '/api',
      headers() {
        return { Authorization: affixBearerToken(ANON_JWT) }
      },
    }),
  ],
})

export default trpc
