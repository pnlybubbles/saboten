import { useEffect, useState } from 'react'
import type { LocalStorageDescriptor } from '@/utils/localstorage'

export const useLocalStorage = <T>(descriptor: LocalStorageDescriptor<T>) => {
  const [state, setState] = useState<T | null>(null)

  useEffect(() => {
    setState(descriptor.get())

    return descriptor.observe(() => setState(descriptor.get()))
  }, [descriptor])

  return [state, descriptor.set] as const
}
