import clsx from 'clsx'
import Spinner from './Spinner'
import type { Props as ClickableProps, HTMLClickableElement } from './Clickable'
import Clickable from './Clickable'
import { forwardRef } from 'react'

export type Variant = 'default' | 'primary' | 'secondary' | 'danger' | 'transparent'

interface OwnProps {
  variant?: Variant
  mini?: boolean
  onClick?: React.EventHandler<React.SyntheticEvent<unknown>>
  icon?: React.ReactNode
  loading?: boolean
}

type Props = ClickableProps & OwnProps

export default forwardRef<HTMLClickableElement, Props>(function Button(
  { variant = 'default', mini = false, className, disabled, icon, loading, children, ...props }: Props,
  ref,
) {
  const style = toBackground(variant)

  return (
    <Clickable
      ref={ref}
      className={clsx(
        className,
        'relative select-none rounded-full font-bold transition',
        mini ? 'h-7 text-xs' : 'h-11.5 text-base',
        icon
          ? children == null
            ? mini
              ? 'w-7 p-0'
              : 'w-11.5 p-0'
            : mini
              ? 'w-full pl-3 pr-4'
              : 'w-full pl-5 pr-6'
          : mini
            ? 'px-4'
            : 'w-full px-6',
        loading ? 'cursor-not-allowed' : 'disabled:cursor-not-allowed disabled:opacity-30',
        !loading && !disabled && (icon && children == null ? 'active:scale-90' : 'active:scale-95'),
        style,
      )}
      disabled={disabled || loading}
      {...props}
    >
      <div className={clsx('grid place-items-center transition-opacity', loading ? 'opacity-0' : 'opacity-100')}>
        {icon ? (
          children == null ? (
            icon
          ) : (
            <div className="grid grid-flow-col items-center gap-1">
              {icon}
              <div>{children}</div>
            </div>
          )
        ) : (
          children
        )}
      </div>
      <Spinner
        className={clsx(
          'pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity',
          loading ? 'opacity-100' : 'opacity-0',
        )}
      />
    </Clickable>
  )
})

const toBackground = (variant: Variant) =>
  clsx(
    variant === 'danger'
      ? 'text-white bg-error'
      : variant === 'primary'
        ? 'text-main bg-white shadow-emboss'
        : variant === 'secondary'
          ? 'text-main bg-white shadow-border'
          : variant === 'transparent'
            ? 'text-zinc-400 bg-transparent'
            : 'text-white bg-main',
  )
