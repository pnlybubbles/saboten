import isSP from '@/utils/basic/isSP'
import React from 'react'

export type Props = Pick<React.ComponentPropsWithoutRef<'button'>, 'disabled' | 'className' | 'children'> & {
  onClick?: React.EventHandler<React.SyntheticEvent<unknown>>
  div?: boolean
}

export default function Clickable({ onClick, disabled, div, ...rest }: Props) {
  const props = {
    ...rest,
    ...(!disabled && (isSP ? { onTouchEnd: onClick } : { onClick })),
  }
  return div ? <div {...props}></div> : <button {...props}></button>
}
