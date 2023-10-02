import { FC, PropsWithChildren, createContext, useContext } from 'react'
import { useTurnContext } from './TurnContext'

const DebugContext = createContext<{
  setTurnToWhite: () => void
  setTurnToBlack: () => void
}>({
  setTurnToWhite: () => {},
  setTurnToBlack: () => {}
})

export const useDebugContext = () => useContext(DebugContext)

export const DebugProvider: FC<PropsWithChildren> = ({ children }) => {
  const { setTurn } = useTurnContext()
  const setTurnToWhite = () => setTurn('w')
  const setTurnToBlack = () => setTurn('b')

  return (
    <DebugContext.Provider
      value={{
        setTurnToWhite,
        setTurnToBlack
      }}
    >
      {children}
    </DebugContext.Provider>
  )
}
