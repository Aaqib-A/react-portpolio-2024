import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles'
import TimelinePage from './TimelinePage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TimelinePage />
  </StrictMode>,
)
