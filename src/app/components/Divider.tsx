import * as Icon from 'lucide-react'

export default function Divider({ aster = false }: { aster?: boolean }) {
  if (aster) {
    return (
      <div className="grid justify-center py-2">
        <Icon.Asterisk size={20} className="text-zinc-400" />
      </div>
    )
  } else {
    return <div className="border-b border-dashed border-zinc-400" />
  }
}
