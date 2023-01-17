import { useRef } from 'react'
import type { BottomSheetRef } from 'react-spring-bottom-sheet'
import { BottomSheet } from 'react-spring-bottom-sheet'

type Props = {
  isPresent: boolean
  onPresent: (value: boolean) => void
  children: React.ReactNode
}

export default function Sheet({ isPresent, onPresent, children }: Props) {
  const ref = useRef<BottomSheetRef>(null)

  return (
    <BottomSheet open={isPresent} onDismiss={() => onPresent(false)} ref={ref}>
      <div className="px-8 pb-8 pt-4">{children}</div>
    </BottomSheet>
  )
}
