import Button from '@/components/Button'
import type { SheetProps } from '@/components/Sheet'
import Sheet from '@/components/Sheet'
import TextField from '@/components/TextField'
import useRoomCurrencyRate from '@/hooks/useRoomCurrencyRate'
import cc from 'currency-codes'
import { useState } from 'react'

interface Props extends SheetProps {
  roomId: string | null
  currency: string
  toCurrency: string
}

export default function CurrencyRateSheet({ currency, toCurrency, roomId, ...sheet }: Props) {
  const [, { updateRate, displayCurrency }] = useRoomCurrencyRate(roomId)
  const currencyDigits = cc.code(currency)?.digits
  const toCurrencyDigits = cc.code(toCurrency)?.digits
  const [rate, setRate] = useState('')

  if (currencyDigits === undefined || toCurrencyDigits === undefined) {
    return null
  }

  const handleUpdate = () => {
    void updateRate({ currency, toCurrency, rate: (parseFloat(rate) * 10 ** toCurrencyDigits) / 10 ** currencyDigits })
    sheet.onPresent(false)
  }

  return (
    <Sheet {...sheet}>
      <div className="grid gap-4">
        <div className="font-bold">
          {currency} {displayCurrency({ amount: BigInt(10 ** currencyDigits), currency }).value} =
        </div>
        <TextField label={toCurrency} type="number" inputMode="decimal" value={rate} onChange={setRate}></TextField>
        <Button onClick={handleUpdate}>設定</Button>
      </div>
    </Sheet>
  )
}
