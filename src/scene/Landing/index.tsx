import { useState } from 'react'
import Start from './Start'
import Join from './Join'
import Create from './Create'
import Restore from './Restore'
import unreachable from '@/utils/basic/unreachable'

interface Props {
  roomId: string | null
}

export default function Landing({ roomId }: Props) {
  const [stage, setStage] = useState<'start' | 'create' | 'restore'>('start')

  return stage === 'start' ? (
    <Start roomId={roomId} onProceed={setStage}></Start>
  ) : stage === 'create' ? (
    roomId ? (
      <Join roomId={roomId} />
    ) : (
      <Create />
    )
  ) : stage === 'restore' ? (
    <Restore onBack={() => setStage('start')} />
  ) : (
    unreachable(stage)
  )
}
