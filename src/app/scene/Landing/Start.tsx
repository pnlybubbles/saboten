import Button from '@app/components/Button'
import Divider from '@app/components/Divider'
import Tips from '@app/components/Tips'
import useRoomTitle from '@app/hooks/useRoomTitle'
import { useNavigate } from 'react-router-dom'
import * as Icon from 'lucide-react'
import usePresent from '@app/hooks/usePresent'
import AboutSheet from '../Main/AboutSheet'
import Logo from '@app/components/Logo'
import ScreenShots from './Screenshots'

interface Props {
  roomId: string | null
  onProceed: (type: 'create' | 'restore') => void
}

export default function Start({ roomId, onProceed }: Props) {
  const [roomTitle] = useRoomTitle(roomId)
  const navigate = useNavigate()
  const aboutSheet = usePresent()

  return (
    <div className="mx-auto grid max-w-screen-sm gap-6 p-8">
      <Logo big />
      <div>
        <div>シンプルな割り勘アプリ</div>
        <div>旅のお金を記録してかんたんに精算</div>
        <div>URLを共有して友達と一緒に書き込めます</div>
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
      <Tips type={Icon.KeyRound}>以前に利用したことがある場合は合言葉を使って記録を復元できます</Tips>
      <Button onClick={() => onProceed('restore')}>{roomId ? '合言葉を入力して参加' : '合言葉を入力'}</Button>
      {roomId !== null && (
        <>
          <Divider />
          <Button onClick={() => navigate('/')}>参加しない</Button>
        </>
      )}
      <Divider aster />
      <ScreenShots></ScreenShots>
      <a className="grid gap-3" href="https://note.com/pnly/n/ne276c3d6dfcc" target="_blank" rel="noreferrer">
        <div className="grid gap-1 text-xs text-zinc-400">
          <div className="font-bold">もっと知りたい</div>
          <div>このアプリを作った想いを綴りました。</div>
        </div>
        <div className="overflow-hidden rounded-xl bg-white shadow-float">
          <img
            src="/assets/note-thumb.webp"
            alt="sabotenを開いているiPhoneの画像"
            className="aspect-[1200/630] object-cover"
          />
          <div className="grid gap-2 p-4">
            <div className="text-sm">N番煎じの割り勘アプリを作った話｜pnly</div>
            <div className="line-clamp-2 text-xs text-zinc-400">
              煎じれば煎じるほど、キリッと苦くて渋い方が美味い。みんなで支払いを記録して割り勘の計算をしてくれるアプリ。できました。旅する人のための、ちょっと便利なアプリです。
            </div>
            <div className="grid grid-flow-col items-center justify-start gap-1 text-xs font-bold text-zinc-400">
              <img src="/assets/note.svg" alt="note icon" className="size-4 rounded-[4px] border border-zinc-200" />
              <div>note.com</div>
            </div>
          </div>
        </div>
      </a>
      <div className="grid justify-center">
        <Button variant="transparent" onClick={aboutSheet.open} icon={<Icon.TrafficCone size={20} />}></Button>
        <AboutSheet {...aboutSheet}></AboutSheet>
      </div>
    </div>
  )
}
