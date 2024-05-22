import { MainLayout } from 'components/layouts/MainLayout'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { routes } from 'routes'

const router = createBrowserRouter(routes)

const App = () => {
  return (
    <MainLayout>
      <RouterProvider router={router} />
    </MainLayout>
  )
}

export default App
