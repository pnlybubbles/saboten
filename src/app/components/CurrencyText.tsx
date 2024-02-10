import clsx from 'clsx'
import * as Icon from 'lucide-react'

interface Props {
  className?: string
  value: string
  sign?: boolean
  signSize?: number
  color?: boolean
}

export default function CurrencyText({ value, sign, signSize = 16, color, className }: Props) {
  return (
    <div
      className={clsx(
        'inline-flex items-center justify-end tabular-nums',
        color ? (!sign ? 'text-rose-500' : 'text-lime-600') : '',
        className,
      )}
    >
      {!sign ? (
        <Icon.Minus size={signSize} className="mt-[-2px]" />
      ) : color ? (
        <Icon.Plus size={signSize} className="mt-[-2px]" />
      ) : null}
      {value}
    </div>
  )
}
