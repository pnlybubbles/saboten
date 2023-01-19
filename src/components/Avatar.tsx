interface Props {
  name: string | null
}

export default function Avatar({ name }: Props) {
  return (
    <div className="grid h-10 w-10 items-center justify-items-center rounded-full bg-primary font-bold text-white ">
      {name ? name[0] : '?'}
    </div>
  )
}
