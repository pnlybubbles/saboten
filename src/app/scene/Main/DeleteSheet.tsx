import Button from '@app/components/Button'
import type { SheetProps } from '@app/components/Sheet'
import Sheet from '@app/components/Sheet'
import Tips from '@app/components/Tips'
import { roomLocalStorageDescriptor } from '@app/hooks/useRoomLocalStorage'
import useUser from '@app/hooks/useUser'
import { userRoomsLocalStorageDescriptor } from '@app/hooks/useUserRooms'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import rpc from '@app/util/rpc'

interface Props extends SheetProps {
  roomId: string
}

export default function DeleteSheet({ roomId, ...sheet }: Props) {
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

  return (
    <Sheet {...sheet}>
      <div className="grid gap-4">
        <div className="font-bold">記録を削除</div>
        <Tips type="warning">すべての記録を削除します。参加しているメンバーは記録を参照できなくなります。</Tips>
        <Button variant="danger" loading={busy} onClick={handleRemove}>
          削除
        </Button>
      </div>
    </Sheet>
  )
}
