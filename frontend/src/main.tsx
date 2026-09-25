import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LanguageProvider } from './context/LanguageContext'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { VolumeProvider } from './context/VolumeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <VolumeProvider>
          <App />
        </VolumeProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)
