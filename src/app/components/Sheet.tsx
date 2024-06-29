import { createContext, useContext, type PropsWithChildren } from 'react'
import { Drawer } from 'vaul'

export type SheetProps = {
  isPresent: boolean
  onPresent: (value: boolean) => void
}

const NestedContext = createContext({ nested: false })

export default function Sheet({ isPresent, onPresent, children }: PropsWithChildren<SheetProps>) {
  const { nested } = useContext(NestedContext)

  const inner = (
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 bg-black/40" />
      <Drawer.Content className="fixed inset-x-0 bottom-0 mx-auto flex max-h-[96%] w-full max-w-screen-sm flex-col rounded-t-[44px] bg-white text-main">
        <div className="pointer-events-none absolute z-[1] h-[44px] w-full overflow-hidden rounded-t-[44px]">
          <div className="bg-gradient-to-b from-white via-white to-transparent py-4">
            <div className="mx-auto -mb-2 h-2 w-12 shrink-0 -translate-y-1/2 rounded-full bg-zinc-200" />
          </div>
        </div>
        <div className="mt-4 self-stretch overflow-scroll px-8 pb-8 pt-4">{children}</div>
      </Drawer.Content>
    </Drawer.Portal>
  )

  return nested ? (
    <Drawer.NestedRoot open={isPresent} onOpenChange={onPresent} shouldScaleBackground>
      <NestedContext.Provider value={{ nested: true }}>{inner}</NestedContext.Provider>
    </Drawer.NestedRoot>
  ) : (
    <Drawer.Root open={isPresent} onOpenChange={onPresent} shouldScaleBackground>
      <NestedContext.Provider value={{ nested: true }}>{inner}</NestedContext.Provider>
    </Drawer.Root>
  )
}
