import { z } from "zod";
import { supabase } from "../../supabase.ts";
import { publicProcedure } from "../server.ts";
import { TRPCError } from '@trpc/server'

export default publicProcedure.input(z.object({ value: z.string() }))
  .mutation(async ({ input: { value }}) => {
    console.log(value)
    const { data, error } = await supabase.from('User').insert({ name: value }).select()
    if (error) {
      throw new TRPCError({ code: "BAD_REQUEST" })
    }
    const [item] = data
    if (!item) {
      throw new TRPCError({ code: "BAD_REQUEST" })
    }
    return { id: item.id }
  })
