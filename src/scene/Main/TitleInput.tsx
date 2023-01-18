import TextField from '@/components/TextField'
import { useEffect, useRef, useState } from 'react'

const PLACEHOLDER_STRING = '無名の旅'

export default function TitleInput({
  defaultValue,
  onChange,
}: {
  defaultValue: string | undefined
  onChange: (title: string) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [edit, setEdit] = useState(false)
  const [title, setTitle] = useState(defaultValue ?? '')

  const isDirty = useRef(false)

  useEffect(() => {
    if (isDirty.current) {
      return
    }
    setTitle(defaultValue ?? '')
  }, [defaultValue])

  useEffect(() => {
    if (edit) {
      ref.current?.focus()
    }
  }, [edit])

  return (
    <button
      onClick={() => {
        setEdit(true)
        isDirty.current = true
      }}
    >
      <TextField
        ref={ref}
        value={title}
        onChange={setTitle}
        onBlur={() => {
          setEdit(false)
          if (title === defaultValue) {
            return
          }
          onChange(title)
        }}
        disabled={!edit}
        className="bg-transparent active:scale-95 focus:bg-zinc-100 px-0 focus:px-5 transition-[padding,background-color,border-color,transform] text-2xl h-16"
        placeholder={PLACEHOLDER_STRING}
        autoFocus
      />
    </button>
  )
}
