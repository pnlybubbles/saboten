import isSP from '@/utils/basic/isSP'
import clsx from 'clsx'
import { forwardRef } from 'react'

type Props = Omit<React.ComponentPropsWithoutRef<'input'>, 'onChange' | 'onClick' | 'placeholder'> & {
  onChange?: (value: string) => void
  onClick?: React.EventHandler<React.SyntheticEvent<unknown>>
  label?: string
}

export default forwardRef<HTMLInputElement, Props>(function TextField(
  { onChange, className, onClick, disabled, label, ...props },
  ref,
) {
  return (
    <label
      className={clsx(
        'relative bg-surface border-2 border-transparent focus-within:border-zinc-900 rounded-xl grid items-end transition disabled:opacity-30',
        label ? 'h-[4.5em]' : 'h-14',
      )}
      aria-disabled={disabled}
    >
      <input
        ref={ref}
        type="text"
        className={clsx(
          'peer bg-transparent text-zinc-900 w-full px-5 outline-none text-base placeholder:text-zinc-400',
          label ? 'h-[2.75rem]' : 'h-full',
          className,
        )}
        placeholder=" "
        disabled={disabled}
        {...(disabled ? {} : onChange ? { onChange: (e) => onChange(e.currentTarget.value) } : {})}
        {...(isSP ? { onTouchEnd: onClick } : { onClick })}
        {...props}
      />
      {label && (
        <div className="absolute text-xs peer-placeholder-shown:text-base peer-placeholder-shown:h-full peer-focus:text-xs peer-focus:h-[2.70rem] font-bold text-zinc-400 h-[2.70rem] top-0 left-5 grid items-center pointer-events-none transition-[font-size,height]">
          {label}
        </div>
      )}
    </label>
  )
})
