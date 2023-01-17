import type { PropsWithChildren } from 'react'
import { useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function Portal({ children, className }: PropsWithChildren<{ className?: string }>) {
  const [el] = useState(document.createElement('div'))

  useLayoutEffect(() => {
    document.body.appendChild(el)
    return () => void document.body.removeChild(el)
  }, [el])

  useLayoutEffect(() => {
    if (className) {
      el.className = className
    }
  }, [className, el])

  return createPortal(children, el)
}
