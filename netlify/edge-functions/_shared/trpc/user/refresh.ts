import { publicProcedure } from '../server.ts'

export default publicProcedure.mutation(({ ctx }) => {
  ctx.setCookie('id', 'hello')
})
