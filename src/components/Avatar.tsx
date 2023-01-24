import stringToHash from '@/utils/basic/stringToHash'
import clsx from 'clsx'
import { useMemo } from 'react'

interface Props {
  name: string | null
  className?: string
  mini?: boolean | 'xs'
}

export default function Avatar({ name, className, mini }: Props) {
  const hashed = useMemo(() => (name ? stringToHash(name) : null), [name])

  return (
    <div
      className={clsx(
        'grid h-12 w-12 items-center justify-items-center rounded-full text-lg font-bold text-white',
        mini && (mini === 'xs' ? 'h-7 w-7 text-xs' : 'h-10 w-10'),
        hashed !== null ? COLORS[hashed % COLORS.length] : 'bg-zinc-400',
        className,
      )}
    >
      {name ? name[0] : '?'}
    </div>
  )
}

const COLORS = [
  'bg-primary',
  'bg-red-400',
  'bg-orange-400',
  'bg-amber-400',
  'bg-yellow-400',
  'bg-lime-400',
  'bg-green-400',
  'bg-emerald-400',
  'bg-teal-400',
  'bg-cyan-400',
  'bg-sky-400',
  'bg-blue-400',
  'bg-indigo-400',
  'bg-violet-400',
  'bg-purple-400',
  'bg-fuchsia-400',
  'bg-pink-400',
  'bg-rose-400',
]
