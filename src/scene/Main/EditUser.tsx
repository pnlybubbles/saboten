import Button from '@/components/Button'
import type { SheetProps } from '@/components/Sheet'
import Sheet from '@/components/Sheet'
import TextField from '@/components/TextField'
import useDirty from '@/hooks/useDirty'
import useUser from '@/hooks/useUser'
import { useCallback, useState } from 'react'

interface Props extends SheetProps {
  defaultValue: string
}

export default function EditUser({ defaultValue, ...sheet }: Props) {
  const [name, setName] = useState(defaultValue)
  const [, setUser] = useUser()

  const { dirty, clearDirty } = useDirty(
    useCallback(() => {
      if (!sheet.isPresent) {
        return
      }
      setName(defaultValue)
    }, [defaultValue, sheet.isPresent]),
  )

  const handleSubmit = () => {
    void setUser({ name })
    clearDirty()
    sheet.onPresent(false)
  }

  return (
    <Sheet {...sheet}>
      <div className="grid gap-4">
        <TextField label="ニックネーム" name="name" value={name} onChange={dirty(setName)}></TextField>
        <Button onClick={handleSubmit}>変更</Button>
      </div>
    </Sheet>
  )
}
