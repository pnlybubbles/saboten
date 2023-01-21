import { router } from '../../server.ts'
import add from './add.ts'
import remove from './remove.ts'
import join from './join.ts'

export default router({
  add,
  remove,
  join,
})
