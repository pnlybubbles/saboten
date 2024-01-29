import trpc from '@app/util/trpc'
import { useCallback } from 'react'
import useStore, { createStore } from './useStore'
import type { Room } from './useRoomLocalStorage'
import { ROOM_LOCAL_STORAGE_KEY, roomLocalStorageDescriptor } from './useRoomLocalStorage'
import fetchRoom from '@app/util/fetchRoom'
import { parseISO } from 'date-fns'
import cc from 'currency-codes'
import formatCurrencyNumber from '@app/util/formatCurrencyNumber'

const transform = (room: Room) => room.currencyRate.map((v) => ({ ...v, createdAt: parseISO(v.createdAt) }))

const roomCurrencyRateStore = createStore(
  (roomId: string | null) => ROOM_LOCAL_STORAGE_KEY(roomId ?? 'tmp'),
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
  amount: bigint
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

  const displayCurrency = (value: CurrencyValue, displayAsCurrency: string = value.currency): DisplayCurrencyValue => {
    return formatDisplayCurrencyValue(convertCurrencyValue(value, displayAsCurrency), displayAsCurrency)
  }

  const displayCurrencySum = (value: CurrencyValue[], displayAsCurrency: string): DisplayCurrencyValue => {
    const sum = value.reduce(
      (acc, value) => {
        const converted = convertCurrencyValue(value, displayAsCurrency)
        return acc !== null && converted !== null ? acc + converted : null
      },
      0 as number | null,
    )

    return formatDisplayCurrencyValue(sum, displayAsCurrency)
  }

  const availableCurrencyFor = (displayCurrency: string) => [
    displayCurrency,
    ...(state?.filter((v) => v.toCurrency === displayCurrency).map((v) => v.currency) ?? []),
  ]

  return [state, { updateRate, removeRate, displayCurrency, displayCurrencySum, availableCurrencyFor }] as const
}
