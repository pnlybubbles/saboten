import { publicProcedure } from '../server.ts'
import { z } from 'zod'
import { supabase } from '../../supabase.ts'
import { TRPCError } from '@trpc/server'

export default publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input: { id } }) => {
  const { data, error } = await supabase.from('room').select().eq('id', id).single()
  if (error) {
    throw new TRPCError({ code: 'BAD_REQUEST' })
  }
  return data
})
