import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useState
} from 'react'
import { TCell } from 'types/Cell'

const BoardContext = createContext<{
  activeCell: TCell | null
  setActiveCell: (cell: TCell | null) => void
}>({
  activeCell: null,
  setActiveCell: () => {}
})

export const useBoardContext = () => useContext(BoardContext)

export const BoardProvider: FC<PropsWithChildren> = ({ children }) => {
  const [activeCell, setActiveCell] = useState<TCell | null>(null)
  console.log({ activeCell })
  return (
    <BoardContext.Provider value={{ activeCell, setActiveCell }}>
      {children}
    </BoardContext.Provider>
  )
}
