import { router } from '../server.ts'
import title from './title.ts'
import item from './item.ts'
import member from './member/index.ts'
import currencyRate from './currencyRate/index.ts'

export default router({
  title,
  item,
  member,
  currencyRate,
})
