import type { PropsWithChildren } from 'react'
import { Drawer } from 'vaul'

export type SheetProps = {
  isPresent: boolean
  onPresent: (value: boolean) => void
}

export default function Sheet({ isPresent, onPresent, children }: PropsWithChildren<SheetProps>) {
  return (
    <Drawer.NestedRoot open={isPresent} onOpenChange={onPresent} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="text-main fixed inset-x-0 bottom-0 flex max-h-[96%] flex-col rounded-t-[44px] bg-white">
          <div className="mx-auto mt-4 h-2 w-12 shrink-0 rounded-full bg-zinc-200" />
          <div className="max-w-md self-stretch overflow-scroll px-8 pb-8 pt-4">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.NestedRoot>
  )
}
