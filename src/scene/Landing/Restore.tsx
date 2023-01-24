import Button from '@/components/Button'
import Icon from '@/components/Icon'
import TextField from '@/components/TextField'

interface Props {
  onBack: () => void
}

export default function Restore({ onBack }: Props) {
  return (
    <div className="grid gap-4 p-8">
      <div className="grid grid-flow-col items-center justify-start gap-1 rounded-lg bg-red-100 p-4 text-xs text-red-900">
        <Icon name="construction"></Icon>
        <div>
          {`Now under construction... `}
          <span className="underline" onClick={onBack}>
            {'< Back'}
          </span>
        </div>
      </div>
      <div className="font-bold">合言葉を入力してユーザー情報を復元します</div>
      <TextField label="合言葉" name="secret" onChange={() => void 0} />
      <Button disabled>復元する</Button>
    </div>
  )
}
