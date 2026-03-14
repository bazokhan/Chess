import { ChessPage } from 'pages/Chess'
import { HomePage } from 'pages/Home'
import { TicTacToePage } from 'pages/TicTacToe'
import { RouteErrorBoundary } from 'components/RouteErrorBoundary'
import { RouteObject } from 'react-router-dom'

export const routes: RouteObject[] = [
  { path: '/', element: <HomePage />, errorElement: <RouteErrorBoundary /> },
  {
    path: '/chess',
    element: <ChessPage />,
    errorElement: <RouteErrorBoundary />
  },
  {
    path: '/tictactoe',
    element: <TicTacToePage />,
    errorElement: <RouteErrorBoundary />
  }
]
