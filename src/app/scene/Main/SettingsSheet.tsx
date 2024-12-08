import Button from '@app/components/Button'
import CurrencyText from '@app/components/CurrencyText'
import type { SheetProps } from '@app/components/Sheet'
import Sheet from '@app/components/Sheet'
import Tips from '@app/components/Tips'
import type { CurrencyRatePayload } from '@app/hooks/useRoomCurrencyRate'
import useRoomCurrencyRate from '@app/hooks/useRoomCurrencyRate'
import { roomLocalStorageDescriptor } from '@app/hooks/useRoomLocalStorage'
import useUser from '@app/hooks/useUser'
import { userRoomsLocalStorageDescriptor } from '@app/hooks/useUserRooms'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import cc from 'currency-codes'
import CurrencyRateSheet from './CurrencyRateSheet'
import usePresent from '@app/hooks/usePresent'
import Clickable from '@app/components/Clickable'
import rpc from '@app/util/rpc'

interface Props extends SheetProps {
  roomId: string
}

export default function SettingsSheet({ roomId, ...sheet }: Props) {
  const [user] = useUser()
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  const handleRemove = async () => {
    if (!confirm('旅の記録を削除します。よろしいですか？')) {
      return
    }
    setBusy(true)
    try {
      await rpc.api.room.remove.$post({ json: { roomId } })
      roomLocalStorageDescriptor(roomId).set(undefined)
      if (user) {
        const desc = userRoomsLocalStorageDescriptor(user.id)
        desc.set(desc.get()?.filter((v) => v.id !== roomId))
      }
      sheet.onPresent(false)
      navigate('/')
    } finally {
      setBusy(false)
    }
  }

  const [currencyRate] = useRoomCurrencyRate(roomId)

  return (
    <Sheet {...sheet}>
      <div className="grid gap-4">
        <div className="font-bold">旅の記録</div>
        <Tips type="warning">すべての記録を削除します。参加しているメンバーは記録を参照できなくなります。</Tips>
        <Button variant="danger" loading={busy} onClick={handleRemove}>
          削除
        </Button>
        {currencyRate && currencyRate.length > 0 && (
          <>
            <div className="font-bold">通貨レート</div>
            <div className="grid gap-2">
              {currencyRate?.map((v) => (
                <CurrencyRateItem key={`${v.currency}_${v.toCurrency}`} {...v} roomId={roomId}></CurrencyRateItem>
              ))}
            </div>
          </>
        )}
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
