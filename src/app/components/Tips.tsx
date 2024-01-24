import type { PropsWithChildren } from 'react'
import Icon from './Icon'
import clsx from 'clsx'
import unreachable from '@/utils/basic/unreachable'

export default function Tips({
  children,
  className,
  type = 'default',
}: PropsWithChildren<{ className?: string; type?: 'warning' | 'default' }>) {
  return (
    <div
      className={clsx(
        'grid grid-cols-[auto_1fr] gap-1 text-xs',
        type === 'default' ? 'text-zinc-400' : 'text-red-500',
        className,
      )}
    >
      <Icon
        name={type === 'default' ? 'tips_and_updates' : type === 'warning' ? 'error' : unreachable(type)}
        className="mt-[-3px]"
      />
      <div>{children}</div>
    </div>
  )
}
