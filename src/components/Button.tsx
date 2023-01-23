import isSP from '@/utils/basic/isSP'
import clsx from 'clsx'
import Spinner from './Spinner'

type Variant = 'default' | 'primary' | 'secondary' | 'danger'

interface OwnProps {
  variant?: Variant
  mini?: boolean
  onClick?: React.EventHandler<React.SyntheticEvent<unknown>>
  icon?: React.ReactNode
  loading?: boolean
}

type Props = Omit<React.ComponentPropsWithoutRef<'button'>, 'onClick'> & OwnProps

export default function Button({
  variant = 'default',
  mini = false,
  className,
  onClick,
  disabled,
  icon,
  loading,
  children,
  ...props
}: Props) {
  const backgroundColor = toBackgroundColor(variant)
  const foregroundColor = toForegroundColor(variant)

  return (
    <button
      className={clsx(
        className,
        'relative grid select-none items-center justify-items-center rounded-full font-bold transition',
        mini ? 'h-7 text-xs' : 'h-12 text-base',
        icon ? (children == null ? 'w-12 p-0' : 'w-full pr-6 pl-5') : 'w-full px-6',
        loading ? 'cursor-not-allowed' : 'active:scale-95 disabled:cursor-not-allowed disabled:opacity-30',
        backgroundColor,
        foregroundColor,
      )}
      disabled={disabled || loading}
      {...(disabled || loading ? {} : isSP ? { onTouchEnd: onClick } : { onClick })}
      {...props}
    >
      <div className={clsx('transition-opacity', loading ? 'opacity-[0]' : 'opacity-[1]')}>
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
          'pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity',
          loading ? 'opacity-[1]' : 'opacity-[0]',
        )}
      />
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
