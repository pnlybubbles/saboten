import { useCallback, useEffect, useRef } from 'react'

export default function useDirty(reset: () => void) {
  const isDirty = useRef(false)

  useEffect(() => {
    if (isDirty.current) {
      return
    }
    reset()
  }, [reset])

  const setDirty = useCallback(() => {
    isDirty.current = true
  }, [])

  const dirty = useCallback(<Args extends unknown[]>(setter: (...args: Args) => void) => {
    return (...args: Args) => {
      isDirty.current = true
      setter(...args)
    }
  }, [])

  const clearDirty = useCallback(() => {
    isDirty.current = false
  }, [])

  return { isDirty, setDirty, clearDirty, dirty } as const
}
