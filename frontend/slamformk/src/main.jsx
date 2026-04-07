import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { startBackendWakeup } from './services/health'

void startBackendWakeup().catch(() => {
  // Let the app continue even if the host is still cold.
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
