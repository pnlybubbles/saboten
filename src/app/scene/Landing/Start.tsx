import Button from '@app/components/Button'
import Divider from '@app/components/Divider'
import Tips from '@app/components/Tips'
import useRoomTitle from '@app/hooks/useRoomTitle'
import { useNavigate } from 'react-router-dom'
import * as Icon from 'lucide-react'

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
          <Icon.Users size={20}></Icon.Users>
          <div>{`"${roomTitle ?? '読込中...'}" に招待されました`}</div>
        </div>
      )}
      <Tips>
        ブラウザ内にデータが保存されるため、Safari や Chrome
        などいつも利用しているブラウザではじめることをおすすめします
      </Tips>
      <Button onClick={() => onProceed('create')} variant="primary">
        {roomId ? '参加' : 'はじめる'}
      </Button>
      <Tips>以前に利用したことがある場合は合言葉を使って記録を復元できます</Tips>
      <Button onClick={() => onProceed('restore')}>{roomId ? '合言葉を入力して参加' : '合言葉を入力'}</Button>
      {roomId !== null && (
        <>
          <Divider></Divider>
          <Button onClick={() => navigate('/')}>参加しない</Button>
        </>
      )}
    </div>
  )
}
