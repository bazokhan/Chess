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
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-b from-[#31302c] to-[#51504c] text-white">
      <RouterProvider router={router} />
    </div>
  )
}

export default App
