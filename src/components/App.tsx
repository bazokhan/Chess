import { Board } from './Board'
import { BoardProvider } from 'context/BoardContext'
import { PositionProvider } from 'context/PositionContext'

const App = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-dark-600 text-white">
      <BoardProvider>
        <PositionProvider>
          <Board />
        </PositionProvider>
      </BoardProvider>
    </div>
  )
}

export default App
