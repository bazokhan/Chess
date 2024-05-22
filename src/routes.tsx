import { ChessPage } from 'pages/Chess'
import { HomePage } from 'pages/Home'
import { MiniMaxPage } from 'pages/MiniMax'
import { TicTacToePage } from 'pages/TicTacToe'

export const routes = [
  { path: '/', element: <HomePage /> },
  {
    path: '/chess',
    element: <ChessPage />
  },
  {
    path: '/tictactoe',
    element: <TicTacToePage />
  },
  {
    path: '/minimax',
    element: <MiniMaxPage />
  }
]
