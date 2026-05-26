import type { PropsWithChildren } from 'react'
import { Drawer } from '@base-ui/react/drawer'

export type SheetProps = {
  isPresent: boolean
  onPresent: (value: boolean) => void
}

export default function Sheet({ isPresent, onPresent, children }: PropsWithChildren<SheetProps>) {
  return (
    <Drawer.Root open={isPresent} onOpenChange={(open) => onPresent(open)} swipeDirection="down">
      <Drawer.Portal>
        <Drawer.Backdrop forceRender className="sheet-backdrop" />
        <Drawer.Viewport className="sheet-viewport">
          <Drawer.Popup aria-label="シート" className="sheet-popup">
            <div className="pointer-events-none absolute z-1 h-[44px] w-full overflow-hidden rounded-t-[44px]">
              <div className="bg-linear-to-b from-white via-white to-transparent py-4">
                <div className="mx-auto -mb-2 h-2 w-12 shrink-0 -translate-y-1/2 rounded-full bg-zinc-200" />
              </div>
            </div>
            <Drawer.Content className="sheet-content mt-4 self-stretch overflow-scroll px-8 pt-4 pb-8">
              <Drawer.Title className="sr-only">シート</Drawer.Title>
              {children}
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
