import { createContext, useContext, useState, type ReactNode } from 'react'

interface VolumeContextType {
  volume: number
  setVolume: (volume: number) => void
}

const VolumeContext = createContext<VolumeContextType | undefined>(undefined)

export function VolumeProvider({ children }: { children: ReactNode }) {
  const [volume, setVolume] = useState<number>(1) // 1 = 100% por defecto

  return (
    <VolumeContext.Provider value={{ volume, setVolume }}>
      {children}
    </VolumeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useVolume() {
  const context = useContext(VolumeContext)
  if (context === undefined) {
    throw new Error('useVolume debe usarse dentro de un VolumeProvider')
  }
  return context
}