import { webcrypto } from 'node:crypto'

export default function uuid() {
  return webcrypto.randomUUID()
}
