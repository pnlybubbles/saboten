import Button from '@/components/Button'
import type { SheetProps } from '@/components/Sheet'
import Sheet from '@/components/Sheet'
import Tips from '@/components/Tips'
import { roomLocalStorageDescriptor } from '@/hooks/useRoomLocalStorage'
import useUser from '@/hooks/useUser'
import { userRoomsLocalStorageDescriptor } from '@/hooks/useUserRooms'
import trpc from '@/utils/trpc'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
      await trpc.room.remove.mutate({ roomId })
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

  return (
    <Sheet {...sheet}>
      <div className="grid gap-4">
        <div className="font-bold">旅の記録を削除する</div>
        <Tips type="warning">すべての記録を削除します。参加しているメンバーは記録を参照できなくなります。</Tips>
        <Button variant="danger" loading={busy} onClick={handleRemove}>
          削除する
        </Button>
      </div>
    </Sheet>
  )
}
