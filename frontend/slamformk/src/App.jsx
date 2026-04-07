import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AdminRoute, EntryRoute, ProtectedRoute } from './components/RouteGuards'
import AdminPage from './pages/AdminPage'
import ComposePage from './pages/ComposePage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import MySlamsPage from './pages/MySlamsPage'
import SignupPage from './pages/SignupPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<EntryRoute />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/slams"
            element={
              <ProtectedRoute>
                <MySlamsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/slams/new"
            element={
              <ProtectedRoute>
                <ComposePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/slams/:slamId/edit"
            element={
              <ProtectedRoute>
                <ComposePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route path="*" element={<EntryRoute />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
