import { useState } from 'react'
import trpc from './utils/trpc'

export default function App() {
  const [name, setName] = useState('')
  const [id, setId] = useState<string>()

  const handleClick = async () => {
    const data = await trpc.user.name.mutate({ value: name })
    setId(data.id)
  }

  return (
    <div>
      <h1 className="text-lime-600 font-bold text-6xl">SABOTEN</h1>
      <input type="text" value={name} onChange={(e) => setName(e.currentTarget.value)} />
      <button onClick={handleClick}>Create user</button>
      <div>{id}</div>
    </div>
  )
}
