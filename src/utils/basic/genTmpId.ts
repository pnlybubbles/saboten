import { v4 as uuid } from 'uuid'

export default function genTmpId() {
  return `tmp_${uuid()}` as const
}
