import type { PropsWithChildren } from 'react'
import clsx from 'clsx'
import unreachable from '@app/util/unreachable'
import * as Icon from 'lucide-react'

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
      {type === 'default' ? (
        <Icon.Lightbulb size={20} className="mt-[-3px]" />
      ) : type === 'warning' ? (
        <Icon.AlertCircle size={20} className="mt-[-3px]" />
      ) : (
        unreachable(type)
      )}
      <div>{children}</div>
    </div>
  )
}
