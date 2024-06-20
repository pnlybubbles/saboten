import type { SheetProps } from '@app/components/Sheet'
import Sheet from '@app/components/Sheet'

type Props = SheetProps

export default function Remburse({ ...sheet }: Props) {
  return <Sheet {...sheet}>精算</Sheet>
}
