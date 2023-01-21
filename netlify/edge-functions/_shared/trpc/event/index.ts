import { router } from '../server.ts'
import add from './add.ts'
import update from './update.ts'
import remove from './remove.ts'

export default router({
  add,
  update,
  remove,
})
