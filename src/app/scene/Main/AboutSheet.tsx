import type { SheetProps } from '@app/components/Sheet'
import Sheet from '@app/components/Sheet'
import * as Icon from 'lucide-react'

export default function AboutSheet({ ...present }: SheetProps) {
  return (
    <Sheet {...present}>
      <div className="grid gap-4">
        <div className="font-bold">SABOTEN</div>
        <div className="grid justify-items-start gap-2 text-xs">
          <div className="text-xs">
            バグ報告、フィードバック、困ったことなどありましたら管理者のSNSまでお願いします。
          </div>
          <a
            target="_blank"
            href="https://instagram.com/pnly"
            className="grid grid-flow-col items-center justify-start gap-2"
            rel="noreferrer"
          >
            <Icon.Instagram size={16}></Icon.Instagram>
            <span>instagram.com/pnly</span>
          </a>
          <a
            target="_blank"
            href="https://x.com/pnly_tar"
            className="grid grid-flow-col items-center justify-start gap-2"
            rel="noreferrer"
          >
            <Icon.Twitter size={16}></Icon.Twitter>
            <span>x.com/pnly_tar</span>
          </a>
        </div>
        <div className="grid justify-items-start gap-2 text-xs">
          <div className="text-xs">このプロジェクトはオープンソースとして公開しています。</div>
          <a
            target="_blank"
            href="https://github.com/pnlybubbles/saboten"
            className="grid grid-flow-col items-center justify-start gap-2"
            rel="noreferrer"
          >
            <Icon.Github size={16}></Icon.Github>
            <span>github.com/pnlybubbles/saboten</span>
          </a>
        </div>
      </div>
    </Sheet>
  )
}
