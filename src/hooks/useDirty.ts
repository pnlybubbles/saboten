import { useCallback, useEffect, useRef } from 'react'

export default function useDirty(setter: () => void) {
  const isDirty = useRef(false)

  useEffect(() => {
    if (isDirty.current) {
      return
    }
    setter()
  }, [setter])

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
    isDirty.current = true
  }, [])

  return { isDirty, setDirty, clearDirty, dirty } as const
}
