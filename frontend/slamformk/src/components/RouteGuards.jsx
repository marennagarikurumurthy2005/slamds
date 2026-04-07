import { Fragment } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import FullScreenLoader from './ui/FullScreenLoader'

export function EntryRoute() {
  const { isBooting, user } = useAuth()

  if (isBooting) {
    return <FullScreenLoader message="Opening MK Slam Collector..." />
  }

  if (!user) {
    return <Navigate replace to="/login" />
  }

  if (user.is_admin) {
    return <Navigate replace to="/admin" />
  }

  return <Navigate replace to="/dashboard" />
}

export function ProtectedRoute({ children }) {
  const { isBooting, user } = useAuth()
  const location = useLocation()

  if (isBooting) {
    return <FullScreenLoader message="Waking up your slam book..." />
  }

  if (!user) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return <Fragment key={user.id ?? user.email}>{children}</Fragment>
}

export function AdminRoute({ children }) {
  const { isBooting, user } = useAuth()

  if (isBooting) {
    return <FullScreenLoader message="Loading the admin panel..." />
  }

  if (!user) {
    return <Navigate replace to="/login" />
  }

  if (!user.is_admin) {
    return <Navigate replace to="/dashboard" />
  }

  return <Fragment key={user.id ?? user.email}>{children}</Fragment>
}
