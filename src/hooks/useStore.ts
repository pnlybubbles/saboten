import { log } from '@/utils/basic/log'
import { useCallback, useSyncExternalStore } from 'react'

class Store<T> {
  private cache: T | undefined
  private listeners: (() => void)[] = []
  private promise: Promise<void> = Promise.resolve()
  private counter = 0

  constructor(
    private fetcher: () => Promise<T>,
    initialCache?: T | undefined,
    private onUpdate?: (value: unknown, label: string) => void,
  ) {
    // 初回はrevalidateする
    this.get()
    this.cache = initialCache
  }

  private updateCache(value: T) {
    this.cache = value
    this.triggerChange()
  }

  public get() {
    if (this.cache === undefined) {
      this.promise = this.fetcher()
        .then((value) => {
          this.updateCache(value)
          this.onUpdate?.(value, 'fetch')
        })
        .catch((e) => console.error('Fetch', e))
    }
    return this.cache
  }

  /**
   * 値を更新する
   * @param mutation Tまたは、前のTから新しいTを生成する関数
   * @param action 値を更新する非同期の関数。戻り値を指定すると、キューが捌けたタイミングでその値を用いてキャッシュの更新を行う。
   * @returns
   */
  public set(mutation: T | ((current: T | undefined) => T | undefined), action?: () => Promise<T | void>) {
    const next =
      typeof mutation === 'function' ? (mutation as (current: T | undefined) => T | undefined)(this.cache) : mutation
    if (next === undefined) {
      return
    }
    this.updateCache(next)
    this.onUpdate?.(next, 'set')
    if (!action) {
      return
    }
    this.counter++
    this.promise = this.promise
      .then(() => action())
      .then((value) => {
        this.counter--
        // すべてのpromiseが解決しきっている場合に限って非同期でキャッシュを更新する
        // 通常はキャッシュと値は一致しているはずなので、不整合は起きない。しかし場合によっては別のリクエストによって値が変更されている可能性がある。
        // ユーザーが何らかの更新処理を行っている最中にキャッシュを補正してしまうと意図しない挙動になる可能性があるので、
        // 更新処理のキューがすべて捌けきったタイミングでのみキャッシュを補正する。
        if (value !== undefined && this.counter === 0) {
          this.updateCache(value)
          this.onUpdate?.(value, 'fixed')
        }
      })
      .catch((e) => console.error('Action', e))
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
  /**
   * NOTE: undefinedはキャッシュがない状態を意味するのでrefetchが行われて無限ループしてしまう
   */
  fetcher: (...args: Args) => Promise<T>,
  /**
   * undefinedはキャッシュが無いことを意味する
   */
  persistCache: (...args: Args) => T | undefined,
) {
  const cache = new Map<string, Store<T>>()

  return {
    cache,
    cacheKey,
    fetcher,
    persistCache,
  }
}

export default function useStore<T, Args extends unknown[]>(
  store: ReturnType<typeof createStore<T, Args>>,
  ...args: Args
) {
  const cacheKey = store.cacheKey(...args)
  const cachedRecord = store.cache.get(cacheKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const record =
    cachedRecord ??
    new Store(
      () => store.fetcher(...args),
      store.persistCache(...args),
      (value, label) => log(`store-${label} [${cacheKey.slice(0, 10)}]`, value),
    )

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
