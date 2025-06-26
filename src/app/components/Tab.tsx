import clsx from 'clsx'
import Clickable from './Clickable'

interface Props<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  disabled?: boolean
  className?: string
}

export default function Tab<T extends string>({ options, value, onChange, disabled, className }: Props<T>) {
  return (
    <div className="grid grid-flow-col gap-3 justify-self-start text-xs font-bold">
      {options.map((option) => (
        <Clickable
          key={option.value}
          onClick={() => onChange(option.value)}
          className={clsx(
            'bg-surface rounded-xl px-4 py-2 transition active:scale-90 disabled:opacity-40',
            !disabled && value === option.value ? 'border-2 border-zinc-900 text-zinc-900' : 'text-zinc-400',
            disabled && value !== option.value && 'hidden',
            className,
          )}
          disabled={disabled}
        >
          {option.label}
        </Clickable>
      ))}
    </div>
  )
}
