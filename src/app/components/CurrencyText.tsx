import clsx from 'clsx'
import Icon from './Icon'

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
        <Icon inheritFontSize className="mt-[-2px]" name="remove" />
      ) : color ? (
        <Icon inheritFontSize className="mt-[-2px]" name="add" />
      ) : null}
      {value}
    </div>
  )
}
