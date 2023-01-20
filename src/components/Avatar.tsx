import clsx from 'clsx'

interface Props {
  name: string | null
  className?: string
  mini?: boolean
}

export default function Avatar({ name, className, mini }: Props) {
  return (
    <div
      className={clsx(
        'grid h-12 w-12 items-center justify-items-center rounded-full bg-primary text-lg font-bold text-white',
        mini && 'h-10 w-10',
        className,
      )}
    >
      {name ? name[0] : '?'}
    </div>
  )
}
