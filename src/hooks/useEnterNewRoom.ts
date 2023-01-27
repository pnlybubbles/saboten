import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useUserRooms from './useUserRooms'

export default function useEnterNewRoom() {
  const navigate = useNavigate()
  // TODO: あまりこのhooksの責務感はない...
  const [, { revalidate }] = useUserRooms()

  return useCallback(
    (roomId: string) => {
      navigate(`/${roomId}`)
      void revalidate()
    },
    [navigate, revalidate],
  )
}
