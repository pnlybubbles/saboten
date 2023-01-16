import { publicProcedure } from '../server.ts'
import { z } from 'zod'
import { supabase } from '../../supabase.ts'
import { TRPCError } from '@trpc/server'

export default publicProcedure
  .input(z.object({ id: z.string().uuid().optional(), value: z.string().max(20) }))
  .mutation(async ({ input: { id, value } }) => {
    const { data, error } = await supabase
      .from('room')
      .upsert({ title: value, ...(id ? { id } : {}) })
      .select()
      .single()
    if (error) {
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }
    return data
  })
