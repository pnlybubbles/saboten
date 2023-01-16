import { createClient } from '@supabase/supabase-js'
import { ANON_JWT } from './constant.ts'
import type { Database } from './generated/database.types.ts'

export const supabase = createClient<Database>('http://localhost:54321', ANON_JWT)
