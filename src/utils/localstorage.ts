import type { ZodType } from 'zod'

export type LocalStorageDescriptor<T> = ReturnType<typeof createLocalStorageDescriptor<T>>

export const createLocalStorageDescriptor = <T>(key: string, schema: ZodType<T>, defaultValue?: T) => {
  const cache = new Map<string, T>()

  const naiveGet = () => {
    const raw = localStorage.getItem(key)
    // 存在しない時は null
    if (raw === null) {
      return null
    }
    // キャッシュをチェックして参照を維持
    const cached = cache.get(raw)
    if (cached) {
      return cached
    }
    const value = schema.safeParse(deserialize(raw))
    // スキーマに合致しない時も null
    if (!value.success) {
      return null
    }
    cache.set(raw, value.data)
    return value.data
  }

  const get = () => {
    const value = naiveGet()
    return value === null && defaultValue !== undefined ? defaultValue : value
  }

  const set = (value: T | undefined) => {
    if (value === undefined) {
      // undefinedがセットされる場合にはkeyごと削除
      localStorage.removeItem(key)
    } else {
      const raw = serialize(schema.parse(value))
      localStorage.setItem(key, raw)
    }

    // 同一ウィンドウではstorageイベントが発火しないので、手動で発火させる
    const event = new StorageEvent('storage', {
      bubbles: true,
      cancelable: false,
      key: key,
      url: location.href,
      storageArea: localStorage,
    })
    dispatchEvent(event)
  }

  const observe = (listener: () => void) => {
    const handleStorage = (e: StorageEvent) => {
      if (e.storageArea !== localStorage) {
        return
      }
      if (e.key !== key) {
        return
      }
      listener()
    }

    window.addEventListener('storage', listener)

    return () => window.removeEventListener('storage', handleStorage)
  }

  return { key, get, set, observe }
}

function deserialize(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    // syntax error はすべて文字列として扱う
    return raw
  }
}

function serialize(value: unknown): string {
  if (typeof value === 'string') {
    return value
  } else {
    return JSON.stringify(value)
  }
}
