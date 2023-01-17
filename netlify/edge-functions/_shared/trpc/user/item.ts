import { z } from 'zod'
import { publicProcedure } from '../server.ts'
import prisma from '../../prisma.ts'

export default publicProcedure
  .input(z.object({ id: z.string().uuid().optional(), name: z.string() }))
  .mutation(async ({ input: { id, name }, ctx: { setCookie } }) => {
    if (id) {
      const user = await prisma.user.update({ where: { id }, data: { name } })
      return user
    } else {
      const user = await prisma.user.create({ data: { name } })
      setCookie('id', user.id, { maxAge: 60 * 60 * 24 * 365 * 2 })
      return user
    }
  })
