import prisma from '../../prisma.ts'
import { sessionProcedure } from '../server.ts'

export default sessionProcedure.mutation(async ({ ctx: { userId, removeCookie } }) => {
  await prisma.room.deleteMany({
    where: { members: { every: { userId } } },
  })
  await prisma.user.delete({ where: { id: userId } })
  removeCookie('id')
})
