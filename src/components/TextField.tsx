import clsx from 'clsx'
import { forwardRef } from 'react'

type Props = Omit<React.ComponentPropsWithoutRef<'input'>, 'onChange'> & {
  onChange: (value: string) => void
}

export default forwardRef<HTMLInputElement, Props>(function TextField({ onChange, className, ...rest }, ref) {
  return (
    <input
      ref={ref}
      type="text"
      className={clsx(
        'bg-zinc-200 border-2 border-transparent focus:border-zinc-900 focus:bg-zinc-100 w-full h-12 rounded-xl px-5 outline-none text-base transition font-bold placeholder:text-zinc-400',
        className,
      )}
      onChange={(e) => onChange(e.currentTarget.value)}
      {...rest}
    />
  )
})
