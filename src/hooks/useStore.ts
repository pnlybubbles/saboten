import { useCallback, useSyncExternalStore } from 'react'

class Store<T> {
  private cache: T | undefined
  private listeners: (() => void)[] = []
  private promise: Promise<void> = Promise.resolve()

  constructor(private fetcher: () => Promise<T>) {}

  private updateCache(value: T) {
    this.cache = value
    this.triggerChange()
  }

  public get() {
    if (this.cache === undefined) {
      this.promise = this.fetcher()
        .then((value) => this.updateCache(value))
        .catch((e) => console.error('Fetch', e))
    }
    return this.cache
  }

  public set(mutation: T | ((current: T | undefined) => T), action?: (next: T) => Promise<void>) {
    const next = typeof mutation === 'function' ? (mutation as (current: T | undefined) => T)(this.cache) : mutation
    this.updateCache(next)
    if (!action) {
      return
    }
    this.promise = this.promise.then(() => action(next)).catch((e) => console.error('Action', e))
    return this.promise
  }

  private triggerChange() {
    for (const cb of this.listeners) cb()
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb)

    return () => {
      const index = this.listeners.indexOf(cb)
      if (index !== -1) {
        this.listeners.splice(index, 1)
      }
    }
  }
}

export function createStore<T, Args extends unknown[] = []>(
  cacheKey: (...args: Args) => string,
  fetcher: (...args: Args) => Promise<T>,
) {
  const cache = new Map<string, Store<T>>()

  return {
    cache,
    cacheKey,
    fetcher,
  }
}

export default function useStore<T, Args extends unknown[]>(
  store: ReturnType<typeof createStore<T, Args>>,
  ...args: Args
) {
  const cacheKey = store.cacheKey(...args)
  const cachedRecord = store.cache.get(cacheKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const record = cachedRecord ?? new Store(() => store.fetcher(...args))

  if (cachedRecord === undefined) {
    store.cache.set(cacheKey, record)
  }

  const state = useSyncExternalStore(
    useCallback((cb) => record.subscribe(cb), [record]),
    () => record.get(),
  )

  const setState = useCallback((...args: Parameters<typeof record.set>) => record.set(...args), [record])

  return [state, setState] as const
}
