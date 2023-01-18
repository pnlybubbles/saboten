export default function unreachable(): never
export default function unreachable(value: never): never
export default function unreachable(value?: never): never {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`unreachable (${JSON.stringify(value)})`)
}
