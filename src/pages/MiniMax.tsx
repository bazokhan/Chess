import { BoardProvider } from 'context/BoardContext'
import { DebugProvider } from 'context/DebugContext'
import { PositionProvider } from 'context/PositionContext'
import { TurnProvider } from 'context/TurnContext'
import { FC } from 'react'
import { MinimaxChess } from 'components/chess/MinimaxChess'

export const MiniMaxPage: FC = () => {
  return (
    <TurnProvider>
      <PositionProvider>
        <BoardProvider>
          <DebugProvider>
            <MinimaxChess />
          </DebugProvider>
        </BoardProvider>
      </PositionProvider>
    </TurnProvider>
  )
}
