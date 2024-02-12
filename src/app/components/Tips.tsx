import type { PropsWithChildren } from 'react'
import clsx from 'clsx'
import * as Icon from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export default function Tips({
  children,
  className,
  type: Type = 'default',
}: PropsWithChildren<{ className?: string; type?: 'warning' | 'default' | LucideIcon }>) {
  return (
    <div
      className={clsx(
        'grid grid-cols-[auto_1fr] gap-1 text-xs',
        Type === 'default' ? 'text-zinc-400' : Type === 'warning' ? 'text-error' : 'text-zinc-400',
        className,
      )}
    >
      <div className="mt-[-3px]">
        {Type === 'default' ? (
          <Icon.Bird size={19} strokeWidth={1.5} />
        ) : Type === 'warning' ? (
          <Icon.AlertCircle size={19} strokeWidth={1.5} />
        ) : (
          <Type size={19} strokeWidth={1.5} />
        )}
      </div>
      <div>{children}</div>
    </div>
  )
}
