import type { PropsWithChildren } from 'react'
import { useRef } from 'react'
import type { BottomSheetRef } from 'react-spring-bottom-sheet'
import { BottomSheet } from 'react-spring-bottom-sheet'

export type SheetProps = {
  isPresent: boolean
  onPresent: (value: boolean) => void
}

export default function Sheet({ isPresent, onPresent, children }: PropsWithChildren<SheetProps>) {
  const ref = useRef<BottomSheetRef>(null)

  return (
    <BottomSheet open={isPresent} onDismiss={() => onPresent(false)} ref={ref}>
      <div className="px-8 pb-8 pt-4">{children}</div>
    </BottomSheet>
  )
}
