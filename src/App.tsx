import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/Toast/ToastProvider'
import Layout from './components/Layout'
import InventoryPage from './pages/InventoryPage'
import VehicleDetailPage from './pages/VehicleDetailPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<InventoryPage />} />
          <Route path="/vehicle/:id" element={<VehicleDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ToastProvider>
  )
}
