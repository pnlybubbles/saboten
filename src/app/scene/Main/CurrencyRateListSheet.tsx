import Clickable from '@app/components/Clickable'
import CurrencyText from '@app/components/CurrencyText'
import type { SheetProps } from '@app/components/Sheet'
import Sheet from '@app/components/Sheet'
import usePresent from '@app/hooks/usePresent'
import type { CurrencyRatePayload } from '@app/hooks/useRoomCurrencyRate'
import useRoomCurrencyRate from '@app/hooks/useRoomCurrencyRate'
import cc from 'currency-codes'
import CurrencyRateSheet from './CurrencyRateSheet'

interface Props extends SheetProps {
  roomId: string
}

export default function CurrencyRateListSheet({ roomId, ...sheet }: Props) {
  const [currencyRate] = useRoomCurrencyRate(roomId)

  return (
    <Sheet {...sheet}>
      <div className="grid gap-4">
        <div className="font-bold">通貨レート</div>
        <div className="grid gap-2">
          {currencyRate?.map((v) => (
            <CurrencyRateItem key={`${v.currency}_${v.toCurrency}`} {...v} roomId={roomId}></CurrencyRateItem>
          ))}
        </div>
      </div>
    </Sheet>
  )
}

function CurrencyRateItem({ currency, toCurrency, rate, roomId }: CurrencyRatePayload & { roomId: string }) {
  const [, { displayCurrency }] = useRoomCurrencyRate(roomId)
  const currencyRateSheet = usePresent()

  const currencyRecord = cc.code(currency)
  const toCurrencyDigits = cc.code(toCurrency)?.digits

  if (currencyRecord === undefined || toCurrencyDigits === undefined) {
    return null
  }

  const currencyDigits = currencyRecord.digits

  return (
    <>
      <Clickable
        onClick={currencyRateSheet.open}
        className="grid grid-flow-col justify-between rounded-lg bg-surface p-4 transition active:scale-95"
      >
        <div className="font-bold">{`${currency} / ${toCurrency}`}</div>
        <div>
          <CurrencyText
            {...displayCurrency({ amount: 10 ** currencyDigits, currency })}
            className="text-xs font-bold text-zinc-400"
          ></CurrencyText>
          <span className="text-xs font-bold text-zinc-400">{` = `}</span>
          <CurrencyText
            {...displayCurrency({ amount: rate * 10 ** currencyDigits, currency: toCurrency }, undefined, true)}
            className="font-bold"
          ></CurrencyText>
        </div>
      </Clickable>
      <CurrencyRateSheet
        currency={currency}
        toCurrency={toCurrency}
        defaultRate={rate}
        roomId={roomId}
        removable
        {...currencyRateSheet}
      ></CurrencyRateSheet>
    </>
  )
}
