import { z } from 'zod'

const COMPRESSED_UUID_SCHEMA = z.string().length(22)

export default COMPRESSED_UUID_SCHEMA
