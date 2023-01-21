import isSP from '@/utils/basic/isSP'
import clsx from 'clsx'

interface OwnProps {
  primary?: boolean
  danger?: boolean
  onClick?: React.EventHandler<React.SyntheticEvent<unknown>>
  icon?: React.ReactNode
}

type Props = Omit<React.ComponentPropsWithoutRef<'button'>, 'onClick'> & OwnProps

export default function Button({
  primary = false,
  danger = false,
  className,
  onClick,
  disabled,
  icon,
  children,
  ...props
}: Props) {
  const backgroundColor = toBackgroundColor(primary, danger)
  const foregroundColor = toForegroundColor(primary, danger)

  return (
    <button
      className={clsx(
        className,
        'grid h-12 select-none items-center justify-items-center rounded-full text-base font-bold transition active:scale-95 disabled:opacity-30',
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

const toBackgroundColor = (primary: boolean, danger: boolean) =>
  danger ? 'bg-red-500' : primary ? 'bg-primary' : 'bg-zinc-900'
const toForegroundColor = (primary: boolean, danger: boolean) =>
  danger ? 'text-white' : primary ? 'text-white' : 'text-zinc-50'
