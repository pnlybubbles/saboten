export default function unwrap<T>(value: T | null | undefined, expect?: string): T {
  if (value == null) {
    throw new Error(expect ?? 'Must be non-nullable')
  }
  return value
}
