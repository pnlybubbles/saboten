import clsx from 'clsx'

type Props = Omit<React.ComponentPropsWithoutRef<'input'>, 'onChange'> & {
  onChange: (value: string) => void
}

export default function TextField({ onChange, className, ...rest }: Props) {
  return (
    <input
      type="text"
      className={clsx(
        'bg-zinc-200 border-2 border-transparent focus:border-zinc-900 focus:bg-zinc-100 w-full h-12 rounded-xl px-5 outline-none text-base transition',
        className,
      )}
      onChange={(e) => onChange(e.currentTarget.value)}
      {...rest}
    />
  )
}
