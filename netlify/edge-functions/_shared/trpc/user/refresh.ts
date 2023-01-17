import prisma from '../../prisma.ts'
import { publicProcedure } from '../server.ts'

export default publicProcedure.mutation(async ({ ctx: { session, setCookie } }) => {
  if (!session) {
    return null
  }
  setCookie('id', session.userId, { maxAge: 60 * 60 * 24 * 365 * 2 })
  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  return user
})
