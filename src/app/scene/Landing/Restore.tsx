import Button from '@app/components/Button'
import RestoreFromSecretForm from '@app/components/RestoreFromSecretForm'
import Divider from '@app/components/Divider'

interface Props {
  onBack: () => void
}

export default function Restore({ onBack }: Props) {
  return (
    <div className="mx-auto grid max-w-(--breakpoint-sm) gap-4 p-8">
      <div className="font-bold">合言葉を入力してユーザーを復元します</div>
      <RestoreFromSecretForm submitLabel="復元" submitVariant="primary" />
      <Divider></Divider>
      <Button onClick={onBack}>戻る</Button>
    </div>
  )
}
