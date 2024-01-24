import Button from '@/components/Button'
import CompressedUserIdForm from '@/components/CompressedUserIdForm'
import type { SheetProps } from '@/components/Sheet'
import Sheet from '@/components/Sheet'
import TextField from '@/components/TextField'
import Tips from '@/components/Tips'
import useDirty from '@/hooks/useDirty'
import usePresent from '@/hooks/usePresent'
import useUser from '@/hooks/useUser'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function EditUser({ ...sheet }: SheetProps) {
  const [user, { setUser }] = useUser()
  const [name, setName] = useState(user?.name ?? '')

  const { dirty, clearDirty } = useDirty(
    useCallback(() => {
      if (!sheet.isPresent) {
        return
      }
      setName(user?.name ?? '')
    }, [sheet.isPresent, user?.name]),
  )

  const handleSubmit = () => {
    clearDirty()
    void setUser({ name })
  }

  const secretSheet = usePresent()

  return (
    <Sheet {...sheet}>
      <div className="grid gap-4">
        {user?.compressedId && (
          <div className="grid gap-2">
            <div className="text-xs font-bold text-zinc-400">合言葉</div>
            <div className="select-auto tracking-wider">{user.compressedId}</div>
            <Tips className="text-zinc-400">
              合言葉を使うことでユーザーの記録を復元することができます。この画面をスクリーンショットして合言葉を保存しておきましょう。
            </Tips>
          </div>
        )}
        <Button onClick={secretSheet.open}>ユーザー切り替え・削除</Button>
        <UserResetSheet {...secretSheet}></UserResetSheet>
        <TextField
          label="ニックネーム"
          name="name"
          value={name}
          onChange={dirty(setName)}
          onBlur={handleSubmit}
        ></TextField>
      </div>
    </Sheet>
  )
}

function UserResetSheet({ ...sheet }: SheetProps) {
  const [, { removeUser }] = useUser()
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  const leave = async () => {
    if (!confirm('ユーザーを削除します。よろしいですか？')) {
      return
    }
    setBusy(true)
    try {
      await removeUser()
      navigate('/')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet {...sheet}>
      <div className="grid gap-4">
        <div className="font-bold">ユーザー削除</div>
        <Tips type="warning">
          すべてのユーザーに関連するデータが削除されます。旅の記録は参加済みのメンバーが一人でもいる限り残りますが、作成されたイベントは匿名化されます。
        </Tips>
        <Button variant="danger" onClick={leave} loading={busy}>
          削除
        </Button>
        <div className="font-bold">ユーザー切り替え</div>
        <Tips type="warning">
          ユーザーを切り替えた後に、もとのユーザーに戻す場合には合言葉が必要です。合言葉を忘れてしまった場合は復元することはできません。
        </Tips>
        <CompressedUserIdForm submitLabel="切り替え" submitVariant="danger" onRestore={() => sheet.onPresent(false)} />
      </div>
    </Sheet>
  )
}
