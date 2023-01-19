import isSP from '@/utils/basic/isSP'
import clsx from 'clsx'

interface OwnProps {
  primary?: boolean
  onClick?: React.EventHandler<React.SyntheticEvent<unknown>>
}

type Props = Omit<React.ComponentPropsWithoutRef<'button'>, 'onClick'> & OwnProps

export default function Button({ primary = false, className, onClick, disabled, ...props }: Props) {
  const backgroundColor = toBackgroundColor(primary)
  const foregroundColor = toForegroundColor(primary)

  return (
    <button
      className={clsx(
        className,
        'h-12 w-full select-none rounded-full px-6 text-base font-bold transition active:scale-95 disabled:opacity-30',
        backgroundColor,
        foregroundColor,
      )}
      disabled={disabled}
      {...(disabled ? {} : isSP ? { onTouchEnd: onClick } : { onClick })}
      {...props}
    ></button>
  )
}

const toBackgroundColor = (primary: boolean) => (primary ? 'bg-primary' : 'bg-zinc-900')
const toForegroundColor = (primary: boolean) => (primary ? 'text-white' : 'text-zinc-50')
