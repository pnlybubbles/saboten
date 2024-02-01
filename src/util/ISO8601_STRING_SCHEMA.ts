import { z } from 'zod'
import type { ISO8601String } from './date'
import { parseISO } from 'date-fns'

export const isInvalidDate = (date: Date) => Number.isNaN(date.getDate())

const ISO8601_STRING_SCHEMA = z.custom<ISO8601String>((value: unknown) => {
  if (typeof value === 'string' && !isInvalidDate(parseISO(value))) {
    return true
  } else {
    return false
  }
})

export default ISO8601_STRING_SCHEMA
