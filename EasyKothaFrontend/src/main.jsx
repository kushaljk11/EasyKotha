import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import './i18n'
import App from './App.jsx'

const updateSW = registerSW({
  immediate: true,
  onOfflineReady() {
    console.info('EasyKotha is ready to work offline.')
  },
  onNeedRefresh() {
    console.info('New EasyKotha version available. Updating now...')
    updateSW(true)
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
