import { Board } from './Board'
import { BoardProvider } from 'context/BoardContext'
import { PositionProvider } from 'context/PositionContext'
import { Layout } from './Layout'
import { TurnProvider } from 'context/TurnContext'
import { DebugProvider } from 'context/DebugContext'

const App = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-b from-[#31302c] to-[#51504c] text-white">
      <TurnProvider>
        <PositionProvider>
          <BoardProvider>
            <DebugProvider>
              <Layout>
                <Board />
              </Layout>
            </DebugProvider>
          </BoardProvider>
        </PositionProvider>
      </TurnProvider>
    </div>
  )
}

export default App
