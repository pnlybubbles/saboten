import stringToHash from '@app/util/stringToHash'
import clsx from 'clsx'
import { useMemo } from 'react'

interface Props {
  name: string | null
  className?: string
  mini?: boolean | 'xs'
  noNegative?: boolean
}

const UNKNOWN_NAME = '?'

export default function Avatar({ name, className, mini, noNegative }: Props) {
  const hashed = useMemo(() => (name ? stringToHash(name) : null), [name])

  const head = useMemo(() => {
    if (name === null) return UNKNOWN_NAME
    // 文字列を書記素単位で分割して最初の1つを取り出す
    // 例: "あいうえお" -> "あ", "🌵🍎" -> "🌵", "🏴󠁧󠁢󠁥󠁮󠁧󠁿🇯🇵" -> "🏴󠁧󠁢󠁥󠁮󠁧󠁿"
    const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' })
    return Array.from(segmenter.segment(name))[0]?.segment ?? UNKNOWN_NAME
  }, [name])

  return (
    <div
      className={clsx(
        'grid items-center justify-items-center rounded-full text-lg font-bold',
        mini ? (mini === 'xs' ? 'size-7 text-xs' : 'size-9 text-sm') : 'size-12 text-sm',
        hashed !== null ? COLORS[hashed % COLORS.length] : 'bg-zinc-400 text-zinc-100',
        !noNegative && '-mx-1',
        className,
      )}
    >
      {head}
    </div>
  )
}

const COLORS = [
  'bg-red-400 text-red-100',
  'bg-orange-400 text-orange-100',
  'bg-amber-400 text-amber-100',
  'bg-yellow-400 text-yellow-100',
  'bg-lime-400 text-lime-100',
  'bg-green-400 text-green-100',
  'bg-emerald-400 text-emerald-100',
  'bg-teal-400 text-teal-100',
  'bg-cyan-400 text-cyan-100',
  'bg-sky-400 text-sky-100',
  'bg-blue-400 text-blue-100',
  'bg-indigo-400 text-indigo-100',
  'bg-violet-400 text-violet-100',
  'bg-purple-400 text-purple-100',
  'bg-fuchsia-400 text-fuchsia-100',
  'bg-pink-400 text-pink-100',
  'bg-rose-400 text-rose-100',
]
