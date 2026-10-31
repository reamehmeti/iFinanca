import { createContext, useContext } from 'react'
import type { CurrentUser } from '../api'

export type AuthState = {
    user: CurrentUser | null
    loading: boolean
    refresh: () => Promise<CurrentUser | null>
    logout: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth() {
    const auth = useContext(AuthContext)

    if (!auth) {
        throw new Error('useAuth must be used inside AuthProvider.')
    }

    return auth
}
