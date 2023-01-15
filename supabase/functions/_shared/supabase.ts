import { createClient } from '@supabase/supabase-js'
import { ANON_JWT } from './constant.ts'
import { Database } from './generated/database.types.ts'

export const supabase = createClient<Database>('http://host.docker.internal:54321', ANON_JWT)
