import { Link, useNavigate } from 'react-router-dom'
import { homePathFor, ROLE_LABELS } from '../api'
import { useAuth } from '../auth/authContext'

function AppHeader() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    async function handleLogout() {
        await logout()
        navigate('/login', { replace: true })
    }

    return (
        <header className="app-header">
            <Link to={homePathFor(user?.role ?? null)} className="app-brand">
                <span className="brand-icon brand-icon-small">i</span>
                iFinanca
            </Link>

            <div className="app-header-actions">
                {user && (
                    <span className="app-user">
                        {user.email}
                        {user.role && <span className="role-badge">{ROLE_LABELS[user.role]}</span>}
                    </span>
                )}
                {user?.role !== 'Admin' && (
                    <Link to="/account/password" className="button-secondary">
                        Ndrysho fjalëkalimin
                    </Link>
                )}
                <button type="button" className="button-secondary" onClick={handleLogout}>
                    Dil
                </button>
            </div>
        </header>
    )
}

export default AppHeader
