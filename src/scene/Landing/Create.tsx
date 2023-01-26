import Button from '@/components/Button'
import TextField from '@/components/TextField'
import Tips from '@/components/Tips'
import useUser from '@/hooks/useUser'
import { useState } from 'react'

export default function Create() {
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
    <div className="grid gap-6 p-8">
      <div className="grid gap-2">
        <div className="font-bold">自分のニックネームを設定します</div>
        <Tips type="warning">個人情報は入力しないでください</Tips>
      </div>
      <TextField label="ニックネーム" name="name" value={name} onChange={setName} disabled={busy} />
      <Button onClick={create} loading={busy}>
        旅をはじめる
      </Button>
    </div>
  )
}
