import { Board } from '../components/chess/Board'
import { BoardProvider } from 'context/BoardContext'
import { PositionProvider } from 'context/PositionContext'
import { Layout } from '../components/chess/Layout'
import { TurnProvider } from 'context/TurnContext'
import { DebugProvider } from 'context/DebugContext'
import { Seo } from 'components/Seo'

export const ChessPage = () => {
  return (
    <TurnProvider>
      <Seo
        title="Chess Playground | Engine Analysis and Telemetry"
        description="Play chess against the engine, inspect move generation, telemetry, and analysis tools while comparing engine behavior."
        path="/chess"
        keywords="chess playground, chess engine analysis, move generation, telemetry, board evaluation"
      />
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
