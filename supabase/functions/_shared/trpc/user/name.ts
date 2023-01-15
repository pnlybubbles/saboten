import { z } from "zod";
import { publicProcedure } from "../server.ts";

export default publicProcedure.input(z.object({ value: z.string() }))
  .mutation(({ input: { value }}) => {
    console.log(value)
    return { message: 'ok' }
  })
