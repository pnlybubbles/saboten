import isSP from '@app/util/isSP'
import { DIGIT_NUMBER_REGEXP, FLOAT_NUMBER_REGEXP, PRINTABLE_ASCII_REGEXP } from '@app/util/regexp'
import clsx from 'clsx'
import { forwardRef, useCallback, useEffect, useState } from 'react'

type Props = Omit<
  React.ComponentPropsWithoutRef<'input'>,
  'onChange' | 'onClick' | 'placeholder' | 'type' | 'value'
> & {
  onChange?: (value: string) => void
  onClick?: React.EventHandler<React.SyntheticEvent<unknown>>
  label?: string
  value?: string
  type?: 'text' | 'digit' | 'float'
}

export default forwardRef<HTMLInputElement, Props>(function TextField(
  { onChange, className, onClick, disabled, label, children, value, type = 'text', ...props },
  ref,
) {
  const [inputError, setInputError] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState(value ?? '')

  const normalizer = useCallback(
    (v: string) => {
      if (type === 'float') {
        return (
          v
            .trim()
            // コンマの削除
            .replace(/,/g, '')
            // 先頭の0を削除。 0.1 のゼロは残す
            .replace(/^0+(?!\.)/g, '')
            // 小数点以下の末尾の0を削除。最後の小数点 1. は残す
            .replace(/(\.\d*?)0+$/g, '$1')
        )
      }
      return v
    },
    [type],
  )

  const corrector = useCallback(
    (str: string) => {
      if (type === 'float') {
        // コンマを含んでいたら正しくコンマの位置を矯正してあげる
        if (str.includes(',')) {
          return Intl.NumberFormat('ja-JP').format(parseFloat(normalizer(str)))
        }
        // コンマを含んでいない場合は数値として矯正するのみ
        return normalizer(str)
      }
      return str
    },
    [normalizer, type],
  )

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    // 特定の入力条件の場合は入力をチェックしてエラーを出しつつ、入力を表示に反映せずに棄却する
    const v = normalizer(e.currentTarget.value)
    if (type === 'text') {
      // No validation
    } else if (type === 'digit') {
      if (!PRINTABLE_ASCII_REGEXP.test(v)) return setInputErrorExlicitly('半角で入力してください')
      if (!DIGIT_NUMBER_REGEXP.test(v)) return setInputErrorExlicitly('数字で入力してください')
    } else if (type === 'float') {
      if (!PRINTABLE_ASCII_REGEXP.test(v)) return setInputErrorExlicitly('半角で入力してください')
      if (!FLOAT_NUMBER_REGEXP.test(v)) return setInputErrorExlicitly('数値を入力してください')
    }
    onChange?.(v)
    setInputError(null)
    setInputValue(e.currentTarget.value)
  }

  const handleBlur = () => {
    setInputError(null)
    setInputValue(corrector)
  }

  useEffect(() => {
    setInputValue((v) => (value !== normalizer(v) ? value ?? '' : v))
  }, [inputValue, normalizer, value])

  const [inputErrorAnimation, setInputErrorAnimation] = useState(false)
  const triggerInputError = useCallback(() => {
    setInputErrorAnimation(false)
    setTimeout(() => setInputErrorAnimation(true), 0)
  }, [])

  const setInputErrorExlicitly = useCallback(
    (message: string) => {
      setInputError(message)
      triggerInputError()
    },
    [triggerInputError],
  )

  return (
    <label
      className={clsx(
        'relative grid items-end rounded-xl transition aria-disabled:opacity-40',
        label ? 'h-18' : 'h-14',
        inputError ? 'bg-error/5 shadow-invalid' : 'bg-surface focus-within:shadow-focus',
        inputError && inputErrorAnimation && 'shadow-spread',
        className,
      )}
      aria-disabled={disabled}
    >
      <input
        ref={ref}
        className={clsx(
          'peer w-full bg-transparent px-5 text-base text-zinc-900 outline-none',
          label ? 'h-11' : 'h-full',
        )}
        placeholder=" "
        disabled={disabled}
        {...(disabled ? {} : onChange ? { onChange: (e) => onChange(e.currentTarget.value) } : {})}
        {...(isSP ? { onTouchEnd: onClick } : { onClick })}
        {...props}
        type="text"
        {...(type === 'float' || type === 'digit' ? { inputMode: 'decimal' } : {})}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {label && (
        <div className="pointer-events-none absolute left-5 top-0 grid h-[2.70rem] items-center text-xs font-bold text-zinc-400 transition-[font-size,height] peer-placeholder-shown:h-full peer-placeholder-shown:text-base peer-focus:h-[2.70rem] peer-focus:text-xs">
          {label}
        </div>
      )}
      <div className="absolute right-5 grid h-full items-center">{children}</div>
    </label>
  )
})
