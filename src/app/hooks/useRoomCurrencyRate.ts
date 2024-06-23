import { useCallback } from 'react'
import useStore, { createStore } from './useStore'
import type { Room } from './useRoomLocalStorage'
import { ROOM_LOCAL_STORAGE_KEY, roomLocalStorageDescriptor } from './useRoomLocalStorage'
import fetchRoom from '@app/util/fetchRoom'
import { parseISO } from 'date-fns'
import cc from 'currency-codes'
import formatCurrencyNumber from '@app/util/formatCurrencyNumber'
import rpc from '@app/util/rpc'
import ok from '@app/util/ok'

const transform = (room: Room) => room.currencyRate.map((v) => ({ ...v, createdAt: parseISO(v.createdAt) }))

const roomCurrencyRateStore = createStore(
  (roomId: string | null) => (roomId ? ROOM_LOCAL_STORAGE_KEY(roomId) : null),
  (roomId: string | null) => {
    if (roomId === null) {
      return Promise.resolve([])
    }
    return fetchRoom(roomId).then(transform)
  },
  (roomId: string | null) => {
    if (roomId === null) {
      return []
    }
    const room = roomLocalStorageDescriptor(roomId).get()
    return room ? transform(room) : undefined
  },
)

export type CurrencyRatePayload = {
  currency: string
  toCurrency: string
  rate: number
}

interface CurrencyValue {
  currency: string
  amount: number
}

type DisplayCurrencyValue = {
  value: string
  sign: boolean
  invalid: boolean
}

export default function useRoomCurrencyRate(roomId: string | null) {
  const [state, setState] = useStore(roomCurrencyRateStore, roomId)

  const updateRate = useCallback(
    (currencyRate: CurrencyRatePayload) =>
      setState(
        (current) => {
          const index = current?.findIndex(
            (v) => v.currency === currencyRate.currency && v.toCurrency === currencyRate.toCurrency,
          )
          if (current === undefined || index === undefined || index === -1) {
            return [...(current ?? []), { ...currencyRate, createdAt: new Date() }]
          }
          return [
            ...current.slice(0, index),
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            { ...current[index]!, rate: currencyRate.rate },
            ...current.slice(index + 1),
          ]
        },
        async () => {
          if (roomId === null) {
            // イベントを登録してからじゃないとレート入力は必要にならないので、ルームがない場合は利用不可
            throw new Error('No room to add currency rate')
          }
          const data = await ok(rpc.api.room.currencyRate.update.$post({ json: { roomId, ...currencyRate } }))
          const desc = roomLocalStorageDescriptor(roomId)
          const current = desc.get()
          if (current === null) {
            // この時点でデータがキャッシュサれていないのは流石にエラー
            throw new Error('No cache')
          }
          desc.set({ ...current, currencyRate: data })
          return data.map((v) => ({ ...v, createdAt: parseISO(v.createdAt) }))
        },
      ),
    [roomId, setState],
  )

  const removeRate = useCallback(
    (currencyRate: Omit<CurrencyRatePayload, 'rate'>) =>
      setState(
        (current) => {
          if (current === undefined) {
            return current
          }
          const index = current.findIndex(
            (v) => v.currency === currencyRate.currency && v.toCurrency === currencyRate.toCurrency,
          )
          if (index === -1) {
            // 消そうと思ってたものが既に無い。なんもしない
            return current
          }
          return [...current.slice(0, index), ...current.slice(index + 1)]
        },
        async () => {
          if (roomId === null) {
            // イベントを登録してからじゃないとレート入力は必要にならないので、ルームがない場合は利用不可
            throw new Error('No room to remove currency rate')
          }
          const data = await ok(rpc.api.room.currencyRate.remove.$post({ json: { roomId, ...currencyRate } }))
          const desc = roomLocalStorageDescriptor(roomId)
          const current = desc.get()
          if (current === null) {
            // この時点でデータがキャッシュサれていないのは流石にエラー
            throw new Error('No cache')
          }
          desc.set({ ...current, currencyRate: data })
          return data.map((v) => ({ ...v, createdAt: parseISO(v.createdAt) }))
        },
      ),
    [roomId, setState],
  )

  const convertCurrencyValue = useCallback(
    ({ amount, currency }: CurrencyValue, targetCurrency: string) => {
      if (targetCurrency === currency) {
        return { amount, currency }
      }
      const current = state?.find((v) => v.currency === currency && v.toCurrency === targetCurrency)
      if (current === undefined) {
        return null
      }
      return { amount: amount * current.rate, currency: targetCurrency }
    },
    [state],
  )

  const convertCurrencyValueToRaw = useCallback(
    (value: CurrencyValue, displayAsCurrency: string) => {
      const displayValue = convertCurrencyValue(value, displayAsCurrency)
      if (displayValue === null) return null
      const digits = cc.code(displayValue.currency)?.digits
      if (digits === undefined) {
        return null
      }
      return displayValue.amount / 10 ** digits
    },
    [convertCurrencyValue],
  )

  const displayCurrency = useCallback(
    (value: CurrencyValue, displayAsCurrency: string = value.currency): DisplayCurrencyValue => {
      return formatDisplayCurrencyValue(convertCurrencyValueToRaw(value, displayAsCurrency), displayAsCurrency)
    },
    [convertCurrencyValueToRaw],
  )

  const displayCurrencySum = useCallback(
    (value: CurrencyValue[], displayAsCurrency: string): DisplayCurrencyValue => {
      const sum = value.reduce(
        (acc, value) => {
          const converted = convertCurrencyValueToRaw(value, displayAsCurrency)
          return acc !== null && converted !== null ? acc + converted : null
        },
        0 as number | null,
      )

      return formatDisplayCurrencyValue(sum, displayAsCurrency)
    },
    [convertCurrencyValueToRaw],
  )

  const availableCurrencyFor = useCallback(
    (displayCurrency: string) => [
      displayCurrency,
      ...(state?.filter((v) => v.toCurrency === displayCurrency).map((v) => v.currency) ?? []),
    ],
    [state],
  )

  return [
    state,
    {
      updateRate,
      removeRate,
      displayCurrency,
      displayCurrencySum,
      availableCurrencyFor,
      convertCurrencyValue,
    },
  ] as const
}

const formatDisplayCurrencyValue = (raw: number | null, displayAsCurrency: string) => {
  if (raw === null) {
    return { value: '?', sign: true, invalid: true }
  }

  const negative = raw < 0

  return {
    value: formatCurrencyNumber(negative ? -raw : raw, displayAsCurrency),
    sign: !negative,
    invalid: false,
  }
}
