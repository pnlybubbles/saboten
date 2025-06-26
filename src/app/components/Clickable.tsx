import isSP from '@app/util/isSP'
import noop from '@app/util/noop'
import type React from 'react'
import { forwardRef } from 'react'

export type Props = Pick<React.ComponentPropsWithoutRef<'button'>, 'disabled' | 'className' | 'children'> &
  React.AriaAttributes & {
    onClick?: React.EventHandler<React.SyntheticEvent<unknown>>
    div?: boolean
    onTouchStart?: React.TouchEventHandler<HTMLElement>
    onTouchEnd?: React.TouchEventHandler<HTMLElement>
    onTouchMove?: React.TouchEventHandler<HTMLElement>
  }

export type HTMLClickableElement = HTMLButtonElement & HTMLDivElement

export default forwardRef<HTMLClickableElement, Props>(function Clickable({ onClick, disabled, div, ...rest }, ref) {
  const props = {
    ...(isSP && { onTouchEnd: noop }),
    ...rest,
    disabled,
    ...(!disabled && { onClick }),
  }
  return div ? <div {...props} ref={ref} /> : <button type="button" {...props} ref={ref} />
})
