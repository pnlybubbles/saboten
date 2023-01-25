import Button from '@/components/Button'
import type { SheetProps } from '@/components/Sheet'
import Sheet from '@/components/Sheet'
import TextField from '@/components/TextField'
import Tips from '@/components/Tips'
import useDirty from '@/hooks/useDirty'
import useUser from '@/hooks/useUser'
import { useCallback, useState } from 'react'

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
    sheet.onPresent(false)
  }

  return (
    <Sheet {...sheet}>
      <div className="grid gap-4">
        {user?.compressedId && (
          <div className="grid gap-2">
            <div className="text-xs font-bold text-zinc-400">合言葉</div>
            <div className="select-auto tracking-wider">{user.compressedId}</div>
            <Tips className="text-zinc-400">
              合言葉を使うことでユーザーの記録を復元することができます。この画面をスクリーンショットして合言葉を保存しておきましょう
            </Tips>
          </div>
        )}
        <TextField label="ニックネーム" name="name" value={name} onChange={dirty(setName)}></TextField>
        <Button onClick={handleSubmit}>変更</Button>
      </div>
    </Sheet>
  )
}
