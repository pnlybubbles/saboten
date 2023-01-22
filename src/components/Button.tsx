import isSP from '@/utils/basic/isSP'
import clsx from 'clsx'

type Variant = 'default' | 'primary' | 'secondary' | 'danger'

interface OwnProps {
  variant?: Variant
  mini?: boolean
  onClick?: React.EventHandler<React.SyntheticEvent<unknown>>
  icon?: React.ReactNode
}

type Props = Omit<React.ComponentPropsWithoutRef<'button'>, 'onClick'> & OwnProps

export default function Button({
  variant = 'default',
  mini = false,
  className,
  onClick,
  disabled,
  icon,
  children,
  ...props
}: Props) {
  const backgroundColor = toBackgroundColor(variant)
  const foregroundColor = toForegroundColor(variant)

  return (
    <button
      className={clsx(
        className,
        'grid select-none items-center justify-items-center rounded-full font-bold transition active:scale-95 disabled:opacity-30',
        mini ? 'h-7 text-xs' : 'h-12 text-base',
        icon ? (children == null ? 'w-12 p-0' : 'w-full pr-6 pl-5') : 'w-full px-6',
        backgroundColor,
        foregroundColor,
      )}
      disabled={disabled}
      {...(disabled ? {} : isSP ? { onTouchEnd: onClick } : { onClick })}
      {...props}
    >
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
    </button>
  )
}

const toBackgroundColor = (variant: Variant) =>
  variant === 'danger'
    ? 'bg-red-500'
    : variant === 'primary'
    ? 'bg-primary'
    : variant === 'secondary'
    ? 'border border-primary'
    : 'bg-zinc-900'
const toForegroundColor = (variant: Variant) =>
  variant === 'danger'
    ? 'text-white'
    : variant === 'primary'
    ? 'text-white'
    : variant === 'secondary'
    ? 'text-primary'
    : 'text-zinc-50'
