import Button from '@/components/Button'
import CompressedUserIdForm from '@/components/CompressedUserIdForm'
import Divider from '@/components/Divider'

interface Props {
  onBack: () => void
}

export default function Restore({ onBack }: Props) {
  return (
    <div className="grid gap-4 p-8">
      <div className="font-bold">合言葉を入力してユーザーを復元します</div>
      <CompressedUserIdForm submitLabel="復元" submitVariant="primary" />
      <Divider></Divider>
      <Button onClick={onBack}>戻る</Button>
    </div>
  )
}
