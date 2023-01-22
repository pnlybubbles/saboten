import trpc from '@/utils/trpc'
import { useCallback } from 'react'
import useStore, { createStore } from './useStore'
import { ROOM_LOCAL_STORAGE_KEY, roomLocalStorageDescriptor } from './useRoomLocalStorage'
import fetchRoom from '@/utils/fetchRoom'
import { parseISO } from 'date-fns'
import cc from 'currency-codes'
import formatCurrencyNumber from '@/utils/basic/formatCurrencyNumber'

const roomCurrencyRateStore = createStore(
  (roomId: string | null) => ROOM_LOCAL_STORAGE_KEY(roomId ?? 'tmp'),
  (roomId: string | null) => {
    if (roomId === null) {
      return Promise.resolve([])
    }
    return fetchRoom(roomId).then((v) => v.currencyRate.map((v) => ({ ...v, createdAt: parseISO(v.createdAt) })))
  },
)

export type CurrencyRatePayload = {
  currency: string
  toCurrency: string
  rate: number
}

interface CurrencyValue {
  currency: string
  amount: bigint
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
          const data = await trpc.room.currencyRate.update.mutate({ roomId, ...currencyRate })
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
          const data = await trpc.room.currencyRate.remove.mutate({ roomId, ...currencyRate })
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

  const convertCurrencyValue = ({ amount, currency }: CurrencyValue, displayAsCurrency: string) => {
    if (displayAsCurrency !== currency) {
      const current = state?.find((v) => v.currency === currency && v.toCurrency === displayAsCurrency)
      if (current === undefined) {
        return null
      }
      const digits = cc.code(displayAsCurrency)?.digits
      if (digits === undefined) {
        return null
      }
      return (Number(amount) * current.rate) / 10 ** digits
    }
    const digits = cc.code(currency)?.digits
    if (digits === undefined) {
      return null
    }
    return Number(amount) / 10 ** digits
  }

  const displayCurrency = (value: CurrencyValue, displayAsCurrency: string = value.currency) => {
    const converted = convertCurrencyValue(value, displayAsCurrency)
    return converted !== null ? formatCurrencyNumber(converted, displayAsCurrency) : null
  }

  const displayCurrencySum = (value: CurrencyValue[], displayAsCurrency: string) => {
    const sum = value.reduce((acc, value) => acc + (convertCurrencyValue(value, displayAsCurrency) ?? 0), 0)
    return formatCurrencyNumber(sum, displayAsCurrency)
  }

  const availableCurrencyFor = (displayCurrency: string) => [
    displayCurrency,
    ...(state?.filter((v) => v.toCurrency === displayCurrency).map((v) => v.currency) ?? []),
  ]

  return [state, { updateRate, removeRate, displayCurrency, displayCurrencySum, availableCurrencyFor }] as const
}
