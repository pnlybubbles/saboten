import Popover from '@app/components/Popover'
import * as Icon from 'lucide-react'
import clsx from 'clsx'
import usePresent from '@app/hooks/usePresent'
import DeleteSheet from './DeleteSheet'
import ArchiveSheet from './ArchiveSheet'
import CurrencySettingSheet from './CurrencySettingSheet'
import useRoomArchived from '@app/hooks/useRoomArchive'
import useEvents, { deriveUsedCurrency } from '@app/hooks/useEvents'
import { useMemo } from 'react'

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

  const [events] = useEvents(roomId)
  const usedCurrency = useMemo(() => deriveUsedCurrency(events ?? []), [events])
  const [archived] = useRoomArchived(roomId)

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
          ...(usedCurrency.length > 1
            ? [{ label: '通貨レート', icon: <Icon.CircleDollarSign size={16} />, action: currencyRateSheet.open }]
            : []),
          {
            label: archived ? 'アーカイブ解除' : 'アーカイブ',
            icon: <Icon.FlagTriangleRight size={16} />,
            action: archiveSheet.open,
          },
          { label: '削除', icon: <Icon.Trash2 size={16} />, destructive: true, action: deleteSheet.open },
        ]}
      />
      {roomId && <DeleteSheet roomId={roomId} {...deleteSheet}></DeleteSheet>}
      {roomId && <ArchiveSheet roomId={roomId} {...archiveSheet}></ArchiveSheet>}
      {roomId && <CurrencySettingSheet roomId={roomId} {...currencyRateSheet}></CurrencySettingSheet>}
    </>
  )
}
