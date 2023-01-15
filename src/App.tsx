import { useState } from 'react'
import trpc from './utils/trpc'

export default function App() {
  const [state, setState] = useState<string>()

  const handleClick = async () => {
    const data = await trpc.user.name.mutate({ value: 'hello' })
    setState(data.message)
  }

  return (
    <div>
      <h1 className="text-lime-600 font-bold text-6xl">SABOTEN</h1>
      <button onClick={handleClick}>Call API</button>
      <div>{state}</div>
    </div>
  )
}
