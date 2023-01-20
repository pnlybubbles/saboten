export default function isUnique<T>(value: T, index: number, array: T[]) {
  return array.indexOf(value) === index
}
