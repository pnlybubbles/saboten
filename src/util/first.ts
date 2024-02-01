import unwrap from './unwrap'

export default function first<T>(values: T[]) {
  return unwrap(values[0], 'Must be non-empty')
}
