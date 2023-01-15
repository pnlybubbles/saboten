import { createLocalStorageDescriptor } from '@/utils/localstorage'
import { z } from 'zod'
import { useLocalStorage } from './useLocalStorage'

const USER_STORAGE_DESCRIPTOR = createLocalStorageDescriptor(
  'user_id',
  z.object({
    id: z.string(),
    name: z.string(),
  }),
)

export default function useUser() {
  return useLocalStorage(USER_STORAGE_DESCRIPTOR)
}
