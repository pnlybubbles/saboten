import { useState } from 'react'
import TextField from './TextField'
import Tips from './Tips'
import COMPRESSED_UUID_SCHEMA from '@util/COMPRESSED_UUID_SCHEMA'
import type { Variant } from './Button'
import Button from './Button'
import useUser from '@app/hooks/useUser'

export default function RestoreFromSecretForm({
  submitLabel,
  submitVariant,
  onRestore,
}: {
  submitLabel: string
  submitVariant?: Variant
  onRestore?: () => void
}) {
  const [, { restoreUser }] = useUser()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  const [secret, setSecret] = useState('')
  const [isDirty, setIsDirty] = useState(false)

  const validation = COMPRESSED_UUID_SCHEMA.safeParse(secret)

  const restore = async () => {
    setBusy(true)
    try {
      const fetched = await restoreUser(secret)
      if (fetched === null) {
        setError(true)
      } else {
        setError(false)
        onRestore?.()
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-4">
      <Tips>
        {`22桁の文字列を入力してください。スクリーンショットで保存されている場合は、画像内の文字列を長押ししてコピーできる場合があります。`}
      </Tips>
      <div className="grid gap-2">
        <TextField
          label="合言葉"
          name="secret"
          value={secret}
          onChange={setSecret}
          onBlur={() => setIsDirty(true)}
          disabled={busy}
        />
        <div className="grid">
          {!validation.success &&
            isDirty &&
            validation.error.issues.map((issue) => (
              <div key={issue.code} className="text-xs font-bold text-error">
                {issue.message}
              </div>
            ))}
          {error && (
            <div className="text-xs text-error">{`合言葉が間違っています。文字が間違っていないか確認してください。`}</div>
          )}
        </div>
      </div>
      <Button
        onClick={restore}
        loading={busy}
        disabled={!validation.success}
        {...(submitVariant && { variant: submitVariant })}
      >
        {submitLabel}
      </Button>
    </div>
  )
}
