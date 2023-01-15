import { useState } from 'react'
import { affixBearerToken } from './utils/bearer'
import { ANON_JWT } from './utils/constant'

export default function App() {
  const [state, setState] = useState<string>()

  const handleClick = async () => {
    const res = await fetch('http://localhost:54321/functions/v1/', {
      method: 'POST',
      headers: {
        Authorization: affixBearerToken(ANON_JWT),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'Functions' }),
    })
    const data = (await res.json()) as { message: string }
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
