import clsx from 'clsx'
import Clickable from './Clickable'

interface Props<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export default function Tab<T extends string>({ options, value, onChange, className }: Props<T>) {
  return (
    <div className="grid grid-flow-col gap-3 justify-self-start text-xs font-bold">
      {options.map((option) => (
        <Clickable
          key={option.value}
          onClick={() => onChange(option.value)}
          className={clsx(
            'rounded-xl bg-surface px-4 py-2 transition active:scale-90',
            value === option.value ? 'border-2 border-zinc-900 text-zinc-900' : 'text-zinc-400',
            className,
          )}
        >
          {option.label}
        </Clickable>
      ))}
    </div>
  )
}
