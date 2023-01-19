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
    <div className="transition active:scale-95 active:focus-within:scale-100">
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
          'h-16 w-full rounded-xl bg-transparent px-0 text-2xl font-bold outline-none transition-[padding,background-color,border-color] focus:bg-surface focus:px-5 active:scale-100'
        }
        placeholder="No title"
        name="title"
      />
    </div>
  )
}
