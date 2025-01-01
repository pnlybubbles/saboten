import usePresent from '@app/hooks/usePresent'
import clsx from 'clsx'
import Button from './Button'
import { createRef, useEffect, useRef, useState } from 'react'
import type { HTMLClickableElement } from './Clickable'
import Clickable from './Clickable'

type Props = React.PropsWithChildren<{
  menu: { label: string; icon?: React.ReactNode; action: () => void; destructive?: boolean }[]
  align?: 'left' | 'right'
  icon?: React.ReactNode
  className?: string
}>

export default function Popover({ menu, align = 'left', className, icon, children }: Props) {
  const { isPresent, onPresent, close, open } = usePresent()

  const longPressToOpen = useRef<ReturnType<typeof setTimeout> | undefined>()
  const [longPressState, setLongPressState] = useState(false)

  const refs = useRef<React.RefObject<HTMLClickableElement>[]>(menu.map(() => createRef<HTMLClickableElement>()))

  useEffect(() => {
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [close])

  const pressToOpen = () => {
    open()
    setLongPressState(true)
  }

  const [highlighted, setHighlighted] = useState<number | null>(null)

  const ref = useRef<HTMLClickableElement>(null)

  useEffect(() => {
    const target = ref.current
    if (!target) return
    const handler = (e: TouchEvent) => e.preventDefault()
    target.addEventListener('touchmove', handler, { passive: false })
    return () => target.removeEventListener('touchmove', handler)
  }, [])

  return (
    <div className={clsx('relative', className)} onClick={(e) => e.nativeEvent.stopPropagation()}>
      <Button
        ref={ref}
        icon={icon}
        className={clsx(longPressState && 'scale-90')}
        onClick={() => onPresent((v) => !v)}
        onTouchMove={(e) => {
          const touch = e.touches[0]
          const bounding = e.currentTarget.getBoundingClientRect()
          if (!touch) return
          if (!inside({ x: touch.pageX, y: touch.pageY }, scrollOffset(bounding))) {
            clearTimeout(longPressToOpen.current)
          }
          if (touch.pageY > bounding.bottom && touch.pageX > bounding.left && touch.pageX < bounding.right) {
            pressToOpen()
          }
          if (!longPressState) return
          for (const ref of refs.current) {
            if (!ref.current) continue
            const menuBounding = ref.current.getBoundingClientRect()
            if (inside({ x: touch.pageX, y: touch.pageY }, scrollOffset(menuBounding))) {
              setHighlighted(refs.current.indexOf(ref))
              return
            }
          }
          setHighlighted(null)
        }}
        onTouchStart={() => {
          longPressToOpen.current = setTimeout(pressToOpen, 500)
        }}
        onTouchEnd={() => {
          clearTimeout(longPressToOpen.current)
          if (longPressState) {
            close()
            setLongPressState(false)
            if (highlighted === null) return
            menu[highlighted]?.action()
            setHighlighted(null)
          }
        }}
      >
        {children}
      </Button>
      <div
        className={clsx(
          'absolute top-[90%] grid overflow-hidden rounded-xl bg-white shadow-float transition',
          align === 'left' ? 'left-[-10%] origin-top-left' : 'right-[-10%] origin-top-right',
          isPresent ? 'scale-100 opacity-100' : 'pointer-events-none scale-75 opacity-0',
        )}
      >
        {menu.map(({ label, action, icon, destructive }, i) => (
          <Clickable
            onClick={() => {
              close()
              action()
            }}
            key={label}
            ref={refs.current[i]}
            className={clsx(
              'grid grid-cols-[1fr_auto] items-center gap-6 whitespace-nowrap border-b px-4 py-3 text-start text-sm transition last:border-none active:bg-zinc-100',
              i === highlighted && 'bg-zinc-100',
              destructive && 'text-error',
            )}
          >
            <div>{label}</div>
            {icon}
          </Clickable>
        ))}
      </div>
    </div>
  )
}

function inside(point: { x: number; y: number }, rect: DOMRect) {
  return point.y > rect.top && point.y < rect.bottom && point.x > rect.left && point.x < rect.right
}

function scrollOffset(rect: DOMRect): DOMRect {
  return {
    ...rect,
    top: window.scrollY + rect.top,
    bottom: window.scrollY + rect.bottom,
    left: window.scrollX + rect.left,
    right: window.scrollX + rect.right,
    x: window.scrollX + rect.x,
    y: window.scrollY + rect.y,
  }
}
