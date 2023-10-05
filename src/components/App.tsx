import { MainLayout } from 'components/layouts/MainLayout'
import { ChessPage } from 'pages/Chess'
import { TicTacToePage } from 'pages/TicTacToe'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <ChessPage />
  },
  {
    path: '/tictactoe',
    element: <TicTacToePage />
  }
])

const App = () => {
  return (
    <MainLayout>
      <RouterProvider router={router} />
    </MainLayout>
  )
}

export default App
