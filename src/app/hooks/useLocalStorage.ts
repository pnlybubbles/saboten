import { useEffect, useState } from 'react'
import type { LocalStorageDescriptor } from '@app/util/createLocalStorageDescriptor'

export const useLocalStorage = <T>(descriptor: LocalStorageDescriptor<T> | undefined) => {
  const [state, setState] = useState<T | null>(null)
  const [ready, setReady] = useState<null | string>()

  useEffect(() => {
    if (descriptor === undefined) {
      return
    }

    setState(descriptor.get())
    setReady(descriptor.key)

    return descriptor.observe(() => setState(descriptor.get()))
  }, [descriptor])

  if (descriptor === undefined || descriptor.key !== ready) {
    return [null, noop, false] as const
  }

  return [state, descriptor.set, true] as const
}

const noop = () => {
  console.warn('Nothing updated. Storage descriptor is not prepared.')
}
