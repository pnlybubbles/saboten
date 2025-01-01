import Popover from '@app/components/Popover'
import * as Icon from 'lucide-react'
import clsx from 'clsx'
import usePresent from '@app/hooks/usePresent'
import SettingsSheet from './SettingsSheet'
import ArchiveSheet from './ArchiveSheet'
import useRoomCurrencyRate from '@app/hooks/useRoomCurrencyRate'
import CurrencyRateListSheet from './CurrencyRateListSheet'

interface Props {
  roomId: string | null
}

export default function ActionMenu({ roomId }: Props) {
  const handleShare = async () => {
    const url = location.href
    const text = `旅のお金を記録してかんたんに精算 - SABOTEN`
    if (typeof navigator.share !== 'undefined') {
      await navigator.share({ url, text })
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  const [currencyRate] = useRoomCurrencyRate(roomId)

  const deleteSheet = usePresent()
  const archiveSheet = usePresent()
  const currencyRateSheet = usePresent()

  return (
    <>
      <Popover
        className={clsx(
          'transition-[margin,opacity,transform]',
          roomId ? 'ml-3 scale-100 opacity-100' : 'pointer-events-none -ml-12 scale-50 opacity-0',
        )}
        icon={<Icon.Donut size={20} />}
        align="right"
        menu={[
          { label: '招待リンク', icon: <Icon.Share size={16} />, action: () => void handleShare() },
          ...(currencyRate && currencyRate.length > 0
            ? [{ label: '通貨レート', icon: <Icon.CircleDollarSign size={16} />, action: currencyRateSheet.open }]
            : []),
          { label: 'アーカイブ', icon: <Icon.FlagTriangleRight size={16} />, action: archiveSheet.open },
          { label: '削除', icon: <Icon.Trash2 size={16} />, action: deleteSheet.open },
        ]}
      />
      {roomId && <SettingsSheet roomId={roomId} {...deleteSheet}></SettingsSheet>}
      {roomId && <ArchiveSheet roomId={roomId} {...archiveSheet}></ArchiveSheet>}
      {roomId && <CurrencyRateListSheet roomId={roomId} {...currencyRateSheet}></CurrencyRateListSheet>}
    </>
  )
}
