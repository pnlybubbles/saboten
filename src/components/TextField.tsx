import isSP from '@/utils/basic/isSP'
import clsx from 'clsx'
import { forwardRef } from 'react'

type Props = Omit<React.ComponentPropsWithoutRef<'input'>, 'onChange' | 'onClick' | 'placeholder'> & {
  onChange?: (value: string) => void
  onClick?: React.EventHandler<React.SyntheticEvent<unknown>>
  label?: string
}

export default forwardRef<HTMLInputElement, Props>(function TextField(
  { onChange, className, onClick, disabled, label, children, ...props },
  ref,
) {
  return (
    <label
      className={clsx(
        'relative grid items-end rounded-xl border-2 border-transparent bg-surface transition focus-within:border-zinc-900 disabled:opacity-30',
        label ? 'h-18' : 'h-14',
        className,
      )}
      aria-disabled={disabled}
    >
      <input
        ref={ref}
        type="text"
        className={clsx(
          'peer w-full bg-transparent px-5 text-base text-zinc-900 outline-none',
          label ? 'h-[2.75rem]' : 'h-full',
        )}
        placeholder=" "
        disabled={disabled}
        {...(disabled ? {} : onChange ? { onChange: (e) => onChange(e.currentTarget.value) } : {})}
        {...(isSP ? { onTouchEnd: onClick } : { onClick })}
        {...props}
      />
      {label && (
        <div className="pointer-events-none absolute top-0 left-5 grid h-[2.70rem] items-center text-xs font-bold text-zinc-400 transition-[font-size,height] peer-placeholder-shown:h-full peer-placeholder-shown:text-base peer-focus:h-[2.70rem] peer-focus:text-xs">
          {label}
        </div>
      )}
      <div className="absolute right-4 grid h-full items-center">{children}</div>
    </label>
  )
})
