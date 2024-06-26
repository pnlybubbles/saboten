import clsx from 'clsx'
import logo from '../icon/logo.png'

export default function Logo({ big }: { big?: boolean }) {
  const size = big ? 48 : 36
  return (
    <div className={clsx('grid justify-items-center', big ? 'gap-2 py-6' : 'gap-1 py-2')}>
      <img src={logo} alt="" width={size} height={size} />
      <div className={clsx('font-bold', big ? 'text-lg' : 'text-sm')}>SABOTEN</div>
    </div>
  )
}
