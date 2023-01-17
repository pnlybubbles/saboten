import type { PropsWithChildren } from 'react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function Portal({ children }: PropsWithChildren) {
  const [el] = useState(document.createElement('div'))

  useEffect(() => {
    document.body.appendChild(el)
    return () => void document.body.removeChild(el)
  }, [el])

  return createPortal(children, el)
}
