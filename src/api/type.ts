import type {} from 'drizzle-orm/d1'

type Bindings = {
  DB: D1Database
}

export type Env = { Bindings: Bindings }
