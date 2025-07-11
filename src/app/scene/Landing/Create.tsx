import Button from '@app/components/Button'
import Divider from '@app/components/Divider'
import TextField from '@app/components/TextField'
import Tips from '@app/components/Tips'
import useUser from '@app/hooks/useUser'
import { useState } from 'react'

interface Props {
  onBack: () => void
}

export default function Create({ onBack }: Props) {
  const [name, setName] = useState('')
  const [, { setUser }] = useUser()
  const [busy, setBusy] = useState(false)

  const create = async () => {
    setBusy(true)
    try {
      await setUser({ name })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-(--breakpoint-sm) gap-6 p-8">
      <div className="grid gap-2">
        <div className="font-bold">自分のニックネームを設定します</div>
        <Tips type="warning">個人情報は入力しないでください</Tips>
      </div>
      <TextField label="ニックネーム" name="name" value={name} onChange={setName} disabled={busy} />
      <Button onClick={create} loading={busy} variant="primary">
        記録をはじめる
      </Button>
      <Divider />
      <Button onClick={onBack}>戻る</Button>
    </div>
  )
}
