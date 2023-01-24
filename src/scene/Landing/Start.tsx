import Button from '@/components/Button'
import Icon from '@/components/Icon'
import useRoomTitle from '@/hooks/useRoomTitle'
import { useNavigate } from 'react-router-dom'

interface Props {
  roomId: string | null
  onProceed: (type: 'create' | 'restore') => void
}

export default function Start({ roomId, onProceed }: Props) {
  const [roomTitle] = useRoomTitle(roomId)
  const navigate = useNavigate()

  return (
    <div className="grid gap-6 p-8">
      <div className="text-2xl font-bold text-primary">SABOTEN</div>
      <div>
        <div>シンプルな割り勘アプリ</div>
        <div>旅のお金を記録してかんたんに精算</div>
      </div>
      {roomId !== null && (
        <div className="grid grid-cols-[auto_1fr] items-center gap-1 rounded-lg bg-secondary p-4 text-xs font-bold text-primary">
          <Icon name="group"></Icon>
          <div>{`"${roomTitle ?? '読込中...'}" に招待されました`}</div>
        </div>
      )}
      <Button onClick={() => onProceed('create')} variant="primary">
        {roomId ? '参加する' : 'はじめる'}
      </Button>
      <div className="grid grid-cols-[auto_1fr] gap-1 text-xs">
        <Icon name="tips_and_updates" />
        <div>以前に利用したことがある場合は合言葉を使って記録を復元できます</div>
      </div>
      <Button onClick={() => onProceed('restore')}>{roomId ? '合言葉を入力して参加する' : '合言葉を入力する'}</Button>
      {roomId !== null && (
        <>
          <div className="border-b border-dashed border-zinc-400"></div>
          <Button onClick={() => navigate('/')}>参加しない</Button>
        </>
      )}
    </div>
  )
}
