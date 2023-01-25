import { z } from 'zod'

export const COMPRESSED_USER_ID_SCHEMA = z.string().length(22)
