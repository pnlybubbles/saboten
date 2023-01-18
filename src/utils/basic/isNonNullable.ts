/**
 * Checks if the value is neither `null` or `undefined`.
 *
 * @param value The value to check.
 * @returns Returns `true` if `value` is non-nullable, else `false`.
 */
export default function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value != null
}
