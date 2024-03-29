import { createRoot } from 'react-dom/client'
import App from './App'
import { StrictMode } from 'react'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById('app')!)
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
