import { router } from "./server.ts";
import user from './user/index.ts'

export const appRouter = router({
  user
})

export type AppRouter = typeof appRouter
