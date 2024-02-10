import clsx from 'clsx'
import * as Icon from 'lucide-react'

interface Props {
  className?: string
  value: string
  sign?: boolean
  color?: boolean
}

export default function CurrencyText({ value, sign, color, className }: Props) {
  return (
    <div
      className={clsx(
        'inline-flex items-center justify-end tabular-nums',
        color ? (!sign ? 'text-rose-500' : 'text-lime-600') : '',
        className,
      )}
    >
      {!sign ? (
        <Icon.Minus size={16} className="mt-[-1px]" />
      ) : color ? (
        <Icon.Plus size={16} className="mt-[-1px]" />
      ) : null}
      {value}
    </div>
  )
}
