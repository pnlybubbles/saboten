import { useEffect, useState } from 'react'
import Start from './Start'
import Join from './Join'
import Create from './Create'
import Restore from './Restore'
import unreachable from '@app/util/unreachable'
import { useLocation } from 'react-router-dom'

interface Props {
  roomId: string | null
}

export default function Landing({ roomId }: Props) {
  const [stage, setStage] = useState<'start' | 'create' | 'restore'>('start')
  const location = useLocation()

  useEffect(() => {
    setStage('start')
  }, [location.pathname])

  return stage === 'start' ? (
    <Start roomId={roomId} onProceed={setStage} />
  ) : stage === 'create' ? (
    roomId ? (
      <Join roomId={roomId} />
    ) : (
      <Create onBack={() => setStage('start')} />
    )
  ) : stage === 'restore' ? (
    <Restore onBack={() => setStage('start')} />
  ) : (
    unreachable(stage)
  )
}
