
import type React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  console.log("ProtectedRoute: loading=", loading, "user=", user)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    console.log("ProtectedRoute: User is not authenticated, redirecting to login.")
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}