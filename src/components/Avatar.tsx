interface Props {
  name: string | null
}

export default function Avatar({ name }: Props) {
  return (
    <div className="w-10 h-10 rounded-full grid items-center justify-items-center font-bold bg-primary text-white ">
      {name ? name[0] : '?'}
    </div>
  )
}
