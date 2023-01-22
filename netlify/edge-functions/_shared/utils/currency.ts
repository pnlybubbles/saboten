import { z } from 'zod'
import cc from 'currency-codes'

const CURRENCY_CODES = cc.codes()

export const CURRENCY_CODE_SCHEMA = z.string().refine((v) => CURRENCY_CODES.includes(v), 'Invalid currency code')
