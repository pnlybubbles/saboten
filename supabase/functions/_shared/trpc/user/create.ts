import { z } from 'zod'
import { supabase } from '../../supabase.ts'
import { publicProcedure } from '../server.ts'
import { TRPCError } from '@trpc/server'

export default publicProcedure.input(z.object({ name: z.string() })).mutation(async ({ input: { name } }) => {
  const { data, error } = await supabase.from('user').insert({ name }).select().single()
  if (error) {
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }
  return data
})
