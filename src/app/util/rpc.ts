import { hc } from 'hono/client'
import type { API } from '@api'

const rpc = hc<API>('http://localhost:8787')

export default rpc
