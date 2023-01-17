import prisma from '../../prisma.ts'
import { publicProcedure } from '../server.ts'

export default publicProcedure.mutation(async ({ ctx: { userId, setCookie } }) => {
  if (!userId) {
    return null
  }
  setCookie('id', userId, { maxAge: 60 * 60 * 24 * 365 * 2 })
  const user = await prisma.user.findUnique({ where: { id: userId } })
  return user
})
