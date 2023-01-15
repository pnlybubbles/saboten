import clsx from 'clsx'

interface OwnProps {
  primary?: boolean
}

type Props = React.ComponentPropsWithoutRef<'button'> & OwnProps

export default function Button({ primary = false, className, ...props }: Props) {
  const backgroundColor = toBackgroundColor(primary)
  const foregroundColor = toForegroundColor(primary)

  return (
    <button
      {...props}
      className={clsx(className, 'py-3 px-5 rounded-full border border-black w-full', backgroundColor, foregroundColor)}
    ></button>
  )
}

const toBackgroundColor = (primary: boolean) => (primary ? 'bg-black' : 'bg-white')
const toForegroundColor = (primary: boolean) => (primary ? 'text-white' : 'text-black')
