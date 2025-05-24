import type { Config } from 'drizzle-kit'
import fs from 'fs'
import path from 'path'

const config = {
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './migrations',
} satisfies Config

const remoteConfig = {
  ...config,
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env['CLOUDFLARE_ACCOUNT_ID']!,
    databaseId: process.env['CLOUDFLARE_DATABASE_ID']!,
    token: process.env['CLOUDFLARE_D1_TOKEN']!,
  },
} satisfies Config

const localConfig = {
  ...config,
  dbCredentials: {
    url: getSqliteFile('./.wrangler/state/v3/d1/miniflare-D1DatabaseObject'),
  },
} satisfies Config

export default process.env['NODE_ENV'] === 'production' ? remoteConfig : localConfig

function getSqliteFile(dir: string) {
  const files = fs.readdirSync(dir)
  const file = files.find((v) => v.endsWith('.sqlite'))
  if (!file) throw new Error('Not found `.sqlite` Object. Run `pnp db:apply` to migrate first.')
  const pathname = path.join(dir, file)
  console.log(`SQLite file '${pathname}'`)
  return pathname
}
