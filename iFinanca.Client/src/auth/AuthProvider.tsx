import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { apiRequest, type CurrentUser } from '../api'
import { AuthContext } from './authContext'

function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<CurrentUser | null>(null)
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        const result = await apiRequest<CurrentUser>('/api/account/me')
        const current = result.ok ? result.data : null
        setUser(current)
        setLoading(false)
        return current
    }, [])

    const logout = useCallback(async () => {
        await apiRequest('/api/account/logout', 'POST')
        setUser(null)
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- loads the session once on startup
        void refresh()
    }, [refresh])

    return (
        <AuthContext.Provider value={{ user, loading, refresh, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider
