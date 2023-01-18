import { v4 as uuid } from 'uuid'

export default function tmpId() {
  return `tmp_${uuid()}` as const
}
