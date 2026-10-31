import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { homePathFor, type Role } from '../api'
import { useAuth } from './authContext'

type RequireAuthProps = {
    roles?: Role[]
    children: ReactNode
}

function RequireAuth({ roles, children }: RequireAuthProps) {
    const { user, loading } = useAuth()

    if (loading) {
        return <p className="page-loading">Duke ngarkuar...</p>
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (roles && !user.role) {
        return <p className="page-loading">Llogaria jote nuk ka rol. Kontakto administratorin.</p>
    }

    if (roles && user.role && !roles.includes(user.role)) {
        return <Navigate to={homePathFor(user.role)} replace />
    }

    return <>{children}</>
}

export default RequireAuth
