import usePresent from '@app/hooks/usePresent'
import Sheet from './Sheet'
import Clickable from './Clickable'
import cc from 'currency-codes'
import * as Icon from 'lucide-react'
import useEvents, { deriveUsedCurrency } from '@app/hooks/useEvents'
import { useMemo } from 'react'
import isUnique from '@app/util/isUnique'

type Props = React.PropsWithChildren<{
  roomId: string | null
  value: string | null
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
}>

const FREQUENTLY_USED_CURRENCY_CODES = ['JPY', 'USD', 'EUR']

export default function CurrencyPicker({ roomId, value, onChange, className, disabled, children }: Props) {
  const sheet = usePresent()

  const [events] = useEvents(roomId)
  const recentlyUsedCurrency = useMemo(() => deriveUsedCurrency(events ?? []), [events])

  const handleSelectCurrency = (code: string) => {
    if (value !== code) {
      onChange(code)
    }
    sheet.close()
  }

  return (
    <>
      <Clickable onClick={sheet.open} aria-expanded={sheet.isPresent} className={className} disabled={disabled}>
        {children}
      </Clickable>
      <Sheet {...sheet}>
        <div className="grid gap-2">
          <div className="text-xs font-bold">よく使う</div>
          <div className="grid grid-cols-[auto_auto_1fr] items-stretch">
            {[...recentlyUsedCurrency, ...FREQUENTLY_USED_CURRENCY_CODES].filter(isUnique).map((code) => (
              <EditCurrencyItem
                key={code}
                code={code}
                onClick={() => handleSelectCurrency(code)}
                active={value === code}
              />
            ))}
          </div>
          <div className="text-xs font-bold">すべて</div>
          <div className="grid grid-cols-[auto_auto_1fr] items-stretch">
            {cc.codes().map((code) => (
              <EditCurrencyItem
                key={code}
                code={code}
                onClick={() => handleSelectCurrency(code)}
                active={value === code}
              />
            ))}
          </div>
        </div>
      </Sheet>
    </>
  )
}

function EditCurrencyItem({ code, onClick, active }: { code: string; onClick: () => void; active: boolean }) {
  return (
    <>
      <div className="grid items-center pr-2">
        <Icon.Check size={20} className={active ? 'opacity-100' : 'opacity-0'} />
      </div>
      <Clickable className="grid items-center text-left" onClick={onClick}>
        <div>{code}</div>
      </Clickable>
      <Clickable className="py-1 pl-2 text-left text-zinc-400" onClick={onClick}>
        {cc.code(code)?.currency}
      </Clickable>
    </>
  )
}
