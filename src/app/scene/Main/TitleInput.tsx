import useDirty from '@app/hooks/useDirty'
import clsx from 'clsx'
import { useCallback, useRef, useState } from 'react'

export default function TitleInput({
  defaultValue = '',
  onChange,
  className,
  disabled,
}: {
  defaultValue: string | undefined
  onChange: (title: string) => void
  className?: string
  disabled?: boolean
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState(defaultValue)

  const { setDirty, clearDirty } = useDirty(
    useCallback(() => {
      setTitle(defaultValue)
    }, [defaultValue]),
  )

  return (
    <div
      className={clsx(
        'transition active:scale-95 active:focus-within:scale-100 aria-disabled:active:scale-100',
        className,
      )}
      aria-disabled={disabled}
    >
      <input
        ref={ref}
        value={title}
        onChange={(e) => {
          setTitle(e.currentTarget.value)
          setDirty()
        }}
        onBlur={() => {
          clearDirty()
          if (title === defaultValue) {
            return
          }
          onChange(title)
        }}
        className={
          'focus:bg-surface h-16 w-full rounded-xl bg-transparent px-0 text-2xl transition-[padding,background-color,border-color] outline-none focus:px-5 active:scale-100'
        }
        placeholder="No title"
        name="title"
        disabled={disabled}
      />
    </div>
  )
}
