import { useEffect } from 'react'

export default function useDocumentTitle(title?: string) {
  useEffect(() => {
    if (title === undefined) return
    document.title = title ? `${title} - Saboten` : 'Saboten'
  }, [title])
}
