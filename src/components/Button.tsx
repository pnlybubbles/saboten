import clsx from 'clsx'

interface OwnProps {
  primary?: boolean
}

type Props = React.ComponentPropsWithoutRef<'button'> & OwnProps

export default function Button({ primary = false, className, ...props }: Props) {
  const backgroundColor = toBackgroundColor(primary)
  const foregroundColor = toForegroundColor(primary)

  return (
    <button
      {...props}
      className={clsx(
        className,
        'h-12 px-5 rounded-full font-bold w-full active:scale-95 transition text-base disabled:opacity-30',
        backgroundColor,
        foregroundColor,
      )}
    ></button>
  )
}

const toBackgroundColor = (primary: boolean) => (primary ? 'bg-zinc-900' : 'bg-white border-zinc-900 border-2')
const toForegroundColor = (primary: boolean) => (primary ? 'text-zinc-50' : 'text-zinc-900')
