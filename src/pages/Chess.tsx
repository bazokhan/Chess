import { Board } from '../components/chess/Board'
import { BoardProvider } from 'context/BoardContext'
import { PositionProvider } from 'context/PositionContext'
import { Layout } from '../components/chess/Layout'
import { TurnProvider } from 'context/TurnContext'
import { DebugProvider } from 'context/DebugContext'

export const ChessPage = () => {
  return (
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
  )
}
