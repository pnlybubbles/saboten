import type { PropsWithChildren } from 'react'
import Icon from './Icon'

export default function Tips({ children }: PropsWithChildren) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-1 text-xs">
      <Icon name="tips_and_updates" className="mt-[-2px]" />
      <div>{children}</div>
    </div>
  )
}
