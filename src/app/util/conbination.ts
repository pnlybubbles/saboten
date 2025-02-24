export function conbination2<T>(arr: T[]) {
  return arr.flatMap((a, i) => arr.slice(i).map((b) => [a, b] as const))
}
