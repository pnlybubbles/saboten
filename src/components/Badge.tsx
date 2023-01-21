import type { PropsWithChildren } from 'react'

export default function Badge({ children }: PropsWithChildren) {
  return <div className="rounded-md border border-zinc-400 px-1 pt-[2px] text-xs text-zinc-400">{children}</div>
}
