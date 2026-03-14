import { initialTurn } from 'data/initPosition'
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useState
} from 'react'
import { TPlayer } from 'types/Chess'

const TurnContext = createContext<{
  turn: TPlayer
  setTurn: (player: TPlayer) => void
  toggleTurn: () => void
}>({
  turn: 'w',
  setTurn: () => {},
  toggleTurn: () => {}
})

export const useTurnContext = () => useContext(TurnContext)

export const TurnProvider: FC<PropsWithChildren> = ({ children }) => {
  const [turn, setTurn] = useState<TPlayer>(initialTurn ?? 'w')
  const toggleTurn = () => setTurn((prev) => (prev === 'w' ? 'b' : 'w'))

  return (
    <TurnContext.Provider
      value={{
        turn,
        setTurn,
        toggleTurn
      }}
    >
      {children}
    </TurnContext.Provider>
  )
}
