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
  const [title, setTitle] = useState(defaultValue ?? '')

  const isDirty = useRef(false)

  useEffect(() => {
    if (isDirty.current) {
      return
    }
    setTitle(defaultValue ?? '')
  }, [defaultValue])

  return (
    <TextField
      value={title}
      onChange={setTitle}
      onFocus={() => {
        isDirty.current = true
      }}
      onBlur={() => {
        if (title === defaultValue) {
          return
        }
        onChange(title)
      }}
      className="bg-transparent focus:bg-zinc-100 px-0 active:scale-95 focus:px-5 transition-[padding,background-color,border-color,transform] text-2xl h-16"
      placeholder={PLACEHOLDER_STRING}
      autoFocus
    />
  )
}
