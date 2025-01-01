import Button from '@app/components/Button'
import type { SheetProps } from '@app/components/Sheet'
import Sheet from '@app/components/Sheet'
import Tips from '@app/components/Tips'
import useRoomArchived from '@app/hooks/useRoomArchive'
import useUserRooms from '@app/hooks/useUserRooms'
import * as Icon from 'lucide-react'

interface Props extends SheetProps {
  roomId: string
}

export default function ArchiveSheet({ roomId, ...sheet }: Props) {
  const [archived, setArchived] = useRoomArchived(roomId)
  const [, { revalidate }] = useUserRooms()

  return (
    <Sheet {...sheet}>
      <div className="grid gap-4">
        <div className="font-bold">記録をアーカイブ</div>
        <Tips type={Icon.FlagTriangleRight}>
          {archived
            ? 'アーカイブを解除すると記録の編集ができるようになります。'
            : '完了済みとしてマークします。アーカイブを解除するまで記録の編集がロックされます。'}
        </Tips>
        <Button
          onClick={async () => {
            await setArchived(!archived)
            // TODO: 独立したステートになっているので、再取得してOUと整合を取る
            void revalidate()
          }}
        >
          {archived ? 'アーカイブ解除' : 'アーカイブ'}
        </Button>
      </div>
    </Sheet>
  )
}
