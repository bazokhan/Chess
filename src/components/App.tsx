import { Board } from './Board'
import { BoardProvider } from 'context/BoardContext'
import { PositionProvider } from 'context/PositionContext'
import { Layout } from './Layout'

const App = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-b from-[#31302c] to-[#51504c] text-white">
      <PositionProvider>
        <BoardProvider>
          <Layout>
            <Board />
          </Layout>
        </BoardProvider>
      </PositionProvider>
    </div>
  )
}

export default App
