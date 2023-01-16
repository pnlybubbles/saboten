import { router } from '../server.ts'
import create from './create.ts'
import refresh from './refresh.ts'

export default router({
  create,
  refresh,
})
