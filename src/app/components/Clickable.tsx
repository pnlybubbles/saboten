import isSP from '@/utils/basic/isSP'
import noop from '@/utils/basic/noop'
import type React from 'react'

export type Props = Pick<React.ComponentPropsWithoutRef<'button'>, 'disabled' | 'className' | 'children'> & {
  onClick?: React.EventHandler<React.SyntheticEvent<unknown>>
  div?: boolean
}

export default function Clickable({ onClick, disabled, div, ...rest }: Props) {
  const props = {
    ...rest,
    disabled,
    ...(!disabled && { onClick }),
    ...(isSP && { onTouchEnd: noop }),
  }
  return div ? <div {...props}></div> : <button {...props}></button>
}
