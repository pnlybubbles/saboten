import { useMemo, useState } from 'react'

export default function usePresent(defaultPresent = false) {
  const [isPresent, onPresent] = useState(defaultPresent)
  return useMemo(
    () => ({ isPresent, onPresent, open: () => onPresent(true), close: () => onPresent(false) }),
    [isPresent, onPresent],
  )
}
