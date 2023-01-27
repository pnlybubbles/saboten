import Button from '@/components/Button'
import CurrencyText from '@/components/CurrencyText'
import type { SheetProps } from '@/components/Sheet'
import Sheet from '@/components/Sheet'
import TextField from '@/components/TextField'
import useDirty from '@/hooks/useDirty'
import useRoomCurrencyRate from '@/hooks/useRoomCurrencyRate'
import cc from 'currency-codes'
import { useCallback, useState } from 'react'

interface Props extends SheetProps {
  defaultRate?: number
  roomId: string | null
  currency: string
  toCurrency: string
}

export default function CurrencyRateSheet({ currency, toCurrency, roomId, defaultRate, ...sheet }: Props) {
  const [, { updateRate, displayCurrency }] = useRoomCurrencyRate(roomId)
  const currencyRecord = cc.code(currency)
  const toCurrencyDigits = cc.code(toCurrency)?.digits
  const defaultInputRate =
    currencyRecord?.digits !== undefined && defaultRate !== undefined
      ? defaultRate * 10 ** currencyRecord.digits
      : undefined
  const [inputRate, setInputRate] = useState(defaultInputRate?.toString() ?? '')

  const { dirty, clearDirty } = useDirty(
    useCallback(() => {
      setInputRate(defaultInputRate?.toString() ?? '')
    }, [defaultInputRate]),
  )

  if (currencyRecord === undefined || toCurrencyDigits === undefined) {
    return null
  }

  const currencyDigits = currencyRecord.digits

  const handleUpdate = () => {
    clearDirty()
    void updateRate({
      currency,
      toCurrency,
      rate: (parseFloat(inputRate) * 10 ** toCurrencyDigits) / 10 ** currencyDigits,
    })
    sheet.onPresent(false)
  }

  return (
    <Sheet {...sheet}>
      <div className="grid gap-4">
        <div className="grid gap-1">
          <div className="font-bold">
            <span>{`${currency} `}</span>
            <CurrencyText {...displayCurrency({ amount: BigInt(10 ** currencyDigits), currency })}></CurrencyText>
            <span>{` =`}</span>
          </div>
          <div className="text-xs">{currencyRecord.currency}</div>
        </div>
        <TextField
          label={toCurrency}
          type="number"
          inputMode="decimal"
          value={inputRate}
          onChange={dirty(setInputRate)}
        ></TextField>
        <Button onClick={handleUpdate} disabled={inputRate === ''}>
          設定
        </Button>
      </div>
    </Sheet>
  )
}
