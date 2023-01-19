import { useEffect, useRef, useState } from 'react'

export default function TitleInput({
  defaultValue,
  onChange,
}: {
  defaultValue: string | undefined
  onChange: (title: string) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState(defaultValue ?? '')

  const isDirty = useRef(false)

  useEffect(() => {
    if (isDirty.current) {
      return
    }
    setTitle(defaultValue ?? '')
  }, [defaultValue])

  return (
    <div className="active:scale-95 transition active:focus-within:scale-100">
      <input
        ref={ref}
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
        onBlur={() => {
          if (title === defaultValue) {
            return
          }
          onChange(title)
        }}
        onFocus={() => {
          isDirty.current = true
        }}
        className={
          'font-bold bg-transparent rounded-xl w-full focus:bg-surface outline-none px-0 focus:px-5 transition-[padding,background-color,border-color] text-2xl h-16 active:scale-100'
        }
        placeholder="No title"
        name="title"
      />
    </div>
  )
}
