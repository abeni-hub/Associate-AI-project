import { RouterProvider } from 'react-router'
import { portalRouter } from './routing/portalRouter.jsx'
import './App.css'

function App() {
  return <RouterProvider router={portalRouter} />
}

export default App
