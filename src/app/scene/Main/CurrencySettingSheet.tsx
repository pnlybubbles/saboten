import Clickable from '@app/components/Clickable'
import CurrencyText from '@app/components/CurrencyText'
import type { SheetProps } from '@app/components/Sheet'
import Sheet from '@app/components/Sheet'
import usePresent from '@app/hooks/usePresent'
import useRoomCurrencyRate from '@app/hooks/useRoomCurrencyRate'
import cc from 'currency-codes'
import CurrencyRateSheet from './CurrencyRateSheet'
import CurrencyPicker from '@app/components/CurrencyPicker'
import useRoomCurrency from '@app/hooks/useRoomCurrency'
import useEvents, { deriveUsedCurrency } from '@app/hooks/useEvents'
import { useMemo } from 'react'
import * as Icon from 'lucide-react'
import Tips from '@app/components/Tips'

interface Props extends SheetProps {
  roomId: string
}

export const DEFAULT_PRIMARY_CURRENCY = 'JPY'

export default function CurrencySettingSheet({ roomId, ...sheet }: Props) {
  const [currencyRate = []] = useRoomCurrencyRate(roomId)
  const [roomCurrency, setRoomCurrency] = useRoomCurrency(roomId)
  const [events] = useEvents(roomId)
  const usedCurrencyRate = useMemo(
    () =>
      roomCurrency === null
        ? null
        : deriveUsedCurrency(events ?? [])
            .filter((v) => v !== roomCurrency)
            .map((currency) => ({
              currency,
              toCurrency: roomCurrency,
              rate: currencyRate.find((w) => w.toCurrency === roomCurrency && w.currency === currency)?.rate,
            })),
    [currencyRate, events, roomCurrency],
  )

  return (
    <Sheet {...sheet}>
      <div className="grid gap-4">
        <CurrencyPicker
          roomId={roomId}
          value={roomCurrency}
          onChange={setRoomCurrency}
          className="grid h-18 grid-flow-row content-between rounded-xl bg-surface px-5 pb-2.5 pt-[0.85rem] text-start transition disabled:opacity-40 aria-expanded:shadow-focus"
        >
          <div className="text-xs font-bold text-zinc-400">基準の通貨</div>
          <div className="grid grid-flow-col justify-start gap-2">
            <div className="text-base">{roomCurrency === null ? '未設定' : roomCurrency}</div>
            {roomCurrency !== null && <div className="truncate text-zinc-400">{cc.code(roomCurrency)?.currency}</div>}
          </div>
        </CurrencyPicker>
        {usedCurrencyRate && (
          <>
            <div className="text-xs font-bold text-zinc-400">通貨レート</div>
            <div className="grid gap-2">
              {usedCurrencyRate.map((v) => (
                <CurrencyRateItem key={`${v.currency}_${v.toCurrency}`} {...v} roomId={roomId}></CurrencyRateItem>
              ))}
            </div>
          </>
        )}
        {usedCurrencyRate?.find((v) => v.rate === undefined) && (
          <Tips type="warning">通貨レートが設定されていない場合は、通貨ごとに計算が行われて個別に表記されます。</Tips>
        )}
      </div>
    </Sheet>
  )
}

function CurrencyRateItem({
  currency,
  toCurrency,
  rate,
  roomId,
}: {
  currency: string
  toCurrency: string
  rate?: number | undefined
  roomId: string
}) {
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
        className="grid grid-flow-col grid-cols-[auto_1fr] gap-2 rounded-lg bg-surface p-4 transition active:scale-95"
      >
        <div>{`${currency} / ${toCurrency}`}</div>
        <div className="text-end">
          <CurrencyText
            {...displayCurrency({ amount: 10 ** currencyDigits, currency })}
            className="text-xs font-bold text-zinc-400"
          ></CurrencyText>
          <span className="text-xs font-bold text-zinc-400">{` = `}</span>
          {rate ? (
            <CurrencyText
              {...displayCurrency({ amount: rate * 10 ** currencyDigits, currency: toCurrency }, undefined, true)}
            ></CurrencyText>
          ) : (
            <span>?</span>
          )}
        </div>
        {rate === undefined && (
          <Icon.AlertCircle size={20} className="inline-block self-center text-error"></Icon.AlertCircle>
        )}
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
