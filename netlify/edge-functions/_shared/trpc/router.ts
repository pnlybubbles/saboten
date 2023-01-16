import { router } from './server.ts'
import user from './user/index.ts'
import room from './room/index.ts'

export const appRouter = router({
  user,
  room,
})

export type AppRouter = typeof appRouter
