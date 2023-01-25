import Button from '@/components/Button'
import Divider from '@/components/Divider'
import TextField from '@/components/TextField'
import Tips from '@/components/Tips'
import useUser from '@/hooks/useUser'
import { COMPRESSED_USER_ID_SCHEMA } from '@shared/utils/schema'
import { useState } from 'react'

interface Props {
  onBack: () => void
}

export default function Restore({ onBack }: Props) {
  const [compressedUserId, setCompressedUserId] = useState('')
  const [, { restoreUser }] = useUser()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  const restore = async () => {
    setBusy(true)
    try {
      const fetched = await restoreUser(compressedUserId)
      if (fetched === null) {
        setError(true)
      } else {
        setError(false)
      }
    } finally {
      setBusy(false)
    }
  }

  const [isDirty, setIsDirty] = useState(false)
  const validation = COMPRESSED_USER_ID_SCHEMA.safeParse(compressedUserId)

  return (
    <div className="grid gap-4 p-8">
      <div className="font-bold">合言葉を入力してユーザーを復元します</div>
      <Tips className="text-zinc-400">
        {`22桁の文字列を入力してください。スクリーンショットで保存されている場合は、画像内の文字列を長押ししてコピーできる場合があります。`}
      </Tips>
      <div className="grid gap-2">
        <TextField
          label="合言葉"
          name="secret"
          value={compressedUserId}
          onChange={setCompressedUserId}
          onBlur={() => setIsDirty(true)}
        />
        <div className="grid">
          {!validation.success &&
            isDirty &&
            validation.error.issues.map((issue) => (
              <div key={issue.code} className="text-xs font-bold text-red-500">
                {issue.message}
              </div>
            ))}
          {error && (
            <div className="text-xs text-red-500">{`合言葉が間違っています。誤入力が無いか確認してください。`}</div>
          )}
        </div>
      </div>
      <Button onClick={restore} loading={busy} disabled={!validation.success} variant="primary">
        復元する
      </Button>
      <Divider></Divider>
      <Button onClick={onBack}>戻る</Button>
    </div>
  )
}
