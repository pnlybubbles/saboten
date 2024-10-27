import Button from '@app/components/Button'
import CurrencyText from '@app/components/CurrencyText'
import type { SheetProps } from '@app/components/Sheet'
import Sheet from '@app/components/Sheet'
import TextField from '@app/components/TextField'
import useDirty from '@app/hooks/useDirty'
import useRoomCurrencyRate from '@app/hooks/useRoomCurrencyRate'
import cc from 'currency-codes'
import { useCallback, useState } from 'react'
import * as Icon from 'lucide-react'
import clsx from 'clsx'

interface Props extends SheetProps {
  defaultRate?: number
  roomId: string | null
  currency: string
  toCurrency: string
  removable?: boolean
}

export default function CurrencyRateSheet({
  currency,
  toCurrency,
  roomId,
  defaultRate,
  removable = false,
  ...sheet
}: Props) {
  const [, { updateRate, removeRate, displayCurrency }] = useRoomCurrencyRate(roomId)
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

  const handleRemove = () => {
    clearDirty()
    void removeRate({ currency, toCurrency })
    sheet.onPresent(false)
  }

  return (
    <Sheet {...sheet}>
      <div className="grid gap-4">
        <div className="grid gap-1">
          <div className="font-bold">
            <span>{`${currency} `}</span>
            <CurrencyText {...displayCurrency({ amount: 10 ** currencyDigits, currency })}></CurrencyText>
            <span>{` =`}</span>
          </div>
          <div className="text-xs">{currencyRecord.currency}</div>
        </div>
        <TextField
          label={toCurrency}
          type="float"
          inputMode="decimal"
          value={inputRate}
          onChange={dirty(setInputRate)}
        ></TextField>
        <div className={clsx('grid gap-2', removable && 'grid-cols-[auto_1fr]')}>
          {removable && <Button onClick={handleRemove} icon={<Icon.Trash2 size={20} />} variant="danger"></Button>}
          <Button onClick={handleUpdate} disabled={inputRate === ''}>
            設定
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
