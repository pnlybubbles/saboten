import clsx from 'clsx'

export default function Logo({ big }: { big?: boolean }) {
  return (
    <div
      className={clsx(
        'w-min bg-zinc-950 px-[1em] text-[1em] font-bold leading-[1em] text-white',
        big ? 'my-3 origin-left scale-150' : 'my-2',
      )}
    >
      SABOTEN
    </div>
  )
}
