import { z } from 'zod'
import { publicProcedure } from '../server.ts'
import prisma from '../../prisma.ts'

export default publicProcedure
  .input(z.object({ name: z.string() }))
  .mutation(async ({ input: { name }, ctx: { setCookie } }) => {
    const { id } = await prisma.user.create({ data: { name } })
    setCookie('id', id)
    return { id, name }
  })
