import type { Config } from 'drizzle-kit'
import fs from 'fs'
import path from 'path'

const config = {
  schema: './src/db/schema.ts',
  out: './migrations',
} satisfies Config

const remoteConfig = {
  ...config,
  driver: 'd1',
  dbCredentials: { wranglerConfigPath: 'wrangler.toml', dbName: 'saboten' },
} satisfies Config

const localConfig = {
  ...config,
  driver: 'better-sqlite',
  dbCredentials: {
    url: getSqliteFile('./.wrangler/state/v3/d1/miniflare-D1DatabaseObject'),
  },
} satisfies Config

export default process.env['NODE_ENV'] === 'production' ? remoteConfig : localConfig

function getSqliteFile(dir: string) {
  const files = fs.readdirSync(dir)
  const file = files.find((v) => v.endsWith('.sqlite'))
  if (!file) throw new Error('Not found `.sqlite` Object. Run `yarn db:setup` to migrate first.')
  return path.join(dir, file)
}
