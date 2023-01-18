import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export default function useEnterNewRoom() {
  const navigate = useNavigate()

  return useCallback(
    (roomId: string) => {
      navigate(`/${roomId}`)
    },
    [navigate],
  )
}
