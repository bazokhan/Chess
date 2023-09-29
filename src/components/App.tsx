import { TCell } from 'types/Cell'
import { Board } from './Board'
import { Piece } from './Piece'
import { BoardProvider } from 'context/BoardContext'

const position: TCell[] = [
  { square: 'a1', piece: 'wr' },
  { square: 'b1', piece: 'wn' },
  { square: 'c1', piece: 'wb' },
  { square: 'd1', piece: 'wq' },
  { square: 'e1', piece: 'wk' },
  { square: 'f1', piece: 'wb' },
  { square: 'g1', piece: 'wn' },
  { square: 'h1', piece: 'wr' },
  { square: 'a2', piece: 'wp' },
  { square: 'b2', piece: 'wp' },
  { square: 'c2', piece: 'wp' },
  { square: 'd2', piece: 'wp' },
  { square: 'e2', piece: 'wp' },
  { square: 'f2', piece: 'wp' },
  { square: 'g2', piece: 'wp' },
  { square: 'h2', piece: 'wp' },
  { square: 'a8', piece: 'br' },
  { square: 'b8', piece: 'bn' },
  { square: 'c8', piece: 'bb' },
  { square: 'd8', piece: 'bq' },
  { square: 'e8', piece: 'bk' },
  { square: 'f8', piece: 'bb' },
  { square: 'g8', piece: 'bn' },
  { square: 'h8', piece: 'br' },
  { square: 'a7', piece: 'bp' },
  { square: 'b7', piece: 'bp' },
  { square: 'c7', piece: 'bp' },
  { square: 'd7', piece: 'bp' },
  { square: 'e7', piece: 'bp' },
  { square: 'f7', piece: 'bp' },
  { square: 'g7', piece: 'bp' },
  { square: 'h7', piece: 'bp' }
]

const App = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-dark-600 text-white">
      <BoardProvider>
        <Board>
          {position.map((cell) => (
            <Piece key={cell.square} cell={cell} />
          ))}
        </Board>
      </BoardProvider>
    </div>
  )
}

export default App
