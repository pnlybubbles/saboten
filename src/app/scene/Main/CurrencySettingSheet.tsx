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
        <div className="relative grid">
          <CurrencyPicker
            roomId={roomId}
            value={roomCurrency}
            onChange={setRoomCurrency}
            className="bg-surface aria-expanded:shadow-focus grid h-18 grid-flow-col items-stretch rounded-xl px-5 pt-[0.85rem] pb-2.5 text-start transition disabled:opacity-40"
          >
            <div className="grid grid-flow-row content-between">
              <div className="text-xs font-bold text-zinc-400">基準の通貨</div>
              <div className="grid grid-flow-col justify-start gap-2">
                <div className="text-base">{roomCurrency === null ? '未設定' : roomCurrency}</div>
                {roomCurrency !== null && (
                  <div className="truncate text-zinc-400">{cc.code(roomCurrency)?.currency}</div>
                )}
              </div>
            </div>
            <div className="w-5"></div>
          </CurrencyPicker>
          {roomCurrency !== null && (
            <Clickable
              className="absolute top-1/2 right-2 -translate-y-1/2 self-center p-3 transition active:scale-90"
              onClick={() => setRoomCurrency(null)}
            >
              <Icon.XCircle size={20} />
            </Clickable>
          )}
        </div>
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
        className="bg-surface grid grid-flow-col grid-cols-[auto_1fr] gap-2 rounded-lg px-5 py-4 transition active:scale-95"
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
          <Icon.AlertCircle size={20} className="text-error inline-block self-center"></Icon.AlertCircle>
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
