import { format, isSameYear } from 'date-fns'

export default function formatDate(date: Date) {
  return isSameYear(date, new Date()) ? format(date, 'M/dd H:mm') : format(date, 'yyyy/MM/dd H:mm')
}
