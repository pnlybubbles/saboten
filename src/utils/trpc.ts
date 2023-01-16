import { createTRPCProxyClient, httpLink } from '@trpc/client'
import type { AppRouter } from '@shared/trpc/router'

const trpc = createTRPCProxyClient<AppRouter>({
  links: [httpLink({ url: '/api' })],
})

export default trpc
