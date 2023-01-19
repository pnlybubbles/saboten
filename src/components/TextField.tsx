import isSP from '@/utils/basic/isSP'
import clsx from 'clsx'
import { forwardRef } from 'react'

type Props = Omit<React.ComponentPropsWithoutRef<'input'>, 'onChange' | 'onClick'> & {
  onChange?: (value: string) => void
  onClick?: React.EventHandler<React.SyntheticEvent<unknown>>
}

export default forwardRef<HTMLInputElement, Props>(function TextField(
  { onChange, className, onClick, disabled, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type="text"
      className={clsx(
        'bg-zinc-200 text-zinc-900 border-2 border-transparent focus:border-zinc-900 focus:bg-zinc-100 w-full h-12 rounded-xl px-5 outline-none text-base transition font-bold placeholder:text-zinc-400 disabled:opacity-30',
        className,
      )}
      disabled={disabled}
      {...(disabled ? {} : onChange ? { onChange: (e) => onChange(e.currentTarget.value) } : {})}
      {...(isSP ? { onTouchEnd: onClick } : { onClick })}
      {...props}
    />
  )
})
