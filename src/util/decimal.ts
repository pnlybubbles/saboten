import {} from '@prisma/client'
import { z } from 'zod'

export const DECIMAL_SCHEMA = z.string().refine((value) => {
  try {
    BigInt(value)
    return true
  } catch {
    return false
  }
}, 'Invalid format for Decimal')
