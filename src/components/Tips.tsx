import type { PropsWithChildren } from 'react'
import Icon from './Icon'
import clsx from 'clsx'

export default function Tips({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={clsx('grid grid-cols-[auto_1fr] gap-1 text-xs', className)}>
      <Icon name="tips_and_updates" className="mt-[-3px]" />
      <div>{children}</div>
    </div>
  )
}
