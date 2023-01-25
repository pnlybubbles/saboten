import Button from '@/components/Button'
import Icon from '@/components/Icon'
import TextField from '@/components/TextField'
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
        <div className="grid grid-cols-[auto_1fr] items-center gap-1 text-xs">
          <Icon name="warning"></Icon>
          <div>個人情報は入力しないでください</div>
        </div>
      </div>
      <TextField label="ニックネーム" name="name" value={name} onChange={setName} disabled={busy} />
      <Button onClick={create} loading={busy}>
        旅をはじめる
      </Button>
    </div>
  )
}
