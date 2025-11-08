import Button from '@app/components/Button'
import RestoreFromSecretForm from '@app/components/RestoreFromSecretForm'
import type { SheetProps } from '@app/components/Sheet'
import Sheet from '@app/components/Sheet'
import TextField from '@app/components/TextField'
import Tips from '@app/components/Tips'
import useDirty from '@app/hooks/useDirty'
import usePresent from '@app/hooks/usePresent'
import useUser from '@app/hooks/useUser'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Icon from 'lucide-react'

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
        {user?.secret && (
          <div className="grid gap-2">
            <div className="text-xs font-bold text-zinc-400">ログインキーワード</div>
            <div className="tracking-wider select-auto">{user.secret}</div>
            <Tips type={Icon.KeyRound}>
              ログインキーワードを使うことで支払いの記録を復元することができます。この画面をスクリーンショットしてログインキーワードを保存しておきましょう。
            </Tips>
          </div>
        )}
        <Button onClick={secretSheet.open}>ログイン・ユーザー管理</Button>
        <UserResetSheet {...secretSheet} />
        <TextField label="ニックネーム" name="name" value={name} onChange={dirty(setName)} onBlur={handleSubmit} />
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
      void navigate('/')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet {...sheet}>
      <div className="grid gap-4">
        <div className="font-bold">ユーザー削除</div>
        <Tips type="warning">
          すべてのユーザーに関連するデータが削除されます。記録は参加済みのメンバーが一人でもいる限り残り続けますが、ユーザーとの関連付けが解消されて匿名になります。
        </Tips>
        <Button variant="danger" onClick={leave} loading={busy}>
          削除
        </Button>
        <div className="font-bold">ユーザーにログイン</div>
        <Tips type="warning">
          他のユーザーにログインした後、現在のユーザーに再びログインするにはログインキーワードが必要になります。ログインキーワードを忘れてしまった場合は復元することはできません。
        </Tips>
        <RestoreFromSecretForm submitLabel="ログイン" submitVariant="danger" onRestore={() => sheet.onPresent(false)} />
      </div>
    </Sheet>
  )
}
