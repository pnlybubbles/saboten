import { router } from './server.ts'
import user from './user/index.ts'
import room from './room/index.ts'
import event from './event/index.ts'

export const appRouter = router({
  user,
  room,
  event,
})

export type AppRouter = typeof appRouter
